import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/data/store";
import type { Account, Membership, User } from "@/lib/data/types";
import { sign, verify } from "./token";

const SESSION_COOKIE = "zf_session";
const PENDING_2FA_COOKIE = "zf_2fa";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

interface SessionPayload {
  uid: string;
  /** Account currently selected in the dashboard. */
  acc?: string;
  /** Admin user id when an admin is signed in as a client. */
  imp?: string;
  exp: number;
}

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV !== "production") return "development-only-session-secret-change-me";
  // The sample-data preview holds no real accounts and its demo sign-ins are public,
  // so it may run without a secret. Live mode never falls back.
  if (process.env.ADAPTER_MODE !== "live") return "sample-data-preview-session-secret-not-for-live";
  throw new Error("SESSION_SECRET must be set to at least 32 characters.");
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function writeSession(payload: Omit<SessionPayload, "exp">): Promise<void> {
  const jar = await cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  jar.set(SESSION_COOKIE, sign({ ...payload, exp }, secret()), { ...cookieOptions, maxAge: SESSION_TTL_SEC });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(PENDING_2FA_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  // Session checks depend on the request and the clock, so they always run at request time.
  await connection();
  const jar = await cookies();
  const payload = verify<SessionPayload>(jar.get(SESSION_COOKIE)?.value, secret());
  if (!payload || payload.exp < Date.now() / 1000) return null;
  return payload;
}

export async function setPendingTwoFactor(uid: string): Promise<void> {
  const jar = await cookies();
  const exp = Math.floor(Date.now() / 1000) + 600;
  jar.set(PENDING_2FA_COOKIE, sign({ uid, exp }, secret()), { ...cookieOptions, maxAge: 600 });
}

export async function readPendingTwoFactor(): Promise<string | null> {
  await connection();
  const jar = await cookies();
  const payload = verify<{ uid: string; exp: number }>(jar.get(PENDING_2FA_COOKIE)?.value, secret());
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
}

/** Current client viewer, or redirect to sign-in. Every dashboard query starts here (tenant isolation). */
export async function requireViewer(): Promise<Viewer> {
  const session = await readSession();
  if (!session) redirect("/sign-in");
  const store = db();
  const user = store.users.find((u) => u.id === session.uid);
  if (!user) redirect("/sign-in");
  const memberships = store.memberships.filter((m) => m.userId === user.id);
  if (memberships.length === 0) redirect(user.isAdmin ? "/admin" : "/sign-in");
  const membership = memberships.find((m) => m.accountId === session.acc) ?? memberships[0]!;
  const account = store.accounts.find((a) => a.id === membership.accountId);
  if (!account) redirect("/sign-in");
  const accounts = store.accounts.filter((a) => memberships.some((m) => m.accountId === a.id));
  const impersonator = session.imp ? (store.users.find((u) => u.id === session.imp && u.isAdmin) ?? null) : null;
  return { user, account, membership, accounts, impersonator };
}

/** Current admin, or redirect. While impersonating, admin pages are not available. */
export async function requireAdmin(): Promise<User> {
  const session = await readSession();
  if (!session) redirect("/sign-in");
  if (session.imp) redirect("/dashboard");
  const user = db().users.find((u) => u.id === session.uid);
  if (!user?.isAdmin) redirect("/dashboard");
  return user;
}
