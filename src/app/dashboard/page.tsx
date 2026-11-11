import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, LifeBuoy, Receipt, Server } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { hasCapability, listInvoices, listNotifications, listSites, listSubscriptions, listTickets } from "@/lib/data/client";
import { getPlan } from "@/config/plans";
import { invoiceTotalCents, isOverdue } from "@/lib/billing";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { SiteStatusBadge } from "@/components/app/status";
import { SiteTypeIcon, siteTypeLabel } from "@/components/app/site-type";
import { formatCents, formatDate, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const now = await requestTime();
  const viewer = await getViewer();
  const sites = listSites(viewer);
  const invoices = listInvoices(viewer);
  const unpaid = invoices.filter((i) => i.status === "unpaid");
  const overdue = unpaid.filter((i) => isOverdue(i, now));
  const dueSoon = unpaid.filter((i) => !isOverdue(i, now));
  const tickets = listTickets(viewer).filter((t) => t.status !== "closed");
  const subs = listSubscriptions(viewer);
  const nextRenewal = subs.map((s) => s.renewsAt).sort()[0];
  const notifications = listNotifications(viewer).slice(0, 5);
  const upCount = sites.filter((s) => s.status === "up").length;
  const problemSites = sites.filter((s) => s.status === "down" || s.status === "degraded");
  const firstName = viewer.user.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Hello, ${firstName}`} description={`Here's how ${viewer.account.name} is doing today.`} />

      <div className="grid gap-3">
        {overdue.map((inv) => (
          <Alert key={inv.id} tone="danger" title={`Invoice ${inv.number} is overdue`} action={<ButtonLink href={`/dashboard/billing/${inv.id}/pay`} size="sm">Pay now</ButtonLink>}>
            {formatCents(invoiceTotalCents(inv))} was due on {formatDate(inv.dueAt)}. Your sites keep running. Please pay when you can, or reply to us if something is wrong.
          </Alert>
        ))}
        {dueSoon.map((inv) => (
          <Alert key={inv.id} tone="info" title={`Invoice ${inv.number} is due ${formatRelative(inv.dueAt, now)}`} action={<ButtonLink href={`/dashboard/billing/${inv.id}/pay`} size="sm" variant="secondary">View & pay</ButtonLink>}>
            {formatCents(invoiceTotalCents(inv))} due on {formatDate(inv.dueAt)}.
          </Alert>
        ))}
        {problemSites.map((s) => (
          <Alert key={s.id} tone="warning" title={`${s.name} is ${s.status === "down" ? "down" : "responding slowly"}`} action={<ButtonLink href={`/dashboard/sites/${s.id}`} size="sm" variant="secondary">Details</ButtonLink>}>
            Our team has been alerted and is looking at it. Average response time right now: {s.responseMs} ms.
          </Alert>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hasCapability(viewer, "sites:view") ? <Stat icon={Server} label="Sites online" value={`${upCount} / ${sites.length}`} hint={problemSites.length ? `${problemSites.length} need attention` : "All healthy"} /> : null}
        <Stat icon={LifeBuoy} label="Open tickets" value={tickets.length} hint={tickets.some((t) => t.status === "awaiting_client") ? "A reply is waiting for you" : "Nothing waiting on you"} />
        {hasCapability(viewer, "billing:view") ? (
          <>
            <Stat icon={Receipt} label="Unpaid invoices" value={formatCents(unpaid.reduce((sum, i) => sum + invoiceTotalCents(i), 0))} hint={`${unpaid.length} invoice${unpaid.length === 1 ? "" : "s"}`} />
            <Stat icon={CalendarClock} label="Next renewal" value={nextRenewal ? formatDate(nextRenewal) : "—"} hint="Same price as today" />
          </>
        ) : null}
      </div>

      {hasCapability(viewer, "sites:view") ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your sites</CardTitle>
            <Link href="/dashboard/sites" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              All sites <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <ul className="divide-y divide-border">
              {sites.map((s) => {
                const plan = getPlan(subs.find((x) => x.id === s.subscriptionId)?.planId ?? "");
                return (
                  <li key={s.id}>
                    <Link href={`/dashboard/sites/${s.id}`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-2">
                      <SiteTypeIcon type={s.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="truncate text-sm text-muted">{s.primaryDomain}</p>
                      </div>
                      <span className="hidden w-36 text-sm text-muted md:block">{plan?.name ?? siteTypeLabel(s.type)}</span>
                      <span className="hidden w-20 text-right text-sm text-muted sm:block">{s.responseMs} ms</span>
                      <span className="hidden w-28 text-right text-sm text-muted lg:block">{formatRelative(s.lastDeployAt, now)}</span>
                      <span className="w-20 text-right">
                        <SiteStatusBadge status={s.status} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <Link href="/dashboard/notifications" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-3">
                  <span className={n.read ? "mt-1.5 size-2 shrink-0 rounded-full bg-border" : "mt-1.5 size-2 shrink-0 rounded-full bg-primary"} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.href ? <Link href={n.href} className="hover:underline">{n.title}</Link> : n.title}</p>
                    <p className="text-sm text-muted">{n.body}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatRelative(n.createdAt, now)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {hasCapability(viewer, "billing:view") ? (
          <Card>
            <CardHeader>
              <CardTitle>Your packages</CardTitle>
              <Link href="/dashboard/billing" className="text-sm text-primary hover:underline">
                Billing
              </Link>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {subs.map((sub) => {
                  const plan = getPlan(sub.planId);
                  const used = sites.filter((s) => s.subscriptionId === sub.id).length;
                  return (
                    <li key={sub.id} className="rounded-[12px] border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{plan?.name}</p>
                        <p className="text-sm font-semibold">
                          {formatCents(sub.priceCents)} <span className="font-normal text-muted">/ {sub.cycle === "monthly" ? "month" : "year"}</span>
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {used} of {plan?.sites} sites used · renews {formatDate(sub.renewsAt)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 text-muted" aria-hidden />
              <p className="text-sm text-muted">Billing is managed by the account owner.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
