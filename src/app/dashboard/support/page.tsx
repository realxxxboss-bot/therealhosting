import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import Link from "next/link";
import { LifeBuoy, MessageCircle } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { listSites, listTickets } from "@/lib/data/client";
import { whatsappLink } from "@/config/site";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TicketStatusBadge } from "@/components/app/status";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Support" };

export default async function SupportPage() {
  const now = await requestTime();
  const viewer = await getViewer();
  const tickets = await listTickets(viewer);
  const sites = new Map((await listSites(viewer)).map((s) => [s.id, s.name]));
  const wa = whatsappLink(`Hi Zaffre, this is ${viewer.account.name}.`);
  return (
    <>
      <PageHeader
        title="Support"
        description="Talk to the people who look after your sites. We reply every day, within 24 hours."
        actions={
          <>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-2">
                <MessageCircle className="size-4 text-success" aria-hidden /> WhatsApp
              </a>
            ) : null}
            <ButtonLink href="/dashboard/support/new">New ticket</ButtonLink>
          </>
        }
      />
      <Card>
        {tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No tickets yet" body="When you need help, open a ticket and a real person will reply." action={<ButtonLink href="/dashboard/support/new">New ticket</ButtonLink>} />
        ) : (
          <ul className="divide-y divide-border">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/dashboard/support/${t.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2">
                  <span className="w-14 font-mono text-xs text-muted">#{t.number}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{t.subject}</p>
                    <p className="text-sm text-muted">
                      {t.siteId ? sites.get(t.siteId) ?? "Site" : "General"}, {t.messages.length} message{t.messages.length === 1 ? "" : "s"}, updated {formatRelative(t.updatedAt, now)}
                    </p>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
