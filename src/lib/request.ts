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

/**
 * Public base address used in emailed links. Taken from configuration, never from the
 * request's Host header, so a forged header cannot point a reset link at another site.
 */
export function appUrl(path = ""): string {
  const base =
    process.env.APP_URL ??
    (process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
