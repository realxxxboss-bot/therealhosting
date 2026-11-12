import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { createPasswordLink, findPasswordLink } from "@/lib/auth/links";
import { decrypt, encrypt, hashToken, newToken } from "@/lib/auth/secrets";
import { base32Decode, base32Encode, generateTotpSecret, totpCode, totpUri, verifyTotp } from "@/lib/auth/totp";
import { bootstrapDatabase } from "@/lib/db/bootstrap";
import { createSampleDatabase, schema as t, type Database } from "@/lib/db";
import { renderInvoicePdf } from "@/lib/invoice-pdf";
import { rateLimit } from "@/lib/rate-limit";

let db: Database;

beforeAll(async () => {
  db = await createSampleDatabase({ now: Date.parse("2026-11-11T12:00:00Z") });
  (globalThis as unknown as { __zaffreDatabase?: Promise<Database> }).__zaffreDatabase = Promise.resolve(db);
}, 60_000);

describe("TOTP (RFC 6238)", () => {
  // Test vectors from RFC 6238 appendix B (SHA-1, secret "12345678901234567890"), last 6 digits.
  const secret = base32Encode(Buffer.from("12345678901234567890"));

  it("matches the RFC test vectors", () => {
    expect(totpCode(secret, 59_000)).toBe("287082");
    expect(totpCode(secret, 1111111109_000)).toBe("081804");
    expect(totpCode(secret, 1234567890_000)).toBe("005924");
    expect(totpCode(secret, 2000000000_000)).toBe("279037");
  });

  it("accepts one step of clock drift and nothing further", () => {
    const now = 1234567890_000;
    expect(verifyTotp(secret, totpCode(secret, now), now)).toBe(true);
    expect(verifyTotp(secret, totpCode(secret, now - 30_000), now)).toBe(true);
    expect(verifyTotp(secret, totpCode(secret, now + 30_000), now)).toBe(true);
    expect(verifyTotp(secret, totpCode(secret, now - 90_000), now)).toBe(false);
    expect(verifyTotp(secret, "12345", now)).toBe(false);
    expect(verifyTotp(secret, "abcdef", now)).toBe(false);
  });

  it("round-trips base32 and builds an authenticator link", () => {
    const fresh = generateTotpSecret();
    expect(fresh).toMatch(/^[A-Z2-7]{32}$/);
    expect(base32Encode(base32Decode(fresh))).toBe(fresh);
    expect(totpUri(fresh, "a@example.com", "Zaffre")).toContain(`secret=${fresh}`);
  });
});

describe("secrets", () => {
  it("encrypts and decrypts, and rejects tampering", () => {
    const sealed = encrypt("JBSWY3DPEHPK3PXP");
    expect(sealed).not.toContain("JBSWY3DPEHPK3PXP");
    expect(decrypt(sealed)).toBe("JBSWY3DPEHPK3PXP");
    expect(encrypt("same")).not.toBe(encrypt("same"));
    const parts = sealed.split(".");
    parts[3] = Buffer.from("tampered").toString("base64url");
    expect(decrypt(parts.join("."))).toBeNull();
    expect(decrypt("plain text")).toBeNull();
  });

  it("makes long random tokens and stable hashes", () => {
    const token = newToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(newToken()).not.toBe(token);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toContain(token);
  });
});

describe("password links", () => {
  it("stores only a hash, and finds the link until it is used or expired", async () => {
    const url = await createPasswordLink("usr_owner", 60_000);
    const token = url.split("/").pop()!;
    const rows = await db.select().from(t.passwordResets).where(eq(t.passwordResets.userId, "usr_owner"));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokenHash).not.toBe(token);
    expect((await findPasswordLink(token))?.userId).toBe("usr_owner");
    expect(await findPasswordLink("not-the-token-not-the-token-not")).toBeNull();

    await db.update(t.passwordResets).set({ usedAt: new Date().toISOString() }).where(eq(t.passwordResets.id, rows[0]!.id));
    expect(await findPasswordLink(token)).toBeNull();

    const expired = await createPasswordLink("usr_owner", -1000);
    expect(await findPasswordLink(expired.split("/").pop()!)).toBeNull();
  });
});

describe("rate limit", () => {
  it("allows up to the limit in a window, then blocks", async () => {
    const key = `test:${newToken()}`;
    for (let i = 0; i < 3; i++) expect((await rateLimit(key, 3, 60_000)).ok).toBe(true);
    const blocked = await rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect((await rateLimit(`test:${newToken()}`, 3, 60_000)).ok).toBe(true);
  });
});

describe("first start", () => {
  it("creates the first admin on an empty database and does nothing afterwards", async () => {
    const empty = await createSampleDatabase({ seed: false });
    process.env.ADMIN_EMAIL = "Boss@Example.com";
    try {
      await bootstrapDatabase(empty);
      await bootstrapDatabase(empty);
    } finally {
      delete process.env.ADMIN_EMAIL;
    }
    const users = await empty.select().from(t.users);
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({ email: "boss@example.com", isAdmin: true, passwordHash: null });
    expect(await empty.select().from(t.passwordResets)).toHaveLength(1);
    expect((await empty.select().from(t.emailTemplates)).length).toBeGreaterThan(0);
  });
});

describe("invoice PDF", () => {
  it("renders a PDF for a sample invoice", async () => {
    const [invoice] = await db.select().from(t.invoices).where(eq(t.invoices.accountId, "acc_uk"));
    const bytes = await renderInvoicePdf({ ...invoice!, notes: "Thanks — ünïcödé ✓ note" }, { name: "UK client", billingEmail: "billing@ukclient.example", country: "United Kingdom" });
    expect(Buffer.from(bytes.subarray(0, 5)).toString()).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(1000);
  });
});
