"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { audit, getSite, getTicket } from "@/lib/data/client";
import { db, nextId } from "@/lib/data/store";
import { checkUpload, safeFileName } from "@/lib/uploads";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { getAdapters } from "@/lib/adapters";
import { site as siteConfig } from "@/config/site";
import type { TicketMessage } from "@/lib/data/types";

async function readAttachments(formData: FormData): Promise<{ ok: true; files: TicketMessage["attachments"] } | { ok: false; error: string }> {
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 3) return { ok: false, error: "Attach up to 3 files." };
  const out: TicketMessage["attachments"] = [];
  for (const file of files) {
    const check = checkUpload({ size: file.size, type: file.type, head: new Uint8Array(await file.slice(0, 8).arrayBuffer()) });
    if (!check.ok) return { ok: false, error: `${safeFileName(file.name)}: ${check.error}` };
    out.push({ name: safeFileName(file.name), size: file.size });
  }
  return { ok: true, files: out };
}

const ticketSchema = z.object({
  subject: z.string().trim().min(4, "Add a short subject.").max(140),
  body: z.string().trim().min(10, "Tell us a little more (10+ characters).").max(10_000),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  siteId: z.string().optional(),
});

export async function createTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const parsed = ticketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!rateLimit(`ticket:${viewer.user.id}`, 10, 60 * 60_000).ok) return { ok: false, message: "You've opened several tickets in the last hour. Please reply to an existing one." };
  const siteId = parsed.data.siteId && getSite(viewer, parsed.data.siteId) ? parsed.data.siteId : null;
  const files = await readAttachments(formData);
  if (!files.ok) return { ok: false, errors: { attachments: files.error } };
  const store = db();
  store.counters.ticket += 1;
  const now = new Date().toISOString();
  const id = nextId("tkt");
  store.tickets.unshift({
    id,
    number: store.counters.ticket,
    accountId: viewer.account.id,
    siteId,
    subject: parsed.data.subject,
    status: "open",
    priority: parsed.data.priority,
    createdAt: now,
    updatedAt: now,
    messages: [{ id: nextId("msg"), authorId: viewer.user.id, authorName: viewer.user.name, fromStaff: false, body: parsed.data.body, attachments: files.files, createdAt: now }],
  });
  audit(viewer, "ticket.create", `#${store.counters.ticket} ${parsed.data.subject}`);
  await getAdapters().email.send({ to: siteConfig.contact.supportEmail, subject: `[#${store.counters.ticket}] ${parsed.data.subject}`, body: parsed.data.body });
  redirect(`/dashboard/support/${id}`);
}

export async function replyToTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const ticket = getTicket(viewer, String(formData.get("ticketId") ?? ""));
  if (!ticket) return { ok: false, message: "Ticket not found." };
  const parsed = z.string().trim().min(2, "Write a reply.").max(10_000).safeParse(formData.get("body"));
  if (!parsed.success) return { ok: false, errors: { body: parsed.error.issues[0]?.message ?? "Write a reply." } };
  const files = await readAttachments(formData);
  if (!files.ok) return { ok: false, errors: { attachments: files.error } };
  const now = new Date().toISOString();
  ticket.messages.push({ id: nextId("msg"), authorId: viewer.user.id, authorName: viewer.user.name, fromStaff: false, body: parsed.data, attachments: files.files, createdAt: now });
  ticket.status = "open";
  ticket.updatedAt = now;
  audit(viewer, "ticket.reply", `#${ticket.number}`);
  refresh();
  return { ok: true, message: "Reply sent." };
}

export async function closeTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const ticket = getTicket(viewer, String(formData.get("ticketId") ?? ""));
  if (!ticket) return { ok: false, message: "Ticket not found." };
  ticket.status = "closed";
  ticket.updatedAt = new Date().toISOString();
  audit(viewer, "ticket.close", `#${ticket.number}`);
  refresh();
  return { ok: true, message: "Ticket closed. Reply any time to reopen it." };
}
