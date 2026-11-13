import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { changePassword, revokeSession, startTwoFactorSetup, toggleTwoFactor } from "@/app/actions/account";
import { PasswordForm, TwoFactorToggle } from "@/app/dashboard/account/forms";
import { ActionButton } from "@/components/app/action-button";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { adminNeedsTwoFactor, readSession } from "@/lib/auth/session";
import { getAdminSession } from "@/lib/auth/viewer";
import { getDb, schema as t, usesSampleDatabase } from "@/lib/db";
import { requestTime } from "@/lib/request";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Your account" };

export default async function AdminAccountPage() {
  const now = await requestTime();
  const admin = await getAdminSession();
  const session = await readSession();
  const db = await getDb();
  const sessions = (await db.select().from(t.sessions).where(eq(t.sessions.userId, admin.id)).orderBy(desc(t.sessions.lastActiveAt))).filter((s) => s.expiresAt > new Date(now).toISOString());
  const required = adminNeedsTwoFactor(admin);

  return (
    <>
      <PageHeader title="Your account" description={`${admin.name} · ${admin.email}`} />
      {required ? (
        <Alert tone="warning" className="mb-6">
          Turn on two-factor authentication to open the admin. Admin accounts can see every client&apos;s data, so a password alone is not enough.
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>Required for admin accounts. Use any authenticator app.</CardDescription>
            </div>
            <StatusBadge tone={admin.twoFactorEnabled ? "success" : "warning"} label={admin.twoFactorEnabled ? "On" : "Off"} />
          </CardHeader>
          <CardContent>
            <TwoFactorToggle enabled={admin.twoFactorEnabled} action={toggleTwoFactor} startSetup={startTwoFactorSetup} sampleHint={usesSampleDatabase() && admin.twoFactorEnabled ? "Sample account: the code is 123456." : undefined} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm action={changePassword} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <ul className="divide-y divide-border">
              {sessions.map((s) => {
                const current = s.id === session?.sessionId;
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {s.device} {current ? <span className="text-xs font-normal text-success">· this device</span> : null}
                      </p>
                      <p className="text-sm text-muted">
                        {s.location ? `${s.location}, ` : ""}active {formatRelative(s.lastActiveAt, now)}
                      </p>
                    </div>
                    {!current ? <ActionButton action={revokeSession} fields={{ sessionId: s.id }} label="Sign out" variant="ghost" /> : null}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
