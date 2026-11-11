import { requestTime } from "@/lib/request";
import { notFound } from "next/navigation";
import { GitCommit } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { getSite, listDeployments } from "@/lib/data/client";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { DeployStatusBadge } from "@/components/app/status";
import { formatDateTime, formatRelative } from "@/lib/utils";

export default async function DeploymentsPage({ params }: PageProps<"/dashboard/sites/[siteId]/deployments">) {
  const now = await requestTime();
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = getSite(viewer, siteId);
  if (!site) notFound();
  const deployments = listDeployments(viewer, site.id);
  return (
    <Card>
      {deployments.length === 0 ? (
        <EmptyState icon={GitCommit} title="No deployments yet" body="Push to your production branch or press Redeploy." />
      ) : (
        <Table>
          <caption className="sr-only">Deployment history for {site.name}</caption>
          <THead>
            <tr>
              <TH>Status</TH>
              <TH>Commit</TH>
              <TH>Branch</TH>
              <TH>By</TH>
              <TH>Duration</TH>
              <TH>When</TH>
            </tr>
          </THead>
          <tbody>
            {deployments.map((d, i) => (
              <TR key={d.id}>
                <TD>
                  <div className="flex items-center gap-2">
                    <DeployStatusBadge status={d.status} />
                    {i === 0 && d.status === "ready" ? <span className="text-xs font-medium text-primary">Live</span> : null}
                  </div>
                </TD>
                <TD>
                  <p className="font-medium">{d.message}</p>
                  <p className="font-mono text-xs text-muted">{d.commit}</p>
                </TD>
                <TD className="font-mono text-xs">{d.branch}</TD>
                <TD className="text-muted">{d.author}</TD>
                <TD className="text-muted">{d.durationSec ? `${d.durationSec}s` : "—"}</TD>
                <TD className="text-muted" title={formatDateTime(d.createdAt)}>
                  {formatRelative(d.createdAt, now)}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
