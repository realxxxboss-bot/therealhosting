import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { getAdmin } from "@/lib/auth/viewer";
import { loadAdminStore } from "@/lib/data/admin";
import { setTicketStatus, staffReply } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { TicketStatusBadge } from "@/components/app/status";
import { ActionButton } from "@/components/app/action-button";
import { ReplyForm } from "@/components/app/reply-form";
import { cn, formatBytes, formatDateTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Ticket" };

export default async function AdminTicketPage({ params }: PageProps<"/admin/tickets/[ticketId]">) {
  const { ticketId } = await params;
  await getAdmin();
  const store = await loadAdminStore();
  const ticket = store.tickets.find((t) => t.id === ticketId);
  if (!ticket) notFound();
  const account = store.accounts.find((a) => a.id === ticket.accountId);
  const site = ticket.siteId ? store.sites.find((s) => s.id === ticket.siteId) : null;
  return (
    <>
      <Link href="/admin/tickets" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Tickets
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted">#{ticket.number}</p>
          <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-muted">
            <Link href={`/admin/clients/${ticket.accountId}`} className="text-primary underline underline-offset-2">
              {account?.name}
            </Link>
            , {site ? `${site.name} (${site.primaryDomain})` : "General"}, {ticket.priority} priority
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TicketStatusBadge status={ticket.status} staffView />
          {ticket.status !== "closed" ? (
            <ActionButton action={setTicketStatus} fields={{ ticketId: ticket.id, status: "closed" }} label="Close" variant="ghost" />
          ) : (
            <ActionButton action={setTicketStatus} fields={{ ticketId: ticket.id, status: "open" }} label="Reopen" variant="ghost" />
          )}
        </div>
      </div>
      <ol className="grid gap-4">
        {ticket.messages.map((m) => (
          <li key={m.id} className={cn("flex gap-3", m.fromStaff && "flex-row-reverse")}>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold", m.fromStaff ? "bg-primary text-primary-foreground" : "bg-surface-2")} aria-hidden>
              {initials(m.authorName)}
            </span>
            <Card className={cn("max-w-2xl flex-1 p-4", m.fromStaff && "border-zaffre-200 bg-primary-soft dark:border-zaffre-800")}>
              <p className="text-xs text-muted">
                <span className="font-medium text-foreground">{m.authorName}</span>, {formatDateTime(m.createdAt)}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{m.body}</p>
              {m.attachments.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {m.attachments.map((a) => (
                    <li key={a.name} className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs">
                      <Paperclip className="size-3" aria-hidden /> {a.fileId ? <a href={`/files/${a.fileId}`} className="link">{a.name}</a> : a.name} ({formatBytes(a.size)})
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          </li>
        ))}
      </ol>
      <Card className="mt-6">
        <CardContent className="pt-5">
          <ReplyForm ticketId={ticket.id} action={staffReply} placeholder="Reply as Zaffre support. The client is notified." withAttachments={false} />
        </CardContent>
      </Card>
    </>
  );
}
