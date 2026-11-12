import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { getSite, getTicket } from "@/lib/data/client";
import { closeTicket, replyToTicket } from "@/app/actions/support";
import { Card, CardContent } from "@/components/ui/card";
import { TicketStatusBadge } from "@/components/app/status";
import { ActionButton } from "@/components/app/action-button";
import { ReplyForm } from "@/components/app/reply-form";
import { cn, formatBytes, formatDateTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Ticket" };

export default async function TicketPage({ params }: PageProps<"/dashboard/support/[ticketId]">) {
  const { ticketId } = await params;
  const viewer = await getViewer();
  const ticket = await getTicket(viewer, ticketId);
  if (!ticket) notFound();
  const site = ticket.siteId ? await getSite(viewer, ticket.siteId) : null;
  return (
    <>
      <Link href="/dashboard/support" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Support
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted">#{ticket.number}</p>
          <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-muted">
            {site ? site.name : "General"}, {ticket.priority} priority, opened {formatDateTime(ticket.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          {ticket.status !== "closed" ? <ActionButton action={closeTicket} fields={{ ticketId: ticket.id }} label="Close ticket" variant="ghost" /> : null}
        </div>
      </div>
      <ol className="grid gap-4">
        {ticket.messages.map((m) => (
          <li key={m.id} className={cn("flex gap-3", m.fromStaff && "flex-row-reverse")}>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold", m.fromStaff ? "bg-primary text-primary-foreground" : "bg-surface-2")} aria-hidden>
              {m.fromStaff ? "Z" : initials(m.authorName)}
            </span>
            <Card className={cn("max-w-2xl flex-1", m.fromStaff && "border-zaffre-200 bg-primary-soft dark:border-zaffre-800")}>
              <CardContent className="p-4">
                <p className="text-sm font-semibold">
                  {m.authorName} <span className="font-normal text-muted">· {formatDateTime(m.createdAt)}</span>
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{m.body}</p>
                {m.attachments.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {m.attachments.map((a) => (
                      <li key={a.name} className="inline-flex items-center gap-1 rounded-[4px] border border-border bg-surface px-2 py-1 text-xs">
                        <Paperclip className="size-3" aria-hidden /> {a.fileId ? <a href={`/files/${a.fileId}`} className="link">{a.name}</a> : a.name} <span className="text-muted">({formatBytes(a.size)})</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
      <Card className="mt-6">
        <CardContent className="p-5">
          <ReplyForm ticketId={ticket.id} action={replyToTicket} placeholder={ticket.status === "closed" ? "Reply to reopen this ticket" : "Write a reply"} />
        </CardContent>
      </Card>
    </>
  );
}
