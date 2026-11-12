import { sql } from "drizzle-orm";
import type { Database, Tx } from "./index";

/** The two drivers return raw query results in different shapes; this reads either. */
function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  return ((result as { rows?: Record<string, unknown>[] }).rows ?? []) as Record<string, unknown>[];
}

const allowed = new Set(["invoice_number_seq"]);

export async function nextSequenceValue(db: Database | Tx, sequence: string): Promise<number> {
  if (!allowed.has(sequence)) throw new Error(`Unknown sequence ${sequence}`);
  const result = await db.execute(sql`select nextval(${sequence}::regclass) as n`);
  return Number(rowsOf(result)[0]?.n);
}
