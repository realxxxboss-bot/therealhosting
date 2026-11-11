import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getSite, hasCapability, listBackups, listRestoreRequests, listSubscriptions } from "@/lib/data/client";
import { getPlan } from "@/config/plans";
import { requestRestore } from "@/app/actions/sites";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatBytes, formatDateTime } from "@/lib/utils";
import { RestoreForm } from "./restore-form";

export default async function BackupsPage({ params }: PageProps<"/dashboard/sites/[siteId]/backups">) {
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = getSite(viewer, siteId);
  if (!site) notFound();
  const backups = listBackups(viewer, site.id);
  const requests = listRestoreRequests(viewer, site.id);
  const plan = getPlan(listSubscriptions(viewer).find((s) => s.id === site.subscriptionId)?.planId ?? "");
  const canManage = hasCapability(viewer, "sites:manage");

  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Daily backups, stored off-site">
        We back up {site.type === "wordpress" ? "files and the database" : site.type === "nextjs" ? "your app, its data volumes and build cache" : "your files"} every day and keep {plan?.backupDays ?? 14} days. Need a restore? Pick a backup and we&apos;ll confirm the time with you first.
      </Alert>
      {requests.length > 0 ? (
        <Card>
          <CardContent>
            <h2 className="font-semibold">Restore requests</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="primary" label={r.status === "requested" ? "Requested" : r.status === "in_progress" ? "In progress" : "Done"} />
                  <span>
                    {formatDateTime(r.createdAt)} by {r.requestedBy}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <Table>
          <caption className="sr-only">Backups for {site.name}</caption>
          <THead>
            <tr>
              <TH>Taken</TH>
              <TH>Type</TH>
              <TH>Size</TH>
              <TH>Location</TH>
              <TH>Status</TH>
              {canManage ? <TH className="text-right">Restore</TH> : null}
            </tr>
          </THead>
          <tbody>
            {backups.map((b) => (
              <TR key={b.id}>
                <TD>{formatDateTime(b.createdAt)}</TD>
                <TD className="capitalize">{b.kind.replace("-", " ")}</TD>
                <TD className="text-muted">{formatBytes(b.sizeBytes)}</TD>
                <TD className="text-muted">{b.location}</TD>
                <TD>
                  <StatusBadge tone={b.status === "completed" ? "success" : b.status === "running" ? "primary" : "danger"} label={b.status === "completed" ? "Completed" : b.status === "running" ? "Running" : "Failed"} />
                </TD>
                {canManage ? <TD className="text-right">{b.status === "completed" ? <RestoreForm siteId={site.id} backupId={b.id} action={requestRestore} /> : null}</TD> : null}
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
