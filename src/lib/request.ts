import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";

/** Best-effort client IP for rate limiting and audit logs. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Current time for a request. Waits for the request first so the value is never baked into a
 * prerendered page (cacheComponents), and keeps impure calls out of component bodies.
 */
export async function requestTime(): Promise<number> {
  await connection();
  return Date.now();
}
