import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** Time-based one-time passwords (RFC 6238): SHA-1, 6 digits, 30-second steps. Works with every authenticator app. */
const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of clean) {
    value = (value << 5) | BASE32.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpCode(secret: string, timeMs: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(timeMs / 1000 / STEP_SECONDS)));
  const mac = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = mac[mac.length - 1]! & 15;
  const binary = ((mac[offset]! & 127) << 24) | (mac[offset + 1]! << 16) | (mac[offset + 2]! << 8) | mac[offset + 3]!;
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

/** Accepts the current code and one step either side, to allow for clock drift. */
export function verifyTotp(secret: string, code: string, timeMs: number = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const given = Buffer.from(code);
  let ok = false;
  for (const drift of [-1, 0, 1]) {
    const expected = Buffer.from(totpCode(secret, timeMs + drift * STEP_SECONDS * 1000));
    if (timingSafeEqual(given, expected)) ok = true;
  }
  return ok;
}

/** Link that authenticator apps understand (also what a QR code would contain). */
export function totpUri(secret: string, accountLabel: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

/** Shows a secret in groups of four so it is easy to type. */
export function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}
