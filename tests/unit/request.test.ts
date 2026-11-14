import { afterEach, describe, expect, it, vi } from "vitest";
import { ipFromHeaders } from "@/lib/request";

const h = (values: Record<string, string>) => new Headers(values);

describe("client IP", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("ignores a forged left-most X-Forwarded-For entry", () => {
    vi.stubEnv("VERCEL", "");
    expect(ipFromHeaders(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("counts the configured number of proxies from the right", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");
    expect(ipFromHeaders(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9, 10.0.0.2" }))).toBe("203.0.113.9");
  });

  it("uses the edge's x-real-ip on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    expect(ipFromHeaders(h({ "x-forwarded-for": "6.6.6.6", "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("falls back to unknown", () => {
    vi.stubEnv("VERCEL", "");
    expect(ipFromHeaders(h({}))).toBe("unknown");
  });
});
