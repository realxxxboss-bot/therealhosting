import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { getNotificationPrefs, listNotifications } from "@/lib/data/client";
import { markNotificationsRead, saveNotificationPrefs } from "@/app/actions/account";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionButton } from "@/components/app/action-button";
import { formatRelative } from "@/lib/utils";
import { PrefsForm } from "./prefs-form";

export const metadata: Metadata = { title: "Notifications" };

const kindLabels = {
  site_down: "Site down",
  site_up: "Site back up",
  invoice: "New invoice",
  payment_confirmed: "Payment confirmed",
  ticket_reply: "Support replies",
  deploy: "Deploys",
  info: "Announcements",
} as const;

export default async function NotificationsPage() {
  const now = await requestTime();
  const viewer = await getViewer();
  const items = await listNotifications(viewer);
  const prefs = await getNotificationPrefs(viewer);
  const unread = items.filter((n) => !n.read).length;
  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up."}
        actions={unread ? <ActionButton action={markNotificationsRead} fields={{ id: "all" }} label="Mark all as read" /> : null}
      />
      <div className="grid gap-6">
        <Card>
          {items.length === 0 ? (
            <EmptyState icon={Bell} title="Nothing yet" body="Site alerts, invoices and support replies will show up here." />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-4">
                  <span className={n.read ? "mt-1.5 size-2 shrink-0 rounded-full bg-border" : "mt-1.5 size-2 shrink-0 rounded-full bg-primary"} aria-label={n.read ? "Read" : "Unread"} role="img" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{n.href ? <Link href={n.href} className="hover:underline">{n.title}</Link> : n.title}</p>
                    <p className="text-sm text-muted">{n.body}</p>
                    <p className="mt-1 text-xs text-muted">
                      {kindLabels[n.kind]}, {formatRelative(n.createdAt, now)}
                    </p>
                  </div>
                  {!n.read ? <ActionButton action={markNotificationsRead} fields={{ id: n.id }} label="Mark read" variant="ghost" /> : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
        {prefs ? (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>How we reach you</CardTitle>
                <CardDescription>In-app notifications are always on. WhatsApp alerts start once our WhatsApp provider is connected.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <PrefsForm kinds={Object.entries(kindLabels).map(([k, label]) => ({ key: k, label }))} email={prefs.email} whatsapp={prefs.whatsapp} action={saveNotificationPrefs} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
