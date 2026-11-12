import "server-only";
import { lt, sql } from "drizzle-orm";
import { getDb, schema as t } from "@/lib/db";

/**
 * Fixed-window rate limiter stored in Postgres, so a limit holds across every running
 * copy of the app. One atomic upsert per check.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; retryAfterSec: number }> {
  const now = Date.now();
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs).toISOString();
  const db = await getDb();
  const [row] = await db
    .insert(t.rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({ target: [t.rateLimits.key, t.rateLimits.windowStart], set: { count: sql`${t.rateLimits.count} + 1` } })
    .returning({ count: t.rateLimits.count });

  // Old windows are never read again. Clear them now and then instead of running a separate job.
  if (Math.random() < 0.02) {
    await db.delete(t.rateLimits).where(lt(t.rateLimits.windowStart, new Date(now - 86_400_000).toISOString()));
  }

  const count = row?.count ?? 1;
  if (count > limit) return { ok: false, retryAfterSec: Math.max(1, Math.ceil((windowStartMs + windowMs - now) / 1000)) };
  return { ok: true, retryAfterSec: 0 };
}
