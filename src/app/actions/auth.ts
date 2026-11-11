"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/data/store";
import { DEMO_PASSWORD } from "@/lib/data/seed";
import { audit } from "@/lib/data/client";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { getAdapters } from "@/lib/adapters";
import {
  clearPendingTwoFactor,
  clearSession,
  readPendingTwoFactor,
  readSession,
  setPendingTwoFactor,
  writeSession,
} from "@/lib/auth/session";
import type { User } from "@/lib/data/types";

/** Demo TOTP code. Phase 2 replaces this with real TOTP (Better Auth two-factor plugin). */
const DEMO_TOTP = "123456";

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

async function startSession(user: User) {
  const membership = db().memberships.find((m) => m.userId === user.id);
  await writeSession({ uid: user.id, acc: membership?.accountId });
  audit({ user, impersonator: null, account: membership ? { id: membership.accountId } : undefined }, "auth.sign_in");
  redirect(user.isAdmin ? "/admin" : "/dashboard");
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const ip = await clientIp();
  const limit = rateLimit(`signin:${ip}`, 10, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` };

  const user = db().users.find((u) => u.email.toLowerCase() === parsed.data.email.toLowerCase());
  // Same message for unknown email and wrong password, so accounts can't be discovered.
  if (!user || parsed.data.password !== DEMO_PASSWORD) return { ok: false, message: "That email and password don't match." };

  if (user.twoFactorEnabled) {
    await setPendingTwoFactor(user.id);
    redirect("/two-factor");
  }
  await startSession(user);
  return { ok: true };
}

export async function verifyTwoFactor(_prev: FormState, formData: FormData): Promise<FormState> {
  const uid = await readPendingTwoFactor();
  if (!uid) redirect("/sign-in");
  const limit = rateLimit(`2fa:${uid}`, 5, 10 * 60_000);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please sign in again in a few minutes." };
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, errors: { code: "Enter the 6-digit code." } };
  if (code !== DEMO_TOTP) return { ok: false, errors: { code: "That code isn't right. Check your authenticator app and try again." } };
  const user = db().users.find((u) => u.id === uid);
  if (!user) redirect("/sign-in");
  await clearPendingTwoFactor();
  await startSession(user);
  return { ok: true };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ email: z.email("Enter a valid email address.") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const limit = rateLimit(`reset:${await clientIp()}`, 5, 15 * 60_000);
  if (!limit.ok) return { ok: false, message: "Too many requests. Please try again later." };
  const user = db().users.find((u) => u.email.toLowerCase() === parsed.data.email.toLowerCase());
  if (user) {
    await getAdapters().email.send({ to: user.email, subject: "Reset your Zaffre password", body: "Use this link to choose a new password. It expires in 30 minutes. (Demo: no real link is sent.)" });
  }
  // Same answer whether or not the account exists.
  return { ok: true, message: "If an account exists for that email, we've sent a reset link. It expires in 30 minutes." };
}

export async function signOut(): Promise<void> {
  await clearSession();
  redirect("/sign-in");
}

export async function switchAccount(formData: FormData): Promise<void> {
  const session = await readSession();
  if (!session) redirect("/sign-in");
  const accountId = String(formData.get("accountId") ?? "");
  const allowed = db().memberships.some((m) => m.userId === session.uid && m.accountId === accountId);
  if (allowed) await writeSession({ ...session, acc: accountId });
  redirect("/dashboard");
}

export async function stopImpersonating(): Promise<void> {
  const session = await readSession();
  if (!session?.imp) redirect("/dashboard");
  const store = db();
  const admin = store.users.find((u) => u.id === session.imp);
  const client = store.users.find((u) => u.id === session.uid);
  if (admin && client) audit({ user: admin, impersonator: null, account: session.acc ? { id: session.acc } : undefined }, "admin.impersonate_end", client.email);
  await writeSession({ uid: session.imp });
  redirect("/admin/clients");
}
