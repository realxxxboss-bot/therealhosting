import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

/**
 * Password hashing with scrypt (built into Node, no native add-on to compile).
 * Stored format: `scrypt$N$r$p$salt$hash`, so the cost can be raised later
 * and old hashes still verify.
 */
const N = 32768;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, n: number, r: number, p: number, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password.normalize("NFKC"), salt, length, { N: n, r, p, maxmem: 128 * n * r * 2 }, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P, KEY_LENGTH);
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  try {
    const key = await derive(password, Buffer.from(salt, "base64url"), Number(n), Number(r), Number(p), expected.length);
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/** Shared rule for every place a password is chosen. */
export const MIN_PASSWORD_LENGTH = 10;
