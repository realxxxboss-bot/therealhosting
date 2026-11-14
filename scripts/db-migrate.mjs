// Applies pending SQL migrations from ./drizzle to the database.
// Run at deploy time: `npm run db:migrate`. Safe to run again; applied files are skipped.
//
// Uses DATABASE_URL_UNPOOLED when set (Neon's direct connection): a pooled connection can't
// hold the session-level advisory lock below. The lock is the same one the app takes when it
// migrates on start (src/lib/db/index.ts), so the two never run at the same time.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const MIGRATION_LOCK = 727274;
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Nothing to migrate.");
  process.exit(1);
}

const client = postgres(url, { max: 1, onnotice: () => {} });
try {
  await client`select pg_advisory_lock(${MIGRATION_LOCK})`;
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("Database is up to date.");
} finally {
  await client`select pg_advisory_unlock(${MIGRATION_LOCK})`.catch(() => {});
  await client.end();
}
