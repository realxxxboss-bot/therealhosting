// Applies pending SQL migrations from ./drizzle to the database in DATABASE_URL.
// Run at deploy time: `npm run db:migrate`. Safe to run again; applied files are skipped.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Nothing to migrate.");
  process.exit(1);
}

const client = postgres(url, { max: 1 });
try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("Database is up to date.");
} finally {
  await client.end();
}
