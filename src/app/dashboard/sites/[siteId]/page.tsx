import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getViewer } from "@/lib/auth/viewer";
import { getSite, getServer, listDeployments, listSiteDomains, listBackups } from "@/lib/data/client";
import { getAdapters } from "@/lib/adapters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Chart } from "@/components/app/chart";
import { DeployStatusBadge, SslBadge } from "@/components/app/status";
import { formatDateTime, formatRelative } from "@/lib/utils";

export default async function SiteOverview({ params }: PageProps<"/dashboard/sites/[siteId]">) {
  await connection();
  const now = Date.now();
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = getSite(viewer, siteId);
  if (!site) notFound();
  const series = await getAdapters().uptime.siteSeries(site.id, { hours: 24, now });
  const lastDeploy = site.type === "wordpress" ? undefined : listDeployments(viewer, site.id)[0];
  const domains = listSiteDomains(viewer, site.id);
  const lastBackup = listBackups(viewer, site.id).find((b) => b.status === "completed");
  const server = getServer(site.serverId);
  const downHours = series.filter((p) => !p.up).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Uptime (30 days)" value={`${site.uptime30d.toFixed(2)}%`} hint={downHours ? `${downHours} h down in the last 24 h` : "No downtime in the last 24 h"} />
        <Stat label="Avg response" value={`${site.responseMs} ms`} hint="Measured from outside our network" />
        <Stat label="Last deploy" value={formatRelative(site.lastDeployAt, now)} hint={lastDeploy?.message ?? "Managed by Zaffre"} />
        <Stat label="Last backup" value={lastBackup ? formatRelative(lastBackup.createdAt, now) : "—"} hint="Daily, stored off-site" />
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Response time, last 24 hours</CardTitle>
            <CardDescription>Hourly average in milliseconds. Gaps at zero mean the site did not respond.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Chart kind="line" title="Response time (ms)" unit=" ms" data={series.map((p) => ({ label: p.at.slice(11, 16), value: p.responseMs }))} />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Domains</CardTitle>
            <Link href={`/dashboard/sites/${site.id}/domains`} className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3">
              {domains.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-mono">{d.hostname}</span>
                  {d.redirectTo ? <span className="text-xs text-muted">redirects to {d.redirectTo}</span> : <SslBadge status={d.ssl} />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
              <dt className="text-muted">Platform</dt>
              <dd>{site.framework}</dd>
              {site.repo ? (
                <>
                  <dt className="text-muted">Repository</dt>
                  <dd className="font-mono text-xs leading-5">
                    {site.repo} @ {site.branch}
                  </dd>
                </>
              ) : null}
              <dt className="text-muted">Region</dt>
              <dd>{server?.region}</dd>
              <dt className="text-muted">Server</dt>
              <dd className="font-mono text-xs leading-5">{server?.name}</dd>
              {lastDeploy ? (
                <>
                  <dt className="text-muted">Latest deploy</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <DeployStatusBadge status={lastDeploy.status} />
                    <span className="text-xs text-muted">{formatDateTime(lastDeploy.createdAt)}</span>
                  </dd>
                </>
              ) : null}
              <dt className="text-muted">Created</dt>
              <dd>{formatDateTime(site.createdAt)}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
