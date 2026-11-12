"use server";

import { and, eq, isNull, ne } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { site } from "@/config/site";
import { getAdapters } from "@/lib/adapters";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password";
import { decrypt, encrypt, hashToken } from "@/lib/auth/secrets";
import { deleteUserSessions, readSession } from "@/lib/auth/session";
import { formatSecret, generateTotpSecret, totpUri, verifyTotp } from "@/lib/auth/totp";
import { getViewer } from "@/lib/auth/viewer";
import { assertCan, audit, ForbiddenError } from "@/lib/data/client";
import { defaultNotificationPrefs } from "@/lib/data/defaults";
import type { NotificationKind } from "@/lib/data/types";
import { getDb, schema as t, usesSampleDatabase } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const parsed = z.object({ name: z.string().trim().min(2, "Enter your name.").max(80) }).safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const db = await getDb();
  await db.update(t.users).set({ name: parsed.data.name }).where(eq(t.users.id, viewer.user.id));
  await audit(viewer, "profile.update");
  refresh();
  return { ok: true, message: "Profile saved." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password.").max(200),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`).max(200, "That password is too long."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "The two passwords don't match." });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (viewer.impersonator) return { ok: false, message: "Passwords can't be changed while signed in as a client." };
  const parsed = passwordSchema.safeParse({ current: formData.get("current"), password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!(await rateLimit(`password:${viewer.user.id}`, 5, 15 * 60_000)).ok) return { ok: false, message: "Too many attempts. Please try again later." };
  const db = await getDb();
  const [row] = await db.select({ passwordHash: t.users.passwordHash }).from(t.users).where(eq(t.users.id, viewer.user.id));
  if (!(await verifyPassword(parsed.data.current, row?.passwordHash))) return { ok: false, errors: { current: "That isn't your current password." } };
  await db.update(t.users).set({ passwordHash: await hashPassword(parsed.data.password) }).where(eq(t.users.id, viewer.user.id));
  // Every other device is signed out; this one stays.
  const session = await readSession();
  await deleteUserSessions(viewer.user.id, session ? hashToken(session.tok) : undefined);
  await audit(viewer, "security.password_change");
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}

export type TwoFactorSetupState = FormState & { secret?: string; uri?: string };

/** Step 1 of turning 2FA on: create a secret and show it. Nothing is enabled until a code is confirmed. */
export async function startTwoFactorSetup(): Promise<TwoFactorSetupState> {
  const viewer = await getViewer();
  if (viewer.impersonator) return { ok: false, message: "Security settings can't be changed while signed in as a client." };
  if (viewer.user.twoFactorEnabled) return { ok: false, message: "Two-factor authentication is already on." };
  const secret = generateTotpSecret();
  const db = await getDb();
  await db.update(t.users).set({ totpSecret: encrypt(secret) }).where(eq(t.users.id, viewer.user.id));
  return { ok: true, secret: formatSecret(secret), uri: totpUri(secret, viewer.user.email, site.name) };
}

export async function toggleTwoFactor(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (viewer.impersonator) return { ok: false, message: "Security settings can't be changed while signed in as a client." };
  const enable = formData.get("enable") === "true";
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!(await rateLimit(`2fa-setup:${viewer.user.id}`, 8, 10 * 60_000)).ok) return { ok: false, message: "Too many attempts. Please try again in a few minutes." };
  const db = await getDb();
  const [row] = await db.select({ totpSecret: t.users.totpSecret }).from(t.users).where(eq(t.users.id, viewer.user.id));
  const secret = row?.totpSecret ? decrypt(row.totpSecret) : null;
  const codeOk = (secret !== null && verifyTotp(secret, code)) || (usesSampleDatabase() && secret === null && code === "123456");

  if (enable) {
    if (!secret) return { ok: false, message: "Start the setup again to get a new key." };
    if (!codeOk) return { ok: false, errors: { code: "That code isn't right. Enter the 6-digit code your app shows now." } };
    await db.update(t.users).set({ twoFactorEnabled: true }).where(eq(t.users.id, viewer.user.id));
  } else {
    // Turning 2FA off needs a current code, so a borrowed session can't quietly remove it.
    if (!codeOk) return { ok: false, errors: { code: "Enter the 6-digit code from your app to turn this off." } };
    await db.update(t.users).set({ twoFactorEnabled: false, totpSecret: null }).where(eq(t.users.id, viewer.user.id));
  }
  await audit(viewer, enable ? "security.2fa_enable" : "security.2fa_disable");
  refresh();
  return { ok: true, message: enable ? "Two-factor authentication is on." : "Two-factor authentication is off." };
}

