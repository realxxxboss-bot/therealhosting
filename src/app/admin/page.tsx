import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import Link from "next/link";
import { AlertTriangle, CreditCard, LifeBuoy, Server, Users, Wallet } from "lucide-react";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { invoiceTotalCents, isOverdue } from "@/lib/billing";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCents, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminOverview() {
  const now = await requestTime();
  await getAdmin();
  const store = db();
  const activeSubs = store.subscriptions.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((sum, s) => sum + (s.cycle === "monthly" ? s.priceCents : Math.round(s.priceCents / 12)), 0);
  const pending = store.payments.filter((p) => p.status === "pending_verification");
  const overdue = store.invoices.filter((i) => isOverdue(i, now));
  const openTickets = store.tickets.filter((t) => t.status === "open");
  const unhealthy = store.sites.filter((s) => s.status === "down" || s.status === "degraded");
  const accounts = new Map(store.accounts.map((a) => [a.id, a.name]));

  const queue = [
    ...pending.map((p) => ({ key: p.id, tone: "warning" as const, label: "Payment to check", text: `${accounts.get(p.accountId)} · ${formatCents(p.amountCents)} · ${p.reference}`, href: "/admin/payments" })),
    ...openTickets.map((t) => ({ key: t.id, tone: t.priority === "urgent" || t.priority === "high" ? ("danger" as const) : ("primary" as const), label: `Ticket #${t.number}`, text: `${accounts.get(t.accountId)} · ${t.subject}`, href: `/admin/tickets/${t.id}` })),
    ...overdue.map((i) => ({ key: i.id, tone: "danger" as const, label: "Overdue invoice", text: `${accounts.get(i.accountId)} · ${i.number} · ${formatCents(invoiceTotalCents(i))}`, href: "/admin/invoices" })),
    ...unhealthy.map((s) => ({ key: s.id, tone: "danger" as const, label: `Site ${s.status}`, text: `${accounts.get(s.accountId)} · ${s.name}`, href: "/admin/sites" })),
  ];

  return (
    <>
      <PageHeader title="Admin overview" description="What needs attention across every client." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Clients" value={store.accounts.length} hint={`${store.sites.length} sites hosted`} icon={Users} />
        <Stat label="Monthly recurring" value={formatCents(mrr)} hint={`${activeSubs.length} active packages`} icon={CreditCard} />
        <Stat label="Payments to check" value={pending.length} hint="Bank and Wise proofs" icon={Wallet} />
        <Stat label="Open tickets" value={openTickets.length} hint="Waiting on us" icon={LifeBuoy} />
        <Stat label="Overdue invoices" value={overdue.length} hint={overdue.length ? formatCents(overdue.reduce((s, i) => s + invoiceTotalCents(i), 0)) : "None"} icon={AlertTriangle} />
        <Stat label="Servers" value={store.servers.length} hint={`${store.servers.filter((s) => s.status !== "healthy").length} need a look`} icon={Server} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Work queue</CardTitle>
              <CardDescription>Everything waiting on staff. Clear this list every day.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <p className="text-sm text-muted">Nothing waiting. Nice.</p>
            ) : (
              <ul className="grid gap-2">
                {queue.map((q) => (
                  <li key={q.key}>
                    <Link href={q.href} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-border p-3 text-sm hover:bg-surface-2">
                      <StatusBadge tone={q.tone} label={q.label} />
                      <span className="min-w-0 flex-1 truncate">{q.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <ButtonLink href="/admin/audit" size="sm" variant="ghost">
              Audit log
            </ButtonLink>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 text-sm">
              {store.auditLog.slice(0, 8).map((e) => (
                <li key={e.id} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="font-medium">{e.actorName}</span> <span className="font-mono text-xs text-muted">{e.action}</span>
                    {e.target ? <span className="block truncate text-xs text-muted">{e.target}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{formatRelative(e.createdAt, now)}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
