import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth/viewer";
import { loadAdminStore } from "@/lib/data/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await getAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const store = await loadAdminStore();
  const accounts = new Map(store.accounts.map((a) => [a.id, a.name]));
  const users = new Map(store.users.map((u) => [u.id, u.name]));
  // Newest first. Seeded and live events are appended in different orders, so sort explicitly.
  const events = store.auditLog
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((e) => !q || [e.action, e.actorName, e.target ?? "", e.accountId ? (accounts.get(e.accountId) ?? "") : ""].some((v) => v.toLowerCase().includes(q)))
    .slice(0, 200);

  return (
    <>
      <PageHeader title="Audit log" description="Every sensitive action, by clients and staff. Entries can't be edited or deleted." />
      <form className="mb-4 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Filter
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Filter by action, person or client" className="h-10 w-full max-w-sm rounded-[4px] border border-border bg-surface px-3 text-sm" />
        <button type="submit" className="rounded-[4px] border border-border px-4 text-sm font-medium hover:bg-surface-2">
          Filter
        </button>
      </form>
      <Card>
        <CardContent className="px-0 py-0">
          <Table>
            <caption className="sr-only">Audit events</caption>
            <THead>
              <tr>
                <TH>When</TH>
                <TH>Who</TH>
                <TH>Action</TH>
                <TH>Target</TH>
                <TH>Client</TH>
              </tr>
            </THead>
            <tbody>
              {events.map((e) => (
                <TR key={e.id}>
                  <TD className="whitespace-nowrap text-muted">{formatDateTime(e.createdAt)}</TD>
                  <TD>
                    {e.actorName}
                    {e.impersonatorId ? <Badge tone="warning" className="ml-2">via {users.get(e.impersonatorId)}</Badge> : null}
                  </TD>
                  <TD className="font-mono text-xs">{e.action}</TD>
                  <TD className="text-muted">{e.target ?? ""}</TD>
                  <TD className="text-muted">{e.accountId ? accounts.get(e.accountId) : "Platform"}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
