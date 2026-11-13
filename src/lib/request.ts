import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";

/**
 * Client IP for rate limiting, sign-in records and audit logs.
 *
 * The left-most `X-Forwarded-For` entry is whatever the visitor sent, so it can be forged.
 * Each proxy appends the address it saw, so we count from the right instead:
 * `TRUSTED_PROXY_HOPS` is how many proxies we run in front of the app (default 1:
 * Vercel's edge, or Traefik on our own server). On Vercel, `x-real-ip` is set by the edge itself.
 */
export function ipFromHeaders(h: Pick<Headers, "get">): string {
  if (process.env.VERCEL && h.get("x-real-ip")) return h.get("x-real-ip")!;
  const hops = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS ?? 1) || 1);
  const chain = (h.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return chain[chain.length - hops] ?? chain[0] ?? h.get("x-real-ip") ?? "unknown";
}

export async function clientIp(): Promise<string> {
  return ipFromHeaders(await headers());
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
