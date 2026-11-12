import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";

/** The one app secret. Signs cookies and (through HKDF) derives the key that encrypts TOTP secrets. */
export function appSecret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV !== "production") return "development-only-session-secret-change-me";
  // The sample-data preview holds no real accounts and its demo sign-ins are public,
  // so it may run without a secret. A real database never falls back.
  if (!process.env.DATABASE_URL && process.env.ADAPTER_MODE !== "live") return "sample-data-preview-session-secret-not-for-live";
  throw new Error("SESSION_SECRET must be set to at least 32 characters.");
}

/** Random URL-safe token for emailed links and session cookies (256 bits). */
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Tokens are stored only as SHA-256 hashes, so a database leak does not expose working links. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

function encryptionKey(): Buffer {
  return Buffer.from(hkdfSync("sha256", appSecret(), "zaffre", "totp-secret-v1", 32));
}

/** AES-256-GCM. Output: `v1.iv.tag.ciphertext`, all base64url. */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function decrypt(sealed: string): string | null {
  const [version, iv, tag, data] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || !data) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
