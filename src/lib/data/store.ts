import "server-only";
import { createSeed, type Db } from "./seed";

/**
 * Phase 1 demo store: in memory, seeded on first use, reset when the server restarts.
 * Phase 2 replaces this with Postgres (Drizzle) behind the same data-access functions.
 */
const globalForStore = globalThis as unknown as { __zaffreDb?: Db };

export function db(): Db {
  if (!globalForStore.__zaffreDb) {
    globalForStore.__zaffreDb = createSeed(Date.now());
  }
  return globalForStore.__zaffreDb;
}

export function nextId(prefix: string): string {
  const store = db();
  store.counters.id += 1;
  return `${prefix}_${store.counters.id}`;
}
