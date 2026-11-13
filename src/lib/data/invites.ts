import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { hashToken } from "@/lib/auth/secrets";
import { getDb, schema as t } from "@/lib/db";

// Lives outside the "use server" action files so it can never be called as a public endpoint.
/** The pending invite for an emailed token, with the account name, or null. */
export async function findInvite(token: string) {
  const db = await getDb();
  const [row] = await db
    .select({ invite: t.invites, accountName: t.accounts.name })
    .from(t.invites)
    .innerJoin(t.accounts, eq(t.accounts.id, t.invites.accountId))
    .where(and(eq(t.invites.tokenHash, hashToken(token)), gt(t.invites.expiresAt, new Date().toISOString())));
  if (!row) return null;
  const [existing] = await db.select({ id: t.users.id }).from(t.users).where(eq(t.users.email, row.invite.email));
  return { email: row.invite.email, role: row.invite.role, accountName: row.accountName, hasAccount: Boolean(existing) };
}
