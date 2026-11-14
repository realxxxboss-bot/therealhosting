import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/**
 * One database handle for the whole app.
 *
 * - `DATABASE_URL` set: real Postgres through postgres.js. Pending migrations are applied
 *   once when the app starts (or by hand with `npm run db:migrate`).
 * - `DATABASE_URL` not set: an in-process Postgres (PGlite) that is migrated and filled
 *   with sample data on first use. This is what local development, the tests and the
 *   sample-data preview run on. Its data is lost when the process stops.
 *
 * Both paths run the same SQL through the same Drizzle schema.
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

export { schema };

export const migrationsFolder = path.join(process.cwd(), "drizzle");

const MIGRATION_LOCK = 727274;

const globalForDb = globalThis as unknown as { __zaffreDatabase?: Promise<Database> };

export function usesSampleDatabase(): boolean {
  return !process.env.DATABASE_URL;
}

async function connect(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const [{ drizzle }, { default: postgres }] = await Promise.all([import("drizzle-orm/postgres-js"), import("postgres")]);
    if (process.env.DATABASE_AUTO_MIGRATE !== "false") {
      // Bring the schema up to date before the first query. One connection holds a
      // Postgres advisory lock while it works, so several copies starting together
      // apply each migration once.
      const { migrate } = await import("drizzle-orm/postgres-js/migrator");
      // A pooled connection (Neon's default) can't hold a session-level lock, so use the direct one when given.
      const migrator = postgres(process.env.DATABASE_URL_UNPOOLED || url, { max: 1, onnotice: () => {} });
      try {
        await migrator`select pg_advisory_lock(${MIGRATION_LOCK})`;
        await migrate(drizzle(migrator), { migrationsFolder });
      } finally {
        await migrator`select pg_advisory_unlock(${MIGRATION_LOCK})`.catch(() => {});
        await migrator.end();
      }
    }
    const client = postgres(url, { max: Number(process.env.DATABASE_POOL_MAX ?? 10), prepare: false });
    const database = drizzle(client, { schema }) as unknown as Database;
    const { bootstrapDatabase } = await import("./bootstrap");
    await bootstrapDatabase(database);
    return database;
  }
  if (process.env.ADAPTER_MODE === "live") {
    throw new Error("DATABASE_URL must be set when ADAPTER_MODE=live.");
  }
  return createSampleDatabase();
}

/** A fresh in-process database with the schema applied and, by default, the sample data loaded. */
export async function createSampleDatabase(options: { seed?: boolean; now?: number } = {}): Promise<Database> {
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);
  const database = drizzle(new PGlite(), { schema });
  await migrate(database, { migrationsFolder });
  const handle = database as unknown as Database;
  if (options.seed !== false) {
    const { seedDatabase } = await import("./seed");
    await seedDatabase(handle, options.now ?? Date.now());
  }
  return handle;
}

export function getDb(): Promise<Database> {
  if (!globalForDb.__zaffreDatabase) {
    const pending = connect();
    globalForDb.__zaffreDatabase = pending;
    // A failed start (database briefly unreachable) must not be remembered forever.
    pending.catch(() => {
      if (globalForDb.__zaffreDatabase === pending) globalForDb.__zaffreDatabase = undefined;
    });
  }
  return globalForDb.__zaffreDatabase;
}
