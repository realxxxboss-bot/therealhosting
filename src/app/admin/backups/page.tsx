import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { getAdapters } from "@/lib/adapters";
import { updateRestoreRequest } from "@/app/actions/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { ActionButton } from "@/components/app/action-button";
import { formatBytes, formatDateTime, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Backups" };

export default async function AdminBackupsPage() {
  const now = await requestTime();
  await getAdmin();
  const store = db();
  const sites = new Map(store.sites.map((s) => [s.id, s]));
  const accounts = new Map(store.accounts.map((a) => [a.id, a.name]));
  const requests = [...store.restoreRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latest = store.sites.map((s) => ({
    site: s,
    backup: store.backups.filter((b) => b.siteId === s.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
  }));

  return (
    <>
      <PageHeader title="Backups" description={`Daily backups for every site. Stored in ${getAdapters().backups.location}.`} />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Restore requests</CardTitle>
            <CardDescription>Clients ask; staff restore. Take a fresh backup before you restore.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <caption className="sr-only">Restore requests</caption>
            <THead>
              <tr>
                <TH>Site</TH>
                <TH>Backup</TH>
                <TH>Note</TH>
                <TH>Status</TH>
                <TH className="text-right">Next step</TH>
              </tr>
            </THead>
            <tbody>
              {requests.length === 0 ? (
                <TR>
                  <TD colSpan={5} className="text-muted">
                    No restore requests.
                  </TD>
                </TR>
              ) : null}
              {requests.map((r) => {
                const site = sites.get(r.siteId);
                const backup = store.backups.find((b) => b.id === r.backupId);
                return (
                  <TR key={r.id}>
                    <TD>
                      <span className="font-medium">{site?.name}</span>
                      <span className="block text-xs text-muted">{site ? accounts.get(site.accountId) : ""}</span>
                    </TD>
                    <TD className="text-muted">{backup ? formatDateTime(backup.createdAt) : r.backupId}</TD>
                    <TD className="max-w-xs text-muted">{r.note || "—"}</TD>
                    <TD>
                      <StatusBadge tone={r.status === "done" ? "success" : r.status === "in_progress" ? "primary" : "warning"} label={r.status === "done" ? "Done" : r.status === "in_progress" ? "In progress" : "Requested"} />
                    </TD>
                    <TD className="text-right">
                      {r.status === "requested" ? <ActionButton action={updateRestoreRequest} fields={{ requestId: r.id, status: "in_progress" }} label="Start" /> : null}
                      {r.status === "in_progress" ? <ActionButton action={updateRestoreRequest} fields={{ requestId: r.id, status: "done" }} label="Mark done" /> : null}
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Latest backup per site</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <caption className="sr-only">Latest backups</caption>
            <THead>
              <tr>
                <TH>Site</TH>
                <TH>Last backup</TH>
                <TH>Size</TH>
                <TH>Result</TH>
              </tr>
            </THead>
            <tbody>
              {latest.map(({ site, backup }) => (
                <TR key={site.id}>
                  <TD>
                    <span className="font-medium">{site.name}</span>
                    <span className="block text-xs text-muted">{accounts.get(site.accountId)}</span>
                  </TD>
                  <TD className="text-muted">{backup ? formatRelative(backup.createdAt, now) : "Never"}</TD>
                  <TD className="text-muted">{backup ? formatBytes(backup.sizeBytes) : "—"}</TD>
                  <TD>
                    {backup ? (
                      <StatusBadge tone={backup.status === "completed" ? "success" : backup.status === "running" ? "primary" : "danger"} label={backup.status[0]!.toUpperCase() + backup.status.slice(1)} />
                    ) : (
                      <StatusBadge tone="warning" label="Missing" />
                    )}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
