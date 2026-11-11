import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import { getViewer } from "@/lib/auth/viewer";
import { listActivity, listSessions } from "@/lib/data/client";
import { revokeSession, toggleTwoFactor, updateProfile } from "@/app/actions/account";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ActionButton } from "@/components/app/action-button";
import { formatDateTime, formatRelative } from "@/lib/utils";
import { ProfileForm, TwoFactorToggle } from "./forms";

export const metadata: Metadata = { title: "Account" };

const actionLabels: Record<string, string> = {
  "auth.sign_in": "Signed in",
  "team.invite": "Invited a team member",
  "team.invite_cancel": "Cancelled an invite",
  "team.revoke": "Removed a team member",
  "payment.submit": "Submitted a payment",
  "env.update": "Changed an environment variable",
  "env.delete": "Deleted an environment variable",
  "site.restart": "Restarted a site",
  "site.redeploy": "Redeployed a site",
  "site.settings": "Changed site settings",
  "domain.add": "Added a domain",
  "domain.remove": "Removed a domain",
  "domain.redirect": "Changed a redirect",
  "backup.restore_request": "Requested a restore",
  "ticket.create": "Opened a ticket",
  "ticket.reply": "Replied to a ticket",
  "ticket.close": "Closed a ticket",
  "profile.update": "Updated profile",
  "security.2fa_enable": "Turned on 2FA",
  "security.2fa_disable": "Turned off 2FA",
  "security.session_revoke": "Signed out a device",
  "mailbox.create": "Created a mailbox",
  "mailbox.reset_password": "Reset a mailbox password",
};

export default async function AccountPage() {
  const now = await requestTime();
  const viewer = await getViewer();
  const sessions = listSessions(viewer);
  const activity = listActivity(viewer).slice(0, 15);
  return (
    <>
      <PageHeader title="Account" description="Your profile, security and recent activity." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm name={viewer.user.name} email={viewer.user.email} action={updateProfile} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>Ask for a code from your phone when you sign in. Optional, but we recommend it.</CardDescription>
            </div>
            <StatusBadge tone={viewer.user.twoFactorEnabled ? "success" : "neutral"} label={viewer.user.twoFactorEnabled ? "On" : "Off"} />
          </CardHeader>
          <CardContent>
            <TwoFactorToggle enabled={viewer.user.twoFactorEnabled} action={toggleTwoFactor} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <ul className="divide-y divide-border">
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {s.device} {s.current ? <span className="text-xs font-normal text-success">· this device</span> : null}
                    </p>
                    <p className="text-sm text-muted">
                      {s.location} · active {formatRelative(s.lastActiveAt, now)}
                    </p>
                  </div>
                  {!s.current ? <ActionButton action={revokeSession} fields={{ sessionId: s.id }} label="Sign out" variant="ghost" /> : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Activity log</CardTitle>
              <CardDescription>{viewer.membership.role === "owner" ? "Everyone in this account." : "Your own actions."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-2">
                  <span>
                    <span className="font-medium">{a.actorName}</span> {(actionLabels[a.action] ?? a.action).toLowerCase()}
                    {a.target ? <span className="text-muted">: {a.target}</span> : null}
                    {a.impersonatorId ? <span className="ml-1 text-xs text-warning">(by Zaffre support)</span> : null}
                  </span>
                  <span className="text-xs text-muted" title={formatDateTime(a.createdAt)}>
                    {formatRelative(a.createdAt, now)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
