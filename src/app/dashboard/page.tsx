import type { Metadata } from "next";
import Link from "next/link";
import { requestTime } from "@/lib/request";
import { getViewer } from "@/lib/auth/viewer";
import { hasCapability, listInvoices, listNotifications, listSites, listSubscriptions, listTickets } from "@/lib/data/client";
import { getPlan } from "@/config/plans";
import { invoiceTotalCents, isOverdue } from "@/lib/billing";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { SiteStatusBadge } from "@/components/app/status";
import { siteTypeLabel } from "@/components/app/site-type";
import { cn, formatCents, formatDate, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

interface Attention {
  key: string;
  tone: "danger" | "warning" | "primary";
  title: string;
  body: string;
  href: string;
  action: string;
}

const toneDot = { danger: "bg-danger", warning: "bg-warning", primary: "bg-primary dark:bg-accent" } as const;

function SectionTitle({ title, href, link }: { title: string; href?: string; link?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground pb-3">
      <h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
      {href && link ? (
        <Link href={href} className="link text-sm">
          {link}
        </Link>
      ) : null}
    </div>
  );
}

export default async function OverviewPage() {
  const now = await requestTime();
  const viewer = await getViewer();
  const canSites = hasCapability(viewer, "sites:view");
  const canBilling = hasCapability(viewer, "billing:view");
  const sites = listSites(viewer);
  const invoices = listInvoices(viewer);
  const unpaid = invoices.filter((i) => i.status === "unpaid");
  const tickets = listTickets(viewer).filter((t) => t.status !== "closed");
  const waiting = tickets.filter((t) => t.status === "awaiting_client");
  const subs = listSubscriptions(viewer);
  const nextRenewal = subs.map((s) => s.renewsAt).sort()[0];
  const notifications = listNotifications(viewer).slice(0, 5);
  const upCount = sites.filter((s) => s.status === "up").length;
  const problemSites = sites.filter((s) => s.status === "down" || s.status === "degraded");
  const firstName = viewer.user.name.split(" ")[0];
  const unpaidTotal = unpaid.reduce((sum, i) => sum + invoiceTotalCents(i), 0);

  const attention: Attention[] = [
    ...problemSites.map((s) => ({
      key: s.id,
      tone: s.status === "down" ? ("danger" as const) : ("warning" as const),
      title: `${s.name} is ${s.status === "down" ? "down" : "responding slowly"}`,
      body: `Our team has been alerted and is looking at it. Response time right now: ${s.responseMs} ms.`,
      href: `/dashboard/sites/${s.id}`,
      action: "See the site",
    })),
    ...unpaid.map((inv) => {
      const late = isOverdue(inv, now);
      return {
        key: inv.id,
        tone: late ? ("danger" as const) : ("primary" as const),
        title: late ? `Invoice ${inv.number} is overdue` : `Invoice ${inv.number} is due ${formatRelative(inv.dueAt, now)}`,
        body: late
          ? `${formatCents(invoiceTotalCents(inv))} was due on ${formatDate(inv.dueAt)}. Your sites keep running. Pay when you can, or tell us if something is wrong.`
          : `${formatCents(invoiceTotalCents(inv))}, due on ${formatDate(inv.dueAt)}.`,
        href: `/dashboard/billing/${inv.id}/pay`,
        action: late ? "Pay now" : "View and pay",
      };
    }),
    ...waiting.map((t) => ({
      key: t.id,
      tone: "primary" as const,
      title: `We replied to ticket #${t.number}`,
      body: t.subject,
      href: `/dashboard/support/${t.id}`,
      action: "Read the reply",
    })),
  ];

  const facts = [
    ...(canSites ? [{ label: "Sites online", value: `${upCount} of ${sites.length}`, hint: problemSites.length ? `${problemSites.length} being looked at` : "All healthy" }] : []),
    { label: "Open tickets", value: String(tickets.length), hint: waiting.length ? "A reply is waiting for you" : "Nothing waiting on you" },
    ...(canBilling
      ? [
          { label: "To pay", value: formatCents(unpaidTotal), hint: unpaid.length ? `${unpaid.length} invoice${unpaid.length === 1 ? "" : "s"}` : "Nothing due" },
          { label: "Next renewal", value: nextRenewal ? formatDate(nextRenewal) : "None", hint: "Same price as today" },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader title={`Hello, ${firstName}`} description={`Here is how ${viewer.account.name} is doing today.`} />

      <section aria-labelledby="attention-heading">
        <div className="border-b border-foreground pb-3">
          <h2 id="attention-heading" className="text-lg font-semibold tracking-[-0.02em]">
            Needs your attention
          </h2>
        </div>
        {attention.length === 0 ? (
          <p className="border-b border-border py-5 text-muted">Nothing needs you today. Everything is running and paid.</p>
        ) : (
          <ul>
            {attention.map((item) => (
              <li key={item.key} className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border py-4">
                <span className={cn("mt-0.5 size-2 shrink-0 self-start rounded-full sm:mt-2", toneDot[item.tone])} aria-hidden />
                <div className="min-w-0 flex-1 basis-64">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{item.body}</p>
                </div>
                <ButtonLink href={item.href} size="sm" variant={item.tone === "danger" ? "primary" : "secondary"}>
                  {item.action}
                </ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </section>

      <dl className="mt-10 grid grid-cols-2 gap-x-8 border-t border-foreground lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="border-b border-border py-4 lg:border-b-0">
            <dt className="text-sm text-muted">{fact.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-[-0.025em]">{fact.value}</dd>
            <dd className="mt-0.5 text-sm text-muted">{fact.hint}</dd>
          </div>
        ))}
      </dl>

      {canSites ? (
        <section className="mt-12">
          <SectionTitle title="Your sites" href="/dashboard/sites" link="All sites" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.9375rem]">
              <thead className="text-[0.8125rem] text-muted">
                <tr className="border-b border-border">
                  <th scope="col" className="py-2.5 pr-4 font-medium">Site</th>
                  <th scope="col" className="hidden py-2.5 pr-4 font-medium md:table-cell">Plan</th>
                  <th scope="col" className="hidden py-2.5 pr-4 text-right font-medium sm:table-cell">Response</th>
                  <th scope="col" className="hidden py-2.5 pr-4 text-right font-medium lg:table-cell">Last deploy</th>
                  <th scope="col" className="py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => {
                  const plan = getPlan(subs.find((x) => x.id === s.subscriptionId)?.planId ?? "");
                  return (
                    <tr key={s.id} className="group border-b border-border transition-colors duration-150 hover:bg-surface-2/70">
                      <th scope="row" className="py-3.5 pr-4 font-normal">
                        <Link href={`/dashboard/sites/${s.id}`} className="block">
                          <span className="block font-medium underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-current">{s.name}</span>
                          <span className="block text-sm text-muted">{s.primaryDomain}</span>
                        </Link>
                      </th>
                      <td className="hidden py-3.5 pr-4 text-muted md:table-cell">{plan?.name ?? siteTypeLabel(s.type)}</td>
                      <td className="hidden py-3.5 pr-4 text-right text-muted tabular-nums sm:table-cell">{s.responseMs} ms</td>
                      <td className="hidden py-3.5 pr-4 text-right text-muted lg:table-cell">{formatRelative(s.lastDeployAt, now)}</td>
                      <td className="py-3.5 text-right">
                        <SiteStatusBadge status={s.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section>
          <SectionTitle title="Recent activity" href="/dashboard/notifications" link="View all" />
          <ul>
            {notifications.map((n) => (
              <li key={n.id} className="grid grid-cols-[0.5rem_1fr] gap-x-4 border-b border-border py-3.5">
                <span className={cn("mt-2 size-2 rounded-full", n.read ? "bg-border" : "bg-primary dark:bg-accent")} aria-hidden />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="font-medium">
                      {n.href ? (
                        <Link href={n.href} className="hover:underline">
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )}
                    </span>
                    <span className="text-sm text-muted">{formatRelative(n.createdAt, now)}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {canBilling ? (
          <section>
            <SectionTitle title="Your packages" href="/dashboard/billing" link="Billing" />
            <ul>
              {subs.map((sub) => {
                const plan = getPlan(sub.planId);
                const used = sites.filter((s) => s.subscriptionId === sub.id).length;
                return (
                  <li key={sub.id} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border py-3.5">
                    <p className="font-medium">{plan?.name}</p>
                    <p className="text-right font-medium tabular-nums">
                      {formatCents(sub.priceCents)} <span className="font-normal text-muted">a {sub.cycle === "monthly" ? "month" : "year"}</span>
                    </p>
                    <p className="text-sm text-muted">
                      {used} of {plan?.sites} sites used
                    </p>
                    <p className="text-right text-sm text-muted">Renews {formatDate(sub.renewsAt)}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section>
            <SectionTitle title="Billing" />
            <p className="border-b border-border py-5 text-muted">Billing is managed by the account owner.</p>
          </section>
        )}
      </div>
    </>
  );
}
