"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { site as siteConfig } from "@/config/site";
import { getAdapters } from "@/lib/adapters";
import type { Viewer } from "@/lib/auth/session";
import { getViewer } from "@/lib/auth/viewer";
import { assertCan, audit, ForbiddenError, getSite, getTicket } from "@/lib/data/client";
import type { TicketMessage } from "@/lib/data/types";
import { getDb, schema as t, type Tx } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { readUpload, storeFile, type CheckedFile } from "@/lib/files";
import { fieldErrors, type FormState } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";

async function readAttachments(formData: FormData): Promise<{ ok: true; files: CheckedFile[] } | { ok: false; error: string }> {
  const uploads = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  if (uploads.length > 3) return { ok: false, error: "Attach up to 3 files." };
  const files: CheckedFile[] = [];
  for (const upload of uploads) {
    const checked = await readUpload(upload);
    if (!checked.ok) return { ok: false, error: `${upload.name.slice(0, 60)}: ${checked.error}` };
    files.push(checked.file);
  }
  return { ok: true, files };
}

async function saveAttachments(tx: Tx, viewer: Viewer, files: CheckedFile[]): Promise<TicketMessage["attachments"]> {
  const out: TicketMessage["attachments"] = [];
  for (const file of files) {
    const fileId = await storeFile(tx, { accountId: viewer.account.id, uploadedBy: viewer.user.id, file });
    out.push({ name: file.name, size: file.size, fileId });
  }
  return out;
}

const ticketSchema = z.object({
  subject: z.string().trim().min(4, "Add a short subject.").max(140),
  body: z.string().trim().min(10, "Tell us a little more (10+ characters).").max(10_000),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  siteId: z.string().max(64).optional(),
});

export async function createTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  let ticketId = "";
  try {
    const viewer = await getViewer();
    assertCan(viewer, "support:use");
    const parsed = ticketSchema.safeParse({ subject: formData.get("subject"), body: formData.get("body"), priority: formData.get("priority"), siteId: formData.get("siteId") || undefined });
    if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
    if (!(await rateLimit(`ticket:${viewer.user.id}`, 10, 60 * 60_000)).ok) return { ok: false, message: "You've opened several tickets in the last hour. Please reply to an existing one." };
    const siteId = parsed.data.siteId && (await getSite(viewer, parsed.data.siteId)) ? parsed.data.siteId : null;
    const files = await readAttachments(formData);
    if (!files.ok) return { ok: false, errors: { attachments: files.error } };

    const db = await getDb();
    const id = newId("tkt");
    const number = await db.transaction(async (tx) => {
      const [ticket] = await tx
        .insert(t.tickets)
        .values({ id, accountId: viewer.account.id, siteId, subject: parsed.data.subject, status: "open", priority: parsed.data.priority })
        .returning({ number: t.tickets.number });
      const attachments = await saveAttachments(tx, viewer, files.files);
      await tx.insert(t.ticketMessages).values({ id: newId("msg"), ticketId: id, authorId: viewer.user.id, authorName: viewer.user.name, fromStaff: false, body: parsed.data.body, attachments });
      await audit(viewer, "ticket.create", `#${ticket!.number} ${parsed.data.subject}`, tx);
      return ticket!.number;
    });
    await getAdapters().email.send({ to: siteConfig.contact.supportEmail, subject: `[#${number}] ${parsed.data.subject}`, body: parsed.data.body });
    ticketId = id;
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, message: e.message };
    throw e;
  }
  redirect(`/dashboard/support/${ticketId}`);
}

export async function replyToTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const ticket = await getTicket(viewer, String(formData.get("ticketId") ?? ""));
  if (!ticket) return { ok: false, message: "Ticket not found." };
  const parsed = z.string().trim().min(2, "Write a reply.").max(10_000).safeParse(formData.get("body"));
  if (!parsed.success) return { ok: false, errors: { body: parsed.error.issues[0]?.message ?? "Write a reply." } };
  if (!(await rateLimit(`ticket-reply:${viewer.user.id}`, 30, 60 * 60_000)).ok) return { ok: false, message: "You're replying very quickly. Please wait a few minutes." };
  const files = await readAttachments(formData);
  if (!files.ok) return { ok: false, errors: { attachments: files.error } };
  const db = await getDb();
  await db.transaction(async (tx) => {
    const attachments = await saveAttachments(tx, viewer, files.files);
    await tx.insert(t.ticketMessages).values({ id: newId("msg"), ticketId: ticket.id, authorId: viewer.user.id, authorName: viewer.user.name, fromStaff: false, body: parsed.data, attachments });
    await tx
      .update(t.tickets)
      .set({ status: "open", updatedAt: new Date().toISOString() })
      .where(and(eq(t.tickets.id, ticket.id), eq(t.tickets.accountId, viewer.account.id)));
    await audit(viewer, "ticket.reply", `#${ticket.number}`, tx);
  });
  refresh();
  return { ok: true, message: "Reply sent." };
}

export async function closeTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const ticket = await getTicket(viewer, String(formData.get("ticketId") ?? ""));
  if (!ticket) return { ok: false, message: "Ticket not found." };
  const db = await getDb();
  await db
    .update(t.tickets)
    .set({ status: "closed", updatedAt: new Date().toISOString() })
    .where(and(eq(t.tickets.id, ticket.id), eq(t.tickets.accountId, viewer.account.id)));
  await audit(viewer, "ticket.close", `#${ticket.number}`);
  refresh();
  return { ok: true, message: "Ticket closed. Reply any time to reopen it." };
}