export async function revokeSession(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const sessionId = String(formData.get("sessionId") ?? "");
  if (sessionId === viewer.sessionId) return { ok: false, message: "That is this device. Use Sign out instead." };
  const db = await getDb();
  const [removed] = await db
    .delete(t.sessions)
    .where(and(eq(t.sessions.id, sessionId), eq(t.sessions.userId, viewer.user.id), isNull(t.sessions.impersonatorId)))
    .returning({ device: t.sessions.device });
  if (!removed) return { ok: false, message: "Session not found." };
  await audit(viewer, "security.session_revoke", removed.device);
  refresh();
  return { ok: true, message: "Signed out of that device." };
}

const kinds: NotificationKind[] = ["site_down", "site_up", "invoice", "payment_confirmed", "ticket_reply", "deploy", "info"];

export async function saveNotificationPrefs(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const prefs = defaultNotificationPrefs();
  for (const k of kinds) {
    prefs.email[k] = formData.get(`email:${k}`) === "on";
    prefs.whatsapp[k] = formData.get(`whatsapp:${k}`) === "on";
  }
  const db = await getDb();
  await db
    .insert(t.notificationPrefs)
    .values({ userId: viewer.user.id, ...prefs })
    .onConflictDoUpdate({ target: t.notificationPrefs.userId, set: prefs });
  refresh();
  return { ok: true, message: "Notification settings saved." };
}

const mailboxSchema = z.object({
  local: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{1,40}$/, "Use letters, numbers, dots, dashes or underscores."),
  domain: z.string().trim().toLowerCase().min(3).max(253),
});

export async function createMailbox(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "email:manage");
    const parsed = mailboxSchema.safeParse({ local: formData.get("local"), domain: formData.get("domain") });
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    if (!(await rateLimit(`mailbox:${viewer.account.id}`, 20, 60 * 60_000)).ok) return { ok: false, message: "Too many mailboxes created in the last hour. Please try again later." };
    const db = await getDb();
    const [owned] = await db
      .select({ id: t.domains.id })
      .from(t.domains)
      .where(and(eq(t.domains.accountId, viewer.account.id), eq(t.domains.hostname, parsed.data.domain)));
    if (!owned) return { ok: false, errors: { domain: "Pick one of your domains." } };
    const address = `${parsed.data.local}@${parsed.data.domain}`;
    const [taken] = await db.select({ id: t.mailboxes.id }).from(t.mailboxes).where(eq(t.mailboxes.address, address));
    if (taken) return { ok: false, errors: { local: "That mailbox already exists." } };
    const { setupUrl } = await getAdapters().mailboxes.create(address);
    await db.insert(t.mailboxes).values({ id: newId("mbx"), accountId: viewer.account.id, address, domain: parsed.data.domain, quotaGb: 10, usedGb: 0 });
    await getAdapters().email.send({ to: viewer.user.email, subject: `Set the password for ${address}`, body: `Open this link to set the password: ${setupUrl}` });
    await audit(viewer, "mailbox.create", address);
    refresh();
    return { ok: true, message: `${address} created. We've emailed you a link to set its password.` };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function resetMailboxPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "email:manage");
    if (!(await rateLimit(`mailbox-reset:${viewer.user.id}`, 10, 60 * 60_000)).ok) return { ok: false, message: "Too many reset links in the last hour. Please try again later." };
    const db = await getDb();
    const [mailbox] = await db
      .select()
      .from(t.mailboxes)
      .where(and(eq(t.mailboxes.id, String(formData.get("mailboxId") ?? "")), eq(t.mailboxes.accountId, viewer.account.id)));
    if (!mailbox) return { ok: false, message: "Mailbox not found." };
    const { resetUrl } = await getAdapters().mailboxes.resetPassword(mailbox.address);
    await getAdapters().email.send({ to: viewer.user.email, subject: `Reset the password for ${mailbox.address}`, body: `Open this link to choose a new password: ${resetUrl}` });
    await audit(viewer, "mailbox.reset_password", mailbox.address);
    return { ok: true, message: `A password reset link for ${mailbox.address} was sent to ${viewer.user.email}.` };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function markNotificationsRead(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const id = String(formData.get("id") ?? "");
  const db = await getDb();
  const scope = and(eq(t.notifications.accountId, viewer.account.id), ne(t.notifications.read, true));
  await db
    .update(t.notifications)
    .set({ read: true })
    .where(id === "all" ? scope : and(scope, eq(t.notifications.id, id)));
  refresh();
  return { ok: true };
}
