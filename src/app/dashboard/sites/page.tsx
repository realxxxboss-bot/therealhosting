import type { Metadata } from "next";
import Link from "next/link";
import { Server } from "lucide-react";
import { requestTime } from "@/lib/request";
import { getViewer } from "@/lib/auth/viewer";
import { listSites, listSubscriptions, getServer } from "@/lib/data/client";
import { getPlan } from "@/config/plans";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { SiteStatusBadge } from "@/components/app/status";
import { siteTypeLabel } from "@/components/app/site-type";
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
          <EmptyState icon={Server} title="No sites yet" body="Ask us to add or migrate a site. We set it up and tell you when it is live." action={<ButtonLink href="/dashboard/support/new">Contact support</ButtonLink>} />
        </Card>
      ) : (
        <div className="overflow-x-auto border-t border-foreground">
          <table className="w-full text-left text-[0.9375rem]">
            <thead className="text-[0.8125rem] text-muted">
              <tr className="border-b border-border">
                <th scope="col" className="py-2.5 pr-4 font-medium">Site</th>
                <th scope="col" className="hidden py-2.5 pr-4 font-medium md:table-cell">Type and plan</th>
                <th scope="col" className="hidden py-2.5 pr-4 font-medium xl:table-cell">Region</th>
                <th scope="col" className="hidden py-2.5 pr-4 text-right font-medium sm:table-cell">Response</th>
                <th scope="col" className="hidden py-2.5 pr-4 text-right font-medium lg:table-cell">Uptime, 30 days</th>
                <th scope="col" className="hidden py-2.5 pr-4 text-right font-medium lg:table-cell">Last deploy</th>
                <th scope="col" className="py-2.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => {
                const plan = getPlan(subs.find((x) => x.id === s.subscriptionId)?.planId ?? "");
                const server = getServer(s.serverId);
                return (
                  <tr key={s.id} className="group border-b border-border transition-colors duration-150 hover:bg-surface-2/70">
                    <th scope="row" className="py-4 pr-4 font-normal">
                      <Link href={`/dashboard/sites/${s.id}`} className="block">
                        <span className="block text-base font-medium underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-current">{s.name}</span>
                        <span className="block text-sm text-muted">{s.primaryDomain}</span>
                      </Link>
                    </th>
                    <td className="hidden py-4 pr-4 md:table-cell">
                      <span className="block">{siteTypeLabel(s.type)}</span>
                      <span className="block text-sm text-muted">{plan?.name}</span>
                    </td>
                    <td className="hidden py-4 pr-4 text-muted xl:table-cell">{server?.region}</td>
                    <td className="hidden py-4 pr-4 text-right tabular-nums sm:table-cell">{s.responseMs} ms</td>
                    <td className="hidden py-4 pr-4 text-right tabular-nums lg:table-cell">{s.uptime30d.toFixed(2)}%</td>
                    <td className="hidden py-4 pr-4 text-right text-muted lg:table-cell">{formatRelative(s.lastDeployAt, now)}</td>
                    <td className="py-4 text-right">
                      <SiteStatusBadge status={s.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
