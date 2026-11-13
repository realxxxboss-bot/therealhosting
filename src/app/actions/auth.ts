"use server";

import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdapters } from "@/lib/adapters";
import { createPasswordLink, findPasswordLink, RESET_LINK_MINUTES } from "@/lib/auth/links";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password";
import { decrypt } from "@/lib/auth/secrets";
import {
  clearPendingTwoFactor,
  clearSession,
  createSession,
  deleteUserSessions,
  findUser,
  readPendingTwoFactor,
  readSession,
  setPendingTwoFactor,
  updateSession,
} from "@/lib/auth/session";
import { matchTotpStep } from "@/lib/auth/totp";
import { audit } from "@/lib/data/client";
import type { User } from "@/lib/data/types";
import { getDb, schema as t, usesSampleDatabase } from "@/lib/db";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

/** Fixed code for the sample accounts, so the public demo can show the two-factor step. */
const SAMPLE_TOTP = "123456";
/** Checked when no user matches, so a wrong email takes as long as a wrong password. */
const DUMMY_HASH = "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
});

async function startSession(user: User) {
  const db = await getDb();
  const [membership] = await db.select().from(t.memberships).where(eq(t.memberships.userId, user.id)).orderBy(t.memberships.createdAt).limit(1);
  await createSession({ uid: user.id, acc: membership?.accountId });
  await audit({ user, impersonator: null, account: membership ? { id: membership.accountId } : undefined }, "auth.sign_in");
  redirect(user.isAdmin ? "/admin" : "/dashboard");
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const email = parsed.data.email.toLowerCase();
  const ip = await clientIp();
  const [byIp, byEmail] = await Promise.all([rateLimit(`signin:ip:${ip}`, 20, 10 * 60_000), rateLimit(`signin:email:${email}`, 8, 10 * 60_000)]);
  const blocked = !byIp.ok ? byIp : !byEmail.ok ? byEmail : null;
  if (blocked) return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(blocked.retryAfterSec / 60)} minutes.` };

  const db = await getDb();
  const [row] = await db.select().from(t.users).where(eq(t.users.email, email));
  const passwordOk = await verifyPassword(parsed.data.password, row?.passwordHash ?? DUMMY_HASH);
  // Same message for unknown email and wrong password, so accounts can't be discovered.
  if (!row || !passwordOk) {
    // Recorded against a known account only, so the log can't be filled with made-up addresses.
    if (row) await audit({ user: { id: row.id, name: row.name }, impersonator: null }, "auth.sign_in_failed");
    return { ok: false, message: "That email and password don't match." };
  }

  if (row.twoFactorEnabled) {
    await setPendingTwoFactor(row.id);
    redirect("/two-factor");
  }
  const user = await findUser(row.id);
  if (!user) return { ok: false, message: "That email and password don't match." };
  await startSession(user);
  return { ok: true };
}

export async function verifyTwoFactor(_prev: FormState, formData: FormData): Promise<FormState> {
  const uid = await readPendingTwoFactor();
  if (!uid) redirect("/sign-in");
  const limit = await rateLimit(`2fa:${uid}`, 5, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please sign in again in a few minutes." };
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, errors: { code: "Enter the 6-digit code." } };

  const db = await getDb();
  const [row] = await db.select().from(t.users).where(eq(t.users.id, uid));
  if (!row) redirect("/sign-in");
  const secret = row.totpSecret ? decrypt(row.totpSecret) : null;
  let valid = false;
  if (secret === null) {
    valid = usesSampleDatabase() && code === SAMPLE_TOTP;
  } else {
    // A code is accepted once: replaying it within its 90-second window fails.
    const step = matchTotpStep(secret, code);
    if (step !== null && (row.totpLastStep === null || step > row.totpLastStep)) {
      await db.update(t.users).set({ totpLastStep: step }).where(eq(t.users.id, uid));
      valid = true;
    }
  }
  if (!valid) {
    await audit({ user: { id: row.id, name: row.name }, impersonator: null }, "auth.2fa_failed");
    return { ok: false, errors: { code: "That code isn't right. Check your authenticator app and try again." } };
  }

  const user = await findUser(uid);
  if (!user) redirect("/sign-in");
  await clearPendingTwoFactor();
  await startSession(user);
  return { ok: true };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ email: z.email("Enter a valid email address.") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const email = parsed.data.email.toLowerCase();
  const [byIp, byEmail] = await Promise.all([rateLimit(`reset:ip:${await clientIp()}`, 5, 15 * 60_000), rateLimit(`reset:email:${email}`, 3, 15 * 60_000)]);
  if (!byIp.ok) return { ok: false, message: "Too many requests. Please try again later." };

  const db = await getDb();
  const [user] = await db.select({ id: t.users.id, email: t.users.email, name: t.users.name }).from(t.users).where(eq(t.users.email, email));
  if (user && byEmail.ok) {
    const link = await createPasswordLink(user.id, RESET_LINK_MINUTES * 60_000);
    await getAdapters().email.send({
      to: user.email,
      subject: "Reset your Zaffre password",
      body: `Hi ${user.name},\n\nOpen this link to choose a new password. It works once and expires in ${RESET_LINK_MINUTES} minutes.\n\n${link}\n\nIf you did not ask for this, you can ignore this email. Your password has not changed.`,
    });
    await audit({ user, impersonator: null }, "auth.reset_request");
  }
  // Same answer whether or not the account exists.
  return { ok: true, message: `If an account exists for that email, we've sent a reset link. It expires in ${RESET_LINK_MINUTES} minutes.` };
}

const newPasswordSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`).max(200, "That password is too long."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "The two passwords don't match." });

/** Sets a new password from an emailed link (reset, or first setup for a new client). */
export async function choosePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!(await rateLimit(`choose-password:${await clientIp()}`, 10, 15 * 60_000)).ok) return { ok: false, message: "Too many attempts. Please try again later." };

  const link = await findPasswordLink(parsed.data.token);
  if (!link) return { ok: false, message: "This link has expired or was already used. Ask for a new one." };
  const passwordHash = await hashPassword(parsed.data.password);
  const db = await getDb();
  const used = await db.transaction(async (tx) => {
    // Claim the link first; a second request with the same link finds nothing to claim.
    const claimed = await tx
      .update(t.passwordResets)
      .set({ usedAt: new Date().toISOString() })
      .where(and(eq(t.passwordResets.id, link.id), isNull(t.passwordResets.usedAt)))
      .returning({ id: t.passwordResets.id });
    if (claimed.length === 0) return false;
    await tx.update(t.users).set({ passwordHash }).where(eq(t.users.id, link.userId));
    return true;
  });
  if (!used) return { ok: false, message: "This link has expired or was already used. Ask for a new one." };

  // A new password signs every device out.
  await deleteUserSessions(link.userId);
  const user = await findUser(link.userId);
  if (user) await audit({ user, impersonator: null }, "auth.password_set");
  redirect("/sign-in?password=updated");
}

export async function signOut(): Promise<void> {
  await clearSession();
  redirect("/sign-in");
}

export async function switchAccount(formData: FormData): Promise<void> {
  const session = await readSession();
  if (!session) redirect("/sign-in");
  const accountId = String(formData.get("accountId") ?? "");
  const db = await getDb();
  const [allowed] = await db
    .select({ id: t.memberships.id })
    .from(t.memberships)
    .where(and(eq(t.memberships.userId, session.uid), eq(t.memberships.accountId, accountId)));
  if (allowed) await updateSession(session, { acc: accountId });
  redirect("/dashboard");
}

export async function stopImpersonating(): Promise<void> {
  const session = await readSession();
  if (!session?.imp) redirect("/dashboard");
  const [admin, client] = await Promise.all([findUser(session.imp), findUser(session.uid)]);
  if (admin && client) await audit({ user: admin, impersonator: null, account: session.acc ? { id: session.acc } : undefined }, "admin.impersonate_end", client.email);
  await updateSession(session, { uid: session.imp, acc: null, imp: null });
  redirect("/admin/clients");
}
