import type { Metadata } from "next";
import Link from "next/link";
import { requestTime } from "@/lib/request";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { invoiceTotalCents, isOverdue } from "@/lib/billing";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge, type BadgeTone } from "@/components/ui/badge";
import { formatCents, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

interface QueueItem {
  key: string;
  tone: BadgeTone;
  kind: string;
  client: string;
  detail: string;
  since: string;
  href: string;
  action: string;
}

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
  const client = (id: string) => accounts.get(id) ?? "Unknown client";
  const recent = store.auditLog.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  const queue: QueueItem[] = [
    ...unhealthy.map((s) => ({ key: s.id, tone: "danger" as const, kind: s.status === "down" ? "Site down" : "Site slow", client: client(s.accountId), detail: `${s.name}, ${s.responseMs} ms`, since: s.lastDeployAt, href: "/admin/sites", action: "Open sites" })),
    ...pending.map((p) => ({ key: p.id, tone: "warning" as const, kind: "Payment to check", client: client(p.accountId), detail: `${formatCents(p.amountCents)}, reference ${p.reference}`, since: p.submittedAt, href: "/admin/payments", action: "Check proof" })),
    ...openTickets.map((t) => ({
      key: t.id,
      tone: t.priority === "urgent" || t.priority === "high" ? ("danger" as const) : ("primary" as const),
      kind: `Ticket #${t.number}`,
      client: client(t.accountId),
      detail: t.subject,
      since: t.updatedAt,
      href: `/admin/tickets/${t.id}`,
      action: "Reply",
    })),
    ...overdue.map((i) => ({ key: i.id, tone: "danger" as const, kind: "Overdue invoice", client: client(i.accountId), detail: `${i.number}, ${formatCents(invoiceTotalCents(i))}`, since: i.dueAt, href: "/admin/invoices", action: "Open invoice" })),
  ];

  const facts = [
    { label: "Clients", value: String(store.accounts.length), hint: `${store.sites.length} sites hosted` },
    { label: "Monthly recurring", value: formatCents(mrr), hint: `${activeSubs.length} active packages` },
    { label: "Payments to check", value: String(pending.length), hint: "Bank and Wise proofs" },
    { label: "Open tickets", value: String(openTickets.length), hint: "Waiting on us" },
    { label: "Overdue invoices", value: String(overdue.length), hint: overdue.length ? formatCents(overdue.reduce((s, i) => s + invoiceTotalCents(i), 0)) : "None" },
    { label: "Servers", value: String(store.servers.length), hint: `${store.servers.filter((s) => s.status !== "healthy").length} need a look` },
  ];

  return (
    <>
      <PageHeader title="Admin overview" description="What needs attention across every client." />

      <section aria-labelledby="queue-heading">
        <div className="flex items-baseline justify-between gap-4 border-b border-foreground pb-3">
          <h2 id="queue-heading" className="text-lg font-semibold tracking-[-0.02em]">
            Work queue
          </h2>
          <p className="text-sm text-muted">{queue.length === 0 ? "Clear" : `${queue.length} waiting on staff`}</p>
        </div>
        {queue.length === 0 ? (
          <p className="border-b border-border py-5 text-muted">Nothing is waiting on staff.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
              <thead className="text-[0.8125rem] text-muted">
                <tr className="border-b border-border">
                  <th scope="col" className="py-2.5 pr-4 font-medium">What</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Client</th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">Detail</th>
                  <th scope="col" className="py-2.5 pr-4 text-right font-medium">Since</th>
                  <th scope="col" className="py-2.5 text-right font-medium">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {queue.map((q) => (
                  <tr key={q.key} className="border-b border-border transition-colors duration-150 hover:bg-surface-2/70">
                    <td className="py-3 pr-4">
                      <StatusBadge tone={q.tone} label={q.kind} />
                    </td>
                    <td className="py-3 pr-4 font-medium">{q.client}</td>
                    <td className="max-w-xs truncate py-3 pr-4 text-muted">{q.detail}</td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap text-muted">{formatRelative(q.since, now)}</td>
                    <td className="py-3 text-right">
                      <ButtonLink href={q.href} size="sm" variant="secondary">
                        {q.action}
                      </ButtonLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <dl className="mt-10 grid grid-cols-2 gap-x-8 border-t border-foreground md:grid-cols-3 xl:grid-cols-6">
        {facts.map((fact) => (
          <div key={fact.label} className="border-b border-border py-4 xl:border-b-0">
            <dt className="text-sm text-muted">{fact.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-[-0.025em]">{fact.value}</dd>
            <dd className="mt-0.5 text-sm text-muted">{fact.hint}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12" aria-labelledby="activity-heading">
        <div className="flex items-baseline justify-between gap-4 border-b border-foreground pb-3">
          <h2 id="activity-heading" className="text-lg font-semibold tracking-[-0.02em]">
            Recent activity
          </h2>
          <Link href="/admin/audit" className="link text-sm">
            Audit log
          </Link>
        </div>
        <ol>
          {recent.map((e) => (
            <li key={e.id} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border py-3 text-[0.9375rem]">
              <p className="min-w-0 truncate">
                <span className="font-medium">{e.actorName}</span> <span className="font-mono text-[0.8125rem] text-muted">{e.action}</span>
                {e.target ? <span className="text-muted"> {e.target}</span> : null}
              </p>
              <p className="text-sm whitespace-nowrap text-muted">{formatRelative(e.createdAt, now)}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
