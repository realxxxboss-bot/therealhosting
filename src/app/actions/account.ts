"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { audit, assertCan, ForbiddenError } from "@/lib/data/client";
import { db, nextId } from "@/lib/data/store";
import { fieldErrors, type FormState } from "@/lib/forms";
import { getAdapters } from "@/lib/adapters";
import type { NotificationKind } from "@/lib/data/types";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const parsed = z.object({ name: z.string().trim().min(2, "Enter your name.").max(80) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  viewer.user.name = parsed.data.name;
  audit(viewer, "profile.update");
  refresh();
  return { ok: true, message: "Profile saved." };
}

export async function toggleTwoFactor(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const enable = formData.get("enable") === "true";
  if (enable && String(formData.get("code") ?? "").trim() !== "123456") return { ok: false, errors: { code: "Enter the 6-digit code from your app (demo: 123456)." } };
  viewer.user.twoFactorEnabled = enable;
  audit(viewer, enable ? "security.2fa_enable" : "security.2fa_disable");
  refresh();
  return { ok: true, message: enable ? "Two-factor authentication is on." : "Two-factor authentication is off." };
}

export async function revokeSession(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const store = db();
  const index = store.sessions.findIndex((s) => s.id === formData.get("sessionId") && s.userId === viewer.user.id && !s.current);
  const session = store.sessions[index];
  if (!session) return { ok: false, message: "Session not found." };
  store.sessions.splice(index, 1);
  audit(viewer, "security.session_revoke", session.device);
  refresh();
  return { ok: true, message: "Signed out of that device." };
}

const kinds: NotificationKind[] = ["site_down", "site_up", "invoice", "payment_confirmed", "ticket_reply", "deploy", "info"];

export async function saveNotificationPrefs(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const prefs = db().notificationPrefs.find((p) => p.userId === viewer.user.id);
  if (!prefs) return { ok: false, message: "Preferences not found." };
  for (const k of kinds) {
    prefs.email[k] = formData.get(`email:${k}`) === "on";
    prefs.whatsapp[k] = formData.get(`whatsapp:${k}`) === "on";
  }
  refresh();
  return { ok: true, message: "Notification settings saved." };
}

const mailboxSchema = z.object({
  local: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{1,40}$/, "Use letters, numbers, dots, dashes or underscores."),
  domain: z.string().min(3),
});

export async function createMailbox(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "email:manage");
    const parsed = mailboxSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    const store = db();
    const ownsDomain = store.domains.some((d) => d.accountId === viewer.account.id && d.hostname === parsed.data.domain);
    if (!ownsDomain) return { ok: false, errors: { domain: "Pick one of your domains." } };
    const address = `${parsed.data.local}@${parsed.data.domain}`;
    if (store.mailboxes.some((m) => m.address === address)) return { ok: false, errors: { local: "That mailbox already exists." } };
    const { setupUrl } = await getAdapters().mailboxes.create(address);
    await getAdapters().email.send({ to: viewer.user.email, subject: `Set the password for ${address}`, body: `Open this link to set the password: ${setupUrl}` });
    store.mailboxes.push({ id: nextId("mbx"), accountId: viewer.account.id, address, domain: parsed.data.domain, quotaGb: 10, usedGb: 0, createdAt: new Date().toISOString() });
    audit(viewer, "mailbox.create", address);
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
    const mailbox = db().mailboxes.find((m) => m.id === formData.get("mailboxId") && m.accountId === viewer.account.id);
    if (!mailbox) return { ok: false, message: "Mailbox not found." };
    const { resetUrl } = await getAdapters().mailboxes.resetPassword(mailbox.address);
    await getAdapters().email.send({ to: viewer.user.email, subject: `Reset the password for ${mailbox.address}`, body: `Open this link to choose a new password: ${resetUrl}` });
    audit(viewer, "mailbox.reset_password", mailbox.address);
    return { ok: true, message: `A password reset link for ${mailbox.address} was sent to ${viewer.user.email}.` };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function markNotificationsRead(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const id = String(formData.get("id") ?? "");
  for (const n of db().notifications) {
    if (n.accountId === viewer.account.id && (id === "all" || n.id === id)) n.read = true;
  }
  refresh();
  return { ok: true };
}
