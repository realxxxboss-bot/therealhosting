import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { hasCapability, listSites, listTeam } from "@/lib/data/client";
import { inviteMember, revokeAccess } from "@/app/actions/team";
import { roleLabels } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/app/action-button";
import { formatDate, initials } from "@/lib/utils";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const viewer = await getViewer();
  if (!hasCapability(viewer, "team:manage")) notFound();
  const { members, invites } = listTeam(viewer);
  const sites = listSites(viewer);
  const siteName = new Map(sites.map((s) => [s.id, s.name]));
  const scope = (ids: string[] | null) => (ids === null ? "All sites" : ids.map((id) => siteName.get(id) ?? id).join(", "));

  return (
    <>
      <PageHeader title="Team & developer access" description="Invite your developer, designer or accountant with only the access they need. No seat fees." />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invite someone</CardTitle>
              <CardDescription>They get an email to create their own sign-in. You can remove access at any time.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <InviteForm sites={sites.map((s) => ({ id: s.id, name: s.name }))} roles={Object.entries(roleLabels).map(([value, r]) => ({ value, ...r }))} action={inviteMember} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <ul className="divide-y divide-border">
              {members.map(({ membership, user }) => (
                <li key={membership.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                  <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-xs font-semibold" aria-hidden>
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {user.name} {user.id === viewer.user.id ? <span className="text-xs text-muted">(you)</span> : null}
                    </p>
                    <p className="text-sm text-muted">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={membership.role === "owner" ? "primary" : "neutral"}>{roleLabels[membership.role].label}</Badge>
                    <p className="mt-1 text-xs text-muted">{membership.role === "billing" ? "No site access" : scope(membership.siteIds)}</p>
                  </div>
                  {user.id !== viewer.user.id ? (
                    <ActionButton action={revokeAccess} fields={{ kind: "member", id: membership.id }} label="Remove" variant="ghost" confirm={`Remove ${user.name}'s access now?`} />
                  ) : (
                    <span className="w-[74px]" />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {invites.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Pending invites</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <ul className="divide-y divide-border">
                {invites.map((inv) => (
                  <li key={inv.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{inv.email}</p>
                      <p className="text-sm text-muted">
                        {roleLabels[inv.role].label} · {inv.role === "billing" ? "No site access" : scope(inv.siteIds)} · sent {formatDate(inv.createdAt)}
                      </p>
                    </div>
                    <ActionButton action={revokeAccess} fields={{ kind: "invite", id: inv.id }} label="Cancel invite" variant="ghost" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
