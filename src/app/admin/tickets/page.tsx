import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import Link from "next/link";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { TicketStatusBadge } from "@/components/app/status";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Tickets" };

const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
const statusOrder = { open: 0, awaiting_client: 1, closed: 2 } as const;

export default async function AdminTicketsPage() {
  const now = await requestTime();
  await getAdmin();
  const store = db();
  const accounts = new Map(store.accounts.map((a) => [a.id, a.name]));
  const tickets = [...store.tickets].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status] || priorityOrder[a.priority] - priorityOrder[b.priority] || a.updatedAt.localeCompare(b.updatedAt),
  );
  return (
    <>
      <PageHeader title="Tickets" description="Open tickets first, then by priority, oldest first." />
      <Card>
        <CardContent className="px-0 py-0">
          <Table>
            <caption className="sr-only">Support tickets</caption>
            <THead>
              <tr>
                <TH>Ticket</TH>
                <TH>Client</TH>
                <TH>Priority</TH>
                <TH>Status</TH>
                <TH>Last update</TH>
              </tr>
            </THead>
            <tbody>
              {tickets.map((t) => (
                <TR key={t.id}>
                  <TD>
                    <Link href={`/admin/tickets/${t.id}`} className="font-medium text-primary hover:underline">
                      #{t.number} {t.subject}
                    </Link>
                  </TD>
                  <TD>{accounts.get(t.accountId)}</TD>
                  <TD>
                    <StatusBadge tone={t.priority === "urgent" ? "danger" : t.priority === "high" ? "warning" : "neutral"} label={t.priority[0]!.toUpperCase() + t.priority.slice(1)} />
                  </TD>
                  <TD>
                    <TicketStatusBadge status={t.status} staffView />
                  </TD>
                  <TD className="text-muted">{formatRelative(t.updatedAt, now)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
