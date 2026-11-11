"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdmin } from "@/lib/auth/viewer";
import { writeSession } from "@/lib/auth/session";
import { audit } from "@/lib/data/client";
import { db, nextId } from "@/lib/data/store";
import { getPlan, plans } from "@/config/plans";
import { invoiceTotalCents, nextInvoiceStatus } from "@/lib/billing";
import { fieldErrors, type FormState } from "@/lib/forms";
import { getAdapters } from "@/lib/adapters";
import { formatCents } from "@/lib/utils";
import type { User } from "@/lib/data/types";

function adminActor(admin: User, accountId?: string) {
  return { user: admin, impersonator: null, account: accountId ? { id: accountId } : undefined };
}

function notify(accountId: string, n: { kind: "invoice" | "payment_confirmed" | "ticket_reply" | "info"; title: string; body: string; href?: string }) {
  db().notifications.unshift({ id: nextId("ntf"), accountId, read: false, createdAt: new Date().toISOString(), ...n });
}

// ---------- Clients ----------

const clientSchema = z.object({
  name: z.string().trim().min(2, "Enter the client's name.").max(100),
  ownerName: z.string().trim().min(2, "Enter the owner's name.").max(80),
  ownerEmail: z.email("Enter a valid email."),
  country: z.string().trim().max(60).optional(),
});

export async function createClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const store = db();
  const email = parsed.data.ownerEmail.toLowerCase();
  if (store.users.some((u) => u.email === email)) return { ok: false, errors: { ownerEmail: "A user with this email already exists." } };
  const now = new Date().toISOString();
  const accountId = nextId("acc");
  const userId = nextId("usr");
  store.accounts.push({ id: accountId, name: parsed.data.name, billingEmail: email, country: parsed.data.country || undefined, createdAt: now, status: "active" });
  store.users.push({ id: userId, name: parsed.data.ownerName, email, isAdmin: false, twoFactorEnabled: false, createdAt: now });
  store.memberships.push({ id: nextId("mem"), accountId, userId, role: "owner", siteIds: null, createdAt: now });
  store.notificationPrefs.push({
    userId,
    email: { site_down: true, site_up: true, invoice: true, payment_confirmed: true, ticket_reply: true, deploy: true, info: true },
    whatsapp: { site_down: true, site_up: true, invoice: false, payment_confirmed: false, ticket_reply: false, deploy: false, info: false },
  });
  await getAdapters().email.send({ to: email, subject: "Welcome to Zaffre", body: `Hi ${parsed.data.ownerName}, your account for ${parsed.data.name} is ready. Set your password with the link in this email.` });
  audit(adminActor(admin, accountId), "admin.client_create", parsed.data.name);
  redirect(`/admin/clients/${accountId}`);
}

