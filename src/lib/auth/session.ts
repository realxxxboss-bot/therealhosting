import "server-only";
import { and, eq, gt, inArray } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { fromRow, userColumns } from "@/lib/data/rows";
import type { Account, Membership, User } from "@/lib/data/types";
import { getDb, schema as t, usesSampleDatabase } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { appSecret, hashToken, newToken } from "./secrets";
import { sign, verify } from "./token";

const SESSION_COOKIE = "zf_session";
const PENDING_2FA_COOKIE = "zf_2fa";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;
/** How often a session's "last active" time is refreshed. */
const TOUCH_AFTER_MS = 5 * 60_000;

export interface SessionPayload {
  /** Acting user. While an admin is signed in as a client, this is the client. */
  uid: string;
  /** Random session token. Its SHA-256 identifies the row in `sessions`. */
  tok: string;
  /** Account currently selected in the dashboard. */
  acc?: string;
  /** Admin user id when an admin is signed in as a client. */
  imp?: string;
  exp: number;
}

export type Session = SessionPayload & {
  /** Row id in `sessions`. Missing only in the sample-data preview, where sessions may be stateless. */
  sessionId?: string;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Chrome\//.test(userAgent) ? "Chrome" : /Firefox\//.test(userAgent) ? "Firefox" : /Safari\//.test(userAgent) ? "Safari" : "Browser";
  const os = /Windows/.test(userAgent) ? "Windows" : /iPhone|iPad/.test(userAgent) ? "iOS" : /Mac OS X/.test(userAgent) ? "macOS" : /Android/.test(userAgent) ? "Android" : /Linux/.test(userAgent) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

async function setCookie(payload: SessionPayload): Promise<void> {
  const jar = await cookies();
  const maxAge = Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
  jar.set(SESSION_COOKIE, sign(payload, appSecret()), { ...cookieOptions, maxAge });
}

/** Starts a new signed-in session for a user and sets the cookie. */
export async function createSession(input: { uid: string; acc?: string }): Promise<void> {
  const tok = newToken();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const h = await headers();
  const db = await getDb();
  await db.insert(t.sessions).values({
    id: newId("ses"),
    userId: input.uid,
    tokenHash: hashToken(tok),
    accountId: input.acc,
    device: describeDevice(h.get("user-agent")),
    location: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "",
    expiresAt: new Date(exp * 1000).toISOString(),
  });
  await setCookie({ uid: input.uid, tok, acc: input.acc, exp });
}

/** Changes who the current session acts as (account switch, admin "sign in as client"). */
export async function updateSession(session: Session, change: { uid?: string; acc?: string | null; imp?: string | null }): Promise<void> {
  const next: SessionPayload = {
    uid: change.uid ?? session.uid,
    tok: session.tok,
    acc: change.acc === null ? undefined : (change.acc ?? session.acc),
    imp: change.imp === null ? undefined : (change.imp ?? session.imp),
    exp: session.exp,
  };
  const db = await getDb();
  await db
    .update(t.sessions)
    .set({ userId: next.uid, accountId: next.acc ?? null, impersonatorId: next.imp ?? null })
    .where(eq(t.sessions.tokenHash, hashToken(session.tok)));
  await setCookie(next);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const payload = verify<SessionPayload>(jar.get(SESSION_COOKIE)?.value, appSecret());
  if (payload?.tok) {
    const db = await getDb();
    await db.delete(t.sessions).where(eq(t.sessions.tokenHash, hashToken(payload.tok)));
  }
  jar.delete(SESSION_COOKIE);
  jar.delete(PENDING_2FA_COOKIE);
}

/** Signs a user out everywhere, for example after a password change. */
export async function deleteUserSessions(userId: string, exceptTokenHash?: string): Promise<void> {
  const db = await getDb();
  const rows = await db.select({ id: t.sessions.id, tokenHash: t.sessions.tokenHash }).from(t.sessions).where(eq(t.sessions.userId, userId));
  const ids = rows.filter((r) => r.tokenHash !== exceptTokenHash).map((r) => r.id);
  if (ids.length > 0) await db.delete(t.sessions).where(inArray(t.sessions.id, ids));
}

export async function readSession(): Promise<Session | null> {
  // Session checks depend on the request and the clock, so they always run at request time.
  await connection();
  const jar = await cookies();
  const payload = verify<SessionPayload>(jar.get(SESSION_COOKIE)?.value, appSecret());
  if (!payload?.tok || payload.exp < Date.now() / 1000) return null;

  const db = await getDb();
  const now = new Date();
  const [row] = await db
    .select()
    .from(t.sessions)
    .where(and(eq(t.sessions.tokenHash, hashToken(payload.tok)), gt(t.sessions.expiresAt, now.toISOString())));

  // The sample-data preview may run as several short-lived copies, each with its own
  // in-process database, so the signed cookie is the source of truth there. With a real
  // database the row must exist: deleting it signs the device out at once.
  if (usesSampleDatabase()) return { ...payload, sessionId: row?.id };
  if (!row) return null;
  if (now.getTime() - new Date(row.lastActiveAt).getTime() > TOUCH_AFTER_MS) {
    await db.update(t.sessions).set({ lastActiveAt: now.toISOString() }).where(eq(t.sessions.id, row.id));
  }
  // The row is the source of truth for who the session acts as.
  return { uid: row.userId, tok: payload.tok, acc: row.accountId ?? undefined, imp: row.impersonatorId ?? undefined, exp: payload.exp, sessionId: row.id };
}

export async function setPendingTwoFactor(uid: string): Promise<void> {
  const jar = await cookies();
  const exp = Math.floor(Date.now() / 1000) + 600;
  jar.set(PENDING_2FA_COOKIE, sign({ uid, exp }, appSecret()), { ...cookieOptions, maxAge: 600 });
}

export async function readPendingTwoFactor(): Promise<string | null> {
  await connection();
  const jar = await cookies();
  const payload = verify<{ uid: string; exp: number }>(jar.get(PENDING_2FA_COOKIE)?.value, appSecret());
  if (!payload || payload.exp < Date.now() / 1000) return null;
  return payload.uid;
}

export async function clearPendingTwoFactor(): Promise<void> {
  (await cookies()).delete(PENDING_2FA_COOKIE);
}

export interface Viewer {
  user: User;
  account: Account;
  membership: Membership;
  /** All accounts this user belongs to (for the account switcher). */
  accounts: Account[];
  /** Set when an admin is acting as this client. */
  impersonator: User | null;
  /** Row id of the current session, used to mark "this device". */
  sessionId?: string;
}

export async function findUser(userId: string): Promise<User | null> {
  const db = await getDb();
  const [user] = await db.select(userColumns).from(t.users).where(eq(t.users.id, userId));
  return user ?? null;
}

/** Current client viewer, or redirect to sign-in. Every dashboard query starts here (tenant isolation). */
export async function requireViewer(): Promise<Viewer> {
  const session = await readSession();
  if (!session) redirect("/sign-in");
  const user = await findUser(session.uid);
  if (!user) redirect("/sign-in");
  const db = await getDb();
  const rows = await db
    .select({ membership: t.memberships, account: t.accounts })
    .from(t.memberships)
    .innerJoin(t.accounts, eq(t.accounts.id, t.memberships.accountId))
    .where(eq(t.memberships.userId, user.id))
    .orderBy(t.memberships.createdAt);
  if (rows.length === 0) redirect(user.isAdmin ? "/admin" : "/sign-in");
  const current = rows.find((r) => r.membership.accountId === session.acc) ?? rows[0]!;
  const impersonatorUser = session.imp ? await findUser(session.imp) : null;
  return {
    user,
    account: fromRow<Account>(current.account),
    membership: current.membership,
    accounts: rows.map((r) => fromRow<Account>(r.account)),
    impersonator: impersonatorUser?.isAdmin ? impersonatorUser : null,
    sessionId: session.sessionId,
  };
}

/** Current admin, or redirect. While impersonating, admin pages are not available. */
export async function requireAdmin(): Promise<User> {
  const session = await readSession();
  if (!session) redirect("/sign-in");
  if (session.imp) redirect("/dashboard");
  const user = await findUser(session.uid);
  if (!user?.isAdmin) redirect("/dashboard");
  return user;
}
