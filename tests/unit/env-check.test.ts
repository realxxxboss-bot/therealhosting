import { describe, expect, it } from "vitest";
import { checkEnv } from "@/lib/env-check";

const messages = (env: Record<string, string>) => checkEnv(env).map((p) => `${p.level}: ${p.message}`);

describe("startup settings check", () => {
  it("is quiet for local development on the sample database", () => {
    expect(checkEnv({ NODE_ENV: "development" })).toEqual([]);
  });

  it("flags a short session secret with a real database", () => {
    expect(messages({ DATABASE_URL: "postgres://x", SESSION_SECRET: "short" }).join()).toMatch(/error: SESSION_SECRET/);
  });

  it("flags missing email in production with a real database", () => {
    expect(messages({ NODE_ENV: "production", DATABASE_URL: "postgres://x", SESSION_SECRET: "x".repeat(40), NEXT_PUBLIC_SITE_URL: "https://zaffrehost.com" }).join()).toMatch(/RESEND_API_KEY/);
  });

  it("flags a half-configured provider without printing values", () => {
    const out = messages({ COOLIFY_API_URL: "https://secret-host.example" }).join();
    expect(out).toMatch(/Coolify is half configured. Missing: COOLIFY_API_TOKEN/);
    expect(out).not.toContain("secret-host");
  });
});
