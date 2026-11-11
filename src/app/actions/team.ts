"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { assertCan, audit, listSites, ForbiddenError } from "@/lib/data/client";
import { db, nextId } from "@/lib/data/store";
import { fieldErrors, type FormState } from "@/lib/forms";
import { getAdapters } from "@/lib/adapters";
import { roleLabels } from "@/lib/auth/permissions";

const inviteSchema = z.object({
  email: z.email("Enter a valid email address."),
  role: z.enum(["owner", "developer", "billing"]),
  scope: z.enum(["all", "selected"]),
});

export async function inviteMember(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "team:manage");
    const parsed = inviteSchema.safeParse({ email: formData.get("email"), role: formData.get("role"), scope: formData.get("scope") });
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    const { email, role, scope } = parsed.data;
    const accountSites = new Set(listSites(viewer).map((s) => s.id));
    const siteIds = scope === "all" || role !== "developer" ? null : formData.getAll("siteIds").map(String).filter((id) => accountSites.has(id));
    if (siteIds && siteIds.length === 0) return { ok: false, errors: { siteIds: "Pick at least one site." } };
    const store = db();
    const lower = email.toLowerCase();
    const alreadyMember = store.memberships.some((m) => m.accountId === viewer.account.id && store.users.find((u) => u.id === m.userId)?.email.toLowerCase() === lower);
    if (alreadyMember || store.invites.some((i) => i.accountId === viewer.account.id && i.email === lower)) return { ok: false, errors: { email: "This person is already in your team or invited." } };
    store.invites.unshift({ id: nextId("inv"), accountId: viewer.account.id, email: lower, role, siteIds, invitedBy: viewer.user.id, createdAt: new Date().toISOString() });
    await getAdapters().email.send({ to: lower, subject: `You've been invited to ${viewer.account.name} on Zaffre`, body: `${viewer.user.name} invited you as ${roleLabels[role].label}.` });
    audit(viewer, "team.invite", `${lower} (${role})`);
    refresh();
    return { ok: true, message: `Invite sent to ${lower}.` };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function revokeAccess(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const viewer = await getViewer();
    assertCan(viewer, "team:manage");
    const store = db();
    const kind = formData.get("kind");
    const id = String(formData.get("id") ?? "");
    if (kind === "invite") {
      const index = store.invites.findIndex((i) => i.id === id && i.accountId === viewer.account.id);
      const invite = store.invites[index];
      if (!invite) return { ok: false, message: "Invite not found." };
      store.invites.splice(index, 1);
      audit(viewer, "team.invite_cancel", invite.email);
    } else {
      const index = store.memberships.findIndex((m) => m.id === id && m.accountId === viewer.account.id);
      const member = store.memberships[index];
      if (!member) return { ok: false, message: "Member not found." };
      if (member.userId === viewer.user.id) return { ok: false, message: "You can't remove yourself." };
      const owners = store.memberships.filter((m) => m.accountId === viewer.account.id && m.role === "owner");
      if (member.role === "owner" && owners.length <= 1) return { ok: false, message: "An account needs at least one owner." };
      store.memberships.splice(index, 1);
      audit(viewer, "team.revoke", store.users.find((u) => u.id === member.userId)?.email);
    }
    refresh();
    return { ok: true, message: "Access removed." };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
}