export async function updateClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const account = db().accounts.find((a) => a.id === formData.get("accountId"));
  if (!account) return { ok: false, message: "Client not found." };
  const parsed = z
    .object({ name: z.string().trim().min(2).max(100), billingEmail: z.email("Enter a valid email."), status: z.enum(["active", "suspended"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  Object.assign(account, parsed.data);
  audit(adminActor(admin, account.id), "admin.client_update", account.name);
  refresh();
  return { ok: true, message: "Client saved." };
}

export async function addAdminNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const accountId = String(formData.get("accountId") ?? "");
  if (!db().accounts.some((a) => a.id === accountId)) return { ok: false, message: "Client not found." };
  const body = z.string().trim().min(2, "Write a note.").max(2000).safeParse(formData.get("body"));
  if (!body.success) return { ok: false, errors: { body: body.error.issues[0]?.message ?? "Write a note." } };
  db().adminNotes.unshift({ id: nextId("note"), accountId, authorName: admin.name, body: body.data, createdAt: new Date().toISOString() });
  refresh();
  return { ok: true, message: "Note added." };
}

/** Sign in as the client's owner. Always audited; the client can see it in their activity log. */
export async function impersonateClient(formData: FormData): Promise<void> {
  const admin = await getAdmin();
  const store = db();
  const accountId = String(formData.get("accountId") ?? "");
  const owner = store.memberships.find((m) => m.accountId === accountId && m.role === "owner");
  const user = owner && store.users.find((u) => u.id === owner.userId);
  if (!user) redirect("/admin/clients");
  audit(adminActor(admin, accountId), "admin.impersonate_start", user.email);
  await writeSession({ uid: user.id, acc: accountId, imp: admin.id });
  redirect("/dashboard");
}

// ---------- Sites & packages ----------

const siteSchema = z.object({
  accountId: z.string().min(1, "Choose a client."),
  name: z.string().trim().min(2, "Enter a site name.").max(60),
  type: z.enum(["nextjs", "wordpress", "static"]),
  primaryDomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^([a-z0-9-]+\.)+[a-z]{2,}$/, "Enter a domain like example.com."),
  subscriptionId: z.string().min(1, "Choose a package."),
  serverId: z.string().min(1, "Choose a server."),
  repo: z.string().trim().max(120).optional(),
});

export async function createSite(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = siteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const store = db();
  const sub = store.subscriptions.find((s) => s.id === d.subscriptionId && s.accountId === d.accountId);
  const plan = sub && getPlan(sub.planId);
  if (!sub || !plan) return { ok: false, errors: { subscriptionId: "That package doesn't belong to this client." } };
  if (plan.type !== d.type) return { ok: false, errors: { type: `This package is for ${plan.type} sites.` } };
  const used = store.sites.filter((s) => s.subscriptionId === sub.id).length;
  if (used >= plan.sites) return { ok: false, errors: { subscriptionId: `${plan.name} is full (${plan.sites} sites). Upgrade or add a package first.` } };
  if (!store.servers.some((s) => s.id === d.serverId)) return { ok: false, errors: { serverId: "Unknown server." } };
  if (store.domains.some((x) => x.hostname === d.primaryDomain)) return { ok: false, errors: { primaryDomain: "That domain is already in use." } };
  const now = new Date().toISOString();
  const siteId = nextId("site");
  store.sites.push({
    id: siteId,
    accountId: d.accountId,
    subscriptionId: sub.id,
    serverId: d.serverId,
    name: d.name,
    type: d.type,
    primaryDomain: d.primaryDomain,
    status: "deploying",
    framework: d.type === "nextjs" ? "Next.js" : d.type === "wordpress" ? "WordPress" : "Static HTML",
    repo: d.repo || undefined,
    branch: d.repo ? "main" : undefined,
    createdAt: now,
    lastDeployAt: now,
    uptime30d: 100,
    responseMs: 0,
  });
  store.domains.push({ id: nextId("dom"), accountId: d.accountId, siteId, hostname: d.primaryDomain, status: "pending_dns", ssl: "pending", createdAt: now });
  audit(adminActor(admin, d.accountId), "admin.site_create", `${d.name} (${d.type})`);
  refresh();
  return { ok: true, message: `${d.name} created and queued for its first deploy.` };
}

export async function moveSite(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const store = db();
  const site = store.sites.find((s) => s.id === formData.get("siteId"));
  const server = store.servers.find((s) => s.id === formData.get("serverId"));
  if (!site || !server) return { ok: false, message: "Site or server not found." };
  if (site.serverId === server.id) return { ok: true, message: "Already on that server." };
  site.serverId = server.id;
  audit(adminActor(admin, site.accountId), "admin.site_move", `${site.name} → ${server.name}`);
  refresh();
  return { ok: true, message: `${site.name} will move to ${server.name} on its next deploy.` };
}

export async function upsertPackage(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = z
    .object({
      accountId: z.string().min(1),
      subscriptionId: z.string().optional(),
      planId: z.enum(plans.map((p) => p.id) as [string, ...string[]]),
      cycle: z.enum(["monthly", "yearly"]),
      price: z.coerce.number().min(0, "Price can't be negative.").max(100_000),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const store = db();
  if (!store.accounts.some((a) => a.id === d.accountId)) return { ok: false, message: "Client not found." };
  const priceCents = Math.round(d.price * 100);
  const existing = d.subscriptionId ? store.subscriptions.find((s) => s.id === d.subscriptionId && s.accountId === d.accountId) : undefined;
  if (existing) {
    Object.assign(existing, { planId: d.planId, cycle: d.cycle, priceCents });
    audit(adminActor(admin, d.accountId), "admin.package_update", `${d.planId} ${d.cycle} ${formatCents(priceCents)}`);
  } else {
    const start = new Date();
    const renews = new Date(start);
    if (d.cycle === "monthly") renews.setUTCMonth(renews.getUTCMonth() + 1);
    else renews.setUTCFullYear(renews.getUTCFullYear() + 1);
    store.subscriptions.push({ id: nextId("sub"), accountId: d.accountId, planId: d.planId, cycle: d.cycle, priceCents, startedAt: start.toISOString(), renewsAt: renews.toISOString(), status: "active" });
    audit(adminActor(admin, d.accountId), "admin.package_add", `${d.planId} ${d.cycle} ${formatCents(priceCents)}`);
  }
  refresh();
  return { ok: true, message: "Package saved." };
}

// ---------- Invoices & payments ----------

const invoiceSchema = z.object({
  accountId: z.string().min(1, "Choose a client."),
  dueInDays: z.coerce.number().int().min(0).max(90),
  recurring: z.enum(["on"]).optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function createInvoice(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = invoiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const store = db();
  const account = store.accounts.find((a) => a.id === parsed.data.accountId);
  if (!account) return { ok: false, errors: { accountId: "Choose a client." } };
  const descriptions = formData.getAll("lineDescription").map(String);
  const amounts = formData.getAll("lineAmount").map((v) => Number(v));
  const lines = descriptions
    .map((description, i) => ({ description: description.trim(), quantity: 1, unitCents: Math.round((amounts[i] ?? 0) * 100) }))
    .filter((l) => l.description && Number.isFinite(l.unitCents) && l.unitCents >= 0);
  if (lines.length === 0) return { ok: false, errors: { lines: "Add at least one line with a description and amount." } };
  store.counters.invoice += 1;
  const now = new Date();
  const due = new Date(now.getTime() + parsed.data.dueInDays * 86_400_000);
  const number = `ZF-${now.getUTCFullYear()}-${String(store.counters.invoice).padStart(4, "0")}`;
  const id = nextId("inv");
  store.invoices.unshift({ id, number, accountId: account.id, issuedAt: now.toISOString(), dueAt: due.toISOString(), status: "unpaid", lines, recurring: parsed.data.recurring === "on", notes: parsed.data.notes || undefined });
  const total = formatCents(invoiceTotalCents({ lines }));
  notify(account.id, { kind: "invoice", title: `New invoice ${number}`, body: `${total} due on ${due.toISOString().slice(0, 10)}.`, href: `/dashboard/billing/${id}` });
  await getAdapters().email.send({ to: account.billingEmail, subject: `Invoice ${number} for ${total}`, body: `Your invoice ${number} for ${total} is ready.` });
  audit(adminActor(admin, account.id), "admin.invoice_create", `${number} ${total}`);
  refresh();
  return { ok: true, message: `Invoice ${number} created and emailed.` };
}

/** Creates next-period invoices for every active package whose renewal is due within 7 days. */
export async function runRecurringBilling(): Promise<FormState> {
  const admin = await getAdmin();
  const store = db();
  const now = Date.now();
  let created = 0;
  for (const account of store.accounts) {
    const due = store.subscriptions.filter((s) => s.accountId === account.id && s.status === "active" && new Date(s.renewsAt).getTime() - now < 7 * 86_400_000);
    if (due.length === 0) continue;
    const alreadyBilled = store.invoices.some((i) => i.accountId === account.id && i.recurring && now - new Date(i.issuedAt).getTime() < 20 * 86_400_000);
    if (alreadyBilled) continue;
    store.counters.invoice += 1;
    const number = `ZF-${new Date(now).getUTCFullYear()}-${String(store.counters.invoice).padStart(4, "0")}`;
    const id = nextId("inv");
    const lines = due.map((s) => ({ description: `${getPlan(s.planId)?.name ?? s.planId} (${s.cycle})`, quantity: 1, unitCents: s.priceCents }));
    const dueAt = due.map((s) => s.renewsAt).sort()[0] ?? new Date(now + 7 * 86_400_000).toISOString();
    store.invoices.unshift({ id, number, accountId: account.id, issuedAt: new Date(now).toISOString(), dueAt, status: "unpaid", lines, recurring: true });
    notify(account.id, { kind: "invoice", title: `New invoice ${number}`, body: `${formatCents(invoiceTotalCents({ lines }))} for your renewal.`, href: `/dashboard/billing/${id}` });
    created++;
  }
  audit(adminActor(admin), "admin.recurring_run", `${created} invoice(s)`);
  refresh();
  return { ok: true, message: created ? `Created ${created} renewal invoice(s).` : "No renewals need invoicing right now." };
}

export async function setInvoiceStatus(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const invoice = db().invoices.find((i) => i.id === formData.get("invoiceId"));
  if (!invoice) return { ok: false, message: "Invoice not found." };
  const event = formData.get("event") === "void" ? "void" : "mark_paid";
  const next = nextInvoiceStatus(invoice.status, event);
  if (!next) return { ok: false, message: `Can't ${event === "void" ? "void" : "mark paid"} an invoice that is ${invoice.status.replace("_", " ")}.` };
  invoice.status = next;
  if (next === "paid") notify(invoice.accountId, { kind: "payment_confirmed", title: `Payment confirmed for ${invoice.number}`, body: "Thank you. Your payment was received.", href: `/dashboard/billing/${invoice.id}` });
  audit(adminActor(admin, invoice.accountId), event === "void" ? "admin.invoice_void" : "admin.invoice_paid", invoice.number);
  refresh();
  return { ok: true, message: next === "paid" ? "Marked as paid." : "Invoice voided." };
}

export async function reviewPayment(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const store = db();
  const payment = store.payments.find((p) => p.id === formData.get("paymentId"));
  if (!payment || payment.status !== "pending_verification") return { ok: false, message: "This payment was already reviewed." };
  const invoice = store.invoices.find((i) => i.id === payment.invoiceId);
  if (!invoice) return { ok: false, message: "Invoice not found." };
  const approve = formData.get("decision") === "approve";
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!approve && reason.length < 3) return { ok: false, errors: { reason: "Tell the client why (they will see this)." } };
  const next = nextInvoiceStatus(invoice.status, approve ? "approve" : "reject");
  if (!next) return { ok: false, message: "Invoice is not waiting for verification." };
  payment.status = approve ? "approved" : "rejected";
  payment.reviewedAt = new Date().toISOString();
  payment.reviewedBy = admin.id;
  if (!approve) payment.rejectReason = reason;
  invoice.status = next;
  notify(
    invoice.accountId,
    approve
      ? { kind: "payment_confirmed", title: `Payment confirmed for ${invoice.number}`, body: `Thank you. Your payment of ${formatCents(payment.amountCents)} was received.`, href: `/dashboard/billing/${invoice.id}` }
      : { kind: "invoice", title: `We couldn't confirm your payment for ${invoice.number}`, body: reason, href: `/dashboard/billing/${invoice.id}` },
  );
  audit(adminActor(admin, invoice.accountId), approve ? "admin.payment_approve" : "admin.payment_reject", `${invoice.number} ${payment.reference}`);
  refresh();
  return { ok: true, message: approve ? "Payment approved. Invoice marked paid." : "Payment rejected. The client has been told why." };
}

const methodSchema = z.object({
  label: z.string().trim().min(2, "Enter a label.").max(60),
  kind: z.enum(["bank_transfer", "wise", "other"]),
  instructions: z.string().trim().min(5, "Add short instructions.").max(400),
  fields: z.string().trim().min(3, "Add at least one detail line."),
});

/** Field lines are "Label: value", one per line. */
function parseFieldLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.split(/:(.*)/s))
    .filter((parts) => parts[0]?.trim() && parts[1]?.trim())
    .map((parts) => ({ label: parts[0]!.trim(), value: parts[1]!.trim() }));
}

export async function savePaymentMethod(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = methodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const fields = parseFieldLines(parsed.data.fields);
  if (fields.length === 0) return { ok: false, errors: { fields: "Use one line per detail, like \"IBAN: XX00 …\"." } };
  const store = db();
  const id = String(formData.get("methodId") ?? "");
  const existing = store.paymentMethods.find((m) => m.id === id);
  if (existing) Object.assign(existing, { label: parsed.data.label, kind: parsed.data.kind, instructions: parsed.data.instructions, fields });
  else store.paymentMethods.push({ id: nextId("pm"), label: parsed.data.label, kind: parsed.data.kind, instructions: parsed.data.instructions, fields, enabled: true });
  audit(adminActor(admin), "admin.payment_method_save", parsed.data.label);
  refresh();
  return { ok: true, message: "Payment method saved." };
}

export async function togglePaymentMethod(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const method = db().paymentMethods.find((m) => m.id === formData.get("methodId"));
  if (!method) return { ok: false, message: "Not found." };
  method.enabled = !method.enabled;
  audit(adminActor(admin), method.enabled ? "admin.payment_method_enable" : "admin.payment_method_disable", method.label);
  refresh();
  return { ok: true, message: method.enabled ? "Enabled." : "Disabled." };
}

// ---------- Support ----------

export async function staffReply(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const ticket = db().tickets.find((t) => t.id === formData.get("ticketId"));
  if (!ticket) return { ok: false, message: "Ticket not found." };
  const body = z.string().trim().min(2, "Write a reply.").max(10_000).safeParse(formData.get("body"));
  if (!body.success) return { ok: false, errors: { body: body.error.issues[0]?.message ?? "Write a reply." } };
  const now = new Date().toISOString();
  ticket.messages.push({ id: nextId("msg"), authorId: admin.id, authorName: "Zaffre support", fromStaff: true, body: body.data, attachments: [], createdAt: now });
  ticket.status = "awaiting_client";
  ticket.updatedAt = now;
  notify(ticket.accountId, { kind: "ticket_reply", title: `Support replied to #${ticket.number}`, body: body.data.slice(0, 140), href: `/dashboard/support/${ticket.id}` });
  audit(adminActor(admin, ticket.accountId), "admin.ticket_reply", `#${ticket.number}`);
  refresh();
  return { ok: true, message: "Reply sent. The client was notified." };
}

export async function setTicketStatus(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const ticket = db().tickets.find((t) => t.id === formData.get("ticketId"));
  const status = z.enum(["open", "awaiting_client", "closed"]).safeParse(formData.get("status"));
  if (!ticket || !status.success) return { ok: false, message: "Invalid request." };
  ticket.status = status.data;
  ticket.updatedAt = new Date().toISOString();
  audit(adminActor(admin, ticket.accountId), "admin.ticket_status", `#${ticket.number} → ${status.data}`);
  refresh();
  return { ok: true, message: "Status updated." };
}

// ---------- Backups ----------

export async function updateRestoreRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const req = db().restoreRequests.find((r) => r.id === formData.get("requestId"));
  const status = z.enum(["requested", "in_progress", "done"]).safeParse(formData.get("status"));
  if (!req || !status.success) return { ok: false, message: "Invalid request." };
  req.status = status.data;
  const site = db().sites.find((s) => s.id === req.siteId);
  audit(adminActor(admin, site?.accountId), "admin.restore_status", `${site?.name ?? req.siteId} → ${status.data}`);
  refresh();
  return { ok: true, message: "Updated." };
}

// ---------- Content ----------

export async function saveAnnouncement(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = z
    .object({ message: z.string().trim().min(5, "Write the announcement.").max(300), tone: z.enum(["info", "warning"]), enabled: z.enum(["on"]).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  Object.assign(db().announcement, { message: parsed.data.message, tone: parsed.data.tone, enabled: parsed.data.enabled === "on", updatedAt: new Date().toISOString() });
  audit(adminActor(admin), "admin.announcement", parsed.data.enabled === "on" ? "shown" : "hidden");
  refresh();
  return { ok: true, message: parsed.data.enabled === "on" ? "Banner is live in every client dashboard." : "Saved. Banner is hidden." };
}

export async function saveEmailTemplate(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const tpl = db().emailTemplates.find((t) => t.id === formData.get("templateId"));
  if (!tpl) return { ok: false, message: "Template not found." };
  const parsed = z.object({ subject: z.string().trim().min(3).max(150), body: z.string().trim().min(10).max(5000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  Object.assign(tpl, parsed.data, { updatedAt: new Date().toISOString() });
  audit(adminActor(admin), "admin.template_save", tpl.name);
  refresh();
  return { ok: true, message: "Template saved." };
}
