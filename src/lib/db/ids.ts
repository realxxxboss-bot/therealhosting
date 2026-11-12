import { randomBytes } from "node:crypto";

const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";

/** Prefixed random id, for example `site_4k9d2m7q1xw8`. 60 bits of randomness. */
export function newId(prefix: string): string {
  const bytes = randomBytes(12);
  let out = "";
  for (const byte of bytes) out += alphabet[byte & 31];
  return `${prefix}_${out}`;
}
