"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdapters } from "@/lib/adapters";
import { INVITE_LINK_DAYS, inviteUrl } from "@/lib/auth/links";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { roleLabels } from "@/lib/auth/permissions";
import { hashToken, newToken } from "@/lib/auth/secrets";
import { getViewer } from "@/lib/auth/viewer";
import { assertCan, audit, ForbiddenError, listSites } from "@/lib/data/client";
import { defaultNotificationPrefs } from "@/lib/data/defaults";
import { getDb, schema as t } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

const inviteSchema = z.object({
  email: z.email("Enter a valid email address.").max(200),
  role: z.enum(["owner", "developer", "billing"]),
  scope: z.enum(["all", "selected"]),
});

export async function inviteMember(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "team:manage");
    const parsed = inviteSchema.safeParse({ email: formData.get("email"), role: formData.get("role"), scope: formData.get("scope") });
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    if (!(await rateLimit(`invite:${viewer.account.id}`, 20, 60 * 60_000)).ok) return { ok: false, message: "Too many invites in the last hour. Please try again later." };
    const { role, scope } = parsed.data;
    const email = parsed.data.email.toLowerCase();
    const accountSites = new Set((await listSites(viewer)).map((s) => s.id));
    const siteIds = scope === "all" || role !== "developer" ? null : formData.getAll("siteIds").map(String).filter((id) => accountSites.has(id));
    if (siteIds && siteIds.length === 0) return { ok: false, errors: { siteIds: "Pick at least one site." } };

    const db = await getDb();
    const [member] = await db
      .select({ id: t.memberships.id })
      .from(t.memberships)
      .innerJoin(t.users, eq(t.users.id, t.memberships.userId))
      .where(and(eq(t.memberships.accountId, viewer.account.id), eq(t.users.email, email)));
    const [invited] = await db
      .select({ id: t.invites.id })
      .from(t.invites)
      .where(and(eq(t.invites.accountId, viewer.account.id), eq(t.invites.email, email)));
    if (member || invited) return { ok: false, errors: { email: "This person is already in your team or invited." } };

    const token = newToken();
    await db.insert(t.invites).values({
      id: newId("inv"),
      accountId: viewer.account.id,
      email,
      role,
      siteIds,
      invitedBy: viewer.user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + INVITE_LINK_DAYS * 86_400_000).toISOString(),
    });
    await getAdapters().email.send({
      to: email,
      subject: `You've been invited to ${viewer.account.name} on Zaffre`,
      body: `${viewer.user.name} invited you to ${viewer.account.name} as ${roleLabels[role].label}.\n\nOpen this link to accept. It expires in ${INVITE_LINK_DAYS} days.\n\n${inviteUrl(token)}`,
    });
    await audit(viewer, "team.invite", `${email} (${role})`);
    refresh();
    return { ok: true, message: `Invite sent to ${email}.` };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function revokeAccess(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "team:manage");
    const db = await getDb();
    const kind = formData.get("kind");
    const id = String(formData.get("id") ?? "");
    if (kind === "invite") {
      const [invite] = await db
        .delete(t.invites)
        .where(and(eq(t.invites.id, id), eq(t.invites.accountId, viewer.account.id)))
        .returning({ email: t.invites.email });
      if (!invite) return { ok: false, message: "Invite not found." };
      await audit(viewer, "team.invite_cancel", invite.email);
    } else {
      const result = await db.transaction(async (tx) => {
        const [member] = await tx
          .select({ membership: t.memberships, email: t.users.email })
          .from(t.memberships)
          .innerJoin(t.users, eq(t.users.id, t.memberships.userId))
          .where(and(eq(t.memberships.id, id), eq(t.memberships.accountId, viewer.account.id)));
        if (!member) return "Member not found.";
        if (member.membership.userId === viewer.user.id) return "You can't remove yourself.";
        if (member.membership.role === "owner") {
          const [owners] = await tx
            .select({ n: count() })
            .from(t.memberships)
            .where(and(eq(t.memberships.accountId, viewer.account.id), eq(t.memberships.role, "owner")));
          if ((owners?.n ?? 0) <= 1) return "An account needs at least one owner.";
        }
        await tx.delete(t.memberships).where(eq(t.memberships.id, member.membership.id));
        // Their open sessions that were looking at this account lose it on the next request.
        await audit(viewer, "team.revoke", member.email, tx);
        return null;
      });
      if (result) return { ok: false, message: result };
    }
    refresh();
    return { ok: true, message: "Access removed." };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
}

const acceptSchema = z.object({
  token: z.string().min(20).max(200),
  name: z.string().trim().max(80).optional(),
  password: z.string().max(200).optional(),
});

/**
 * Accepts an invite. A new person chooses a name and password; someone who already
 * has a Zaffre sign-in is simply added to the account and signs in as usual.
 */
export async function acceptInvite(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = acceptSchema.safeParse({ token: formData.get("token"), name: formData.get("name") || undefined, password: formData.get("password") || undefined });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!(await rateLimit(`invite-accept:${await clientIp()}`, 10, 15 * 60_000)).ok) return { ok: false, message: "Too many attempts. Please try again later." };
  const expired: FormState = { ok: false, message: "This invite has expired or was cancelled. Ask for a new one." };

  const db = await getDb();
  const [invite] = await db
    .select()
    .from(t.invites)
    .where(and(eq(t.invites.tokenHash, hashToken(parsed.data.token)), gt(t.invites.expiresAt, new Date().toISOString())));
  if (!invite) return expired;
  const [existing] = await db.select({ id: t.users.id, name: t.users.name }).from(t.users).where(eq(t.users.email, invite.email));

  let passwordHash: string | null = null;
  if (!existing) {
    const errors: Record<string, string> = {};
    if (!parsed.data.name || parsed.data.name.length < 2) errors.name = "Enter your name.";
    if (!parsed.data.password || parsed.data.password.length < MIN_PASSWORD_LENGTH) errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    passwordHash = await hashPassword(parsed.data.password!);
  }

  const joined = await db.transaction(async (tx) => {
    // Claim the invite; a second click on the same link finds nothing.
    const claimed = await tx.delete(t.invites).where(eq(t.invites.id, invite.id)).returning({ id: t.invites.id });
    if (claimed.length === 0) return false;
    let userId = existing?.id;
    let userName = existing?.name ?? parsed.data.name!;
    if (!userId) {
      userId = newId("usr");
      userName = parsed.data.name!;
      await tx.insert(t.users).values({ id: userId, name: userName, email: invite.email, passwordHash });
      await tx.insert(t.notificationPrefs).values({ userId, ...defaultNotificationPrefs() });
    }
    await tx
      .insert(t.memberships)
      .values({ id: newId("mem"), accountId: invite.accountId, userId, role: invite.role, siteIds: invite.siteIds })
      .onConflictDoNothing();
    await audit({ user: { id: userId, name: userName }, account: { id: invite.accountId } }, "team.invite_accept", invite.email, tx);
    return true;
  });
  if (!joined) return expired;
  redirect("/sign-in?invite=accepted");
}
