import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, schema as t, type Database, type Tx } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { appUrl } from "@/lib/request";
import { hashToken, newToken } from "./secrets";

export const RESET_LINK_MINUTES = 30;
export const WELCOME_LINK_DAYS = 7;
export const INVITE_LINK_DAYS = 7;

/** Creates a one-time "choose a password" link for a user. Only the token's hash is stored. */
export async function createPasswordLink(userId: string, validForMs: number, tx?: Database | Tx): Promise<string> {
  const db = tx ?? (await getDb());
  const token = newToken();
  await db.insert(t.passwordResets).values({
    id: newId("rst"),
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + validForMs).toISOString(),
  });
  return appUrl(`/reset-password/${token}`);
}

/** The unused, unexpired link row for a token, or null. */
export async function findPasswordLink(token: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(t.passwordResets)
    .where(and(eq(t.passwordResets.tokenHash, hashToken(token)), isNull(t.passwordResets.usedAt), gt(t.passwordResets.expiresAt, new Date().toISOString())));
  return row ?? null;
}

export function inviteUrl(token: string): string {
  return appUrl(`/invite/${token}`);
}
