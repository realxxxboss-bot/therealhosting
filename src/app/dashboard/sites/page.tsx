import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import Link from "next/link";
import { Server } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { listSites, listSubscriptions, getServer } from "@/lib/data/client";
import { getPlan } from "@/config/plans";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { SiteStatusBadge } from "@/components/app/status";
import { SiteTypeIcon, siteTypeLabel } from "@/components/app/site-type";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Sites" };

export default async function SitesPage() {
  const now = await requestTime();
  const viewer = await getViewer();
  const sites = listSites(viewer);
  const subs = listSubscriptions(viewer);
  return (
    <>
      <PageHeader
        title="Sites"
        description={`${sites.length} site${sites.length === 1 ? "" : "s"} in ${viewer.account.name}`}
        actions={<ButtonLink href="/dashboard/support/new?topic=new-site" variant="secondary">Request a new site</ButtonLink>}
      />
      {sites.length === 0 ? (
        <Card>
          <EmptyState icon={Server} title="No sites yet" body="Ask us to add or migrate a site. We'll set it up and let you know when it's live." action={<ButtonLink href="/dashboard/support/new">Contact support</ButtonLink>} />
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {sites.map((s) => {
            const plan = getPlan(subs.find((x) => x.id === s.subscriptionId)?.planId ?? "");
            const server = getServer(s.serverId);
            return (
              <li key={s.id}>
                <Link href={`/dashboard/sites/${s.id}`} className="block rounded-[16px] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-primary">
                  <div className="flex items-start gap-3">
                    <SiteTypeIcon type={s.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{s.name}</p>
                      <p className="truncate text-sm text-muted">{s.primaryDomain}</p>
                    </div>
                    <SiteStatusBadge status={s.status} />
                  </div>
                  <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Response</dt>
                      <dd className="font-medium">{s.responseMs} ms</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Uptime 30d</dt>
                      <dd className="font-medium">{s.uptime30d.toFixed(2)}%</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Last deploy</dt>
                      <dd className="font-medium">{formatRelative(s.lastDeployAt, now)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
                    {siteTypeLabel(s.type)} · {plan?.name} · {server?.region}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
