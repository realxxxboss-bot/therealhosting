"use server";

import { and, count, eq, gt, lt, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getPlan, plans } from "@/config/plans";
import { getAdapters, providerMessage } from "@/lib/adapters";
import { createPasswordLink, WELCOME_LINK_DAYS } from "@/lib/auth/links";
import { readSession, updateSession } from "@/lib/auth/session";
import { getAdmin } from "@/lib/auth/viewer";
import { invoiceTotalCents, nextInvoiceStatus } from "@/lib/billing";
import { audit } from "@/lib/data/client";
import { defaultNotificationPrefs } from "@/lib/data/defaults";
import type { Announcement, User } from "@/lib/data/types";
import { getDb, schema as t, type Database, type Tx } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { nextSequenceValue } from "@/lib/db/sequences";
import { fieldErrors, type FormState } from "@/lib/forms";
import { formatCents } from "@/lib/utils";

function adminActor(admin: User, accountId?: string) {
  return { user: admin, impersonator: null, account: accountId ? { id: accountId } : undefined };
}

type Notice = { kind: "invoice" | "payment_confirmed" | "ticket_reply" | "info"; title: string; body: string; href?: string };

async function notify(db: Database | Tx, accountId: string, n: Notice): Promise<void> {
  await db.insert(t.notifications).values({ id: newId("ntf"), accountId, ...n });
}

/** Next invoice number, for example ZF-2026-0019. The sequence never hands out the same number twice. */
async function nextInvoiceNumber(db: Database | Tx, now: Date): Promise<string> {
  const n = await nextSequenceValue(db, "invoice_number_seq");
  return `ZF-${now.getUTCFullYear()}-${String(n).padStart(4, "0")}`;
}

const id = z.string().min(1).max(64);

// ---------- Clients ----------

const clientSchema = z.object({
  name: z.string().trim().min(2, "Enter the client's name.").max(100),
  ownerName: z.string().trim().min(2, "Enter the owner's name.").max(80),
  ownerEmail: z.email("Enter a valid email.").max(200),
  country: z.string().trim().max(60).optional(),
});

export async function createClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const db = await getDb();
  const email = parsed.data.ownerEmail.toLowerCase();
  const [existing] = await db.select({ id: t.users.id }).from(t.users).where(eq(t.users.email, email));
  if (existing) return { ok: false, errors: { ownerEmail: "A user with this email already exists." } };
  const accountId = newId("acc");
  const userId = newId("usr");
  const link = await db.transaction(async (tx) => {
    await tx.insert(t.accounts).values({ id: accountId, name: parsed.data.name, billingEmail: email, country: parsed.data.country || null });
    await tx.insert(t.users).values({ id: userId, name: parsed.data.ownerName, email });
    await tx.insert(t.memberships).values({ id: newId("mem"), accountId, userId, role: "owner", siteIds: null });
    await tx.insert(t.notificationPrefs).values({ userId, ...defaultNotificationPrefs() });
    await audit(adminActor(admin, accountId), "admin.client_create", parsed.data.name, tx);
    return createPasswordLink(userId, WELCOME_LINK_DAYS * 86_400_000, tx);
  });
  await getAdapters().email.send({
    to: email,
    subject: "Welcome to Zaffre",
    body: `Hi ${parsed.data.ownerName},\n\nYour account for ${parsed.data.name} is ready. Open this link to choose your password. It works once and expires in ${WELCOME_LINK_DAYS} days.\n\n${link}`,
  });
  redirect(`/admin/clients/${accountId}`);
}

export async function updateClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = z
    .object({ accountId: id, name: z.string().trim().min(2).max(100), billingEmail: z.email("Enter a valid email.").max(200), status: z.enum(["active", "suspended"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const { accountId, ...values } = parsed.data;
  const db = await getDb();
  const [account] = await db.update(t.accounts).set(values).where(eq(t.accounts.id, accountId)).returning({ id: t.accounts.id });
  if (!account) return { ok: false, message: "Client not found." };
  await audit(adminActor(admin, accountId), "admin.client_update", values.name);
  refresh();
  return { ok: true, message: "Client saved." };
}

export async function addAdminNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const accountId = String(formData.get("accountId") ?? "");
  const body = z.string().trim().min(2, "Write a note.").max(2000).safeParse(formData.get("body"));
  if (!body.success) return { ok: false, errors: { body: body.error.issues[0]?.message ?? "Write a note." } };
  const db = await getDb();
  const [account] = await db.select({ id: t.accounts.id }).from(t.accounts).where(eq(t.accounts.id, accountId));
  if (!account) return { ok: false, message: "Client not found." };
  await db.insert(t.adminNotes).values({ id: newId("note"), accountId, authorName: admin.name, body: body.data });
  refresh();
  return { ok: true, message: "Note added." };
}

/** Sign in as the client's owner. Always audited; the client can see it in their activity log. */
export async function impersonateClient(formData: FormData): Promise<void> {
  const admin = await getAdmin();
  const session = await readSession();
  if (!session) redirect("/sign-in");
  const accountId = String(formData.get("accountId") ?? "");
  const db = await getDb();
  const [owner] = await db
    .select({ id: t.users.id, email: t.users.email })
    .from(t.memberships)
    .innerJoin(t.users, eq(t.users.id, t.memberships.userId))
    .where(and(eq(t.memberships.accountId, accountId), eq(t.memberships.role, "owner")))
    .orderBy(t.memberships.createdAt)
    .limit(1);
  if (!owner) redirect("/admin/clients");
  await audit(adminActor(admin, accountId), "admin.impersonate_start", owner.email);
  await updateSession(session, { uid: owner.id, acc: accountId, imp: admin.id });
  redirect("/dashboard");
}

// ---------- Sites & packages ----------

const siteSchema = z.object({
  accountId: z.string().min(1, "Choose a client.").max(64),
  name: z.string().trim().min(2, "Enter a site name.").max(60),
  type: z.enum(["nextjs", "wordpress", "static"]),
  primaryDomain: z
    .string()
    .trim()
    .toLowerCase()
    .max(253)
    .regex(/^([a-z0-9-]+\.)+[a-z]{2,}$/, "Enter a domain like example.com."),
  subscriptionId: z.string().min(1, "Choose a package.").max(64),
  serverId: z.string().min(1, "Choose a server.").max(64),
  repo: z.string().trim().max(120).optional(),
});

export async function createSite(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = siteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const db = await getDb();
  const [sub] = await db
    .select()
    .from(t.subscriptions)
    .where(and(eq(t.subscriptions.id, d.subscriptionId), eq(t.subscriptions.accountId, d.accountId)));
  const plan = sub && getPlan(sub.planId);
  if (!sub || !plan) return { ok: false, errors: { subscriptionId: "That package doesn't belong to this client." } };
  if (plan.type !== d.type) return { ok: false, errors: { type: `This package is for ${plan.type} sites.` } };
  const [server] = await db.select({ id: t.servers.id }).from(t.servers).where(eq(t.servers.id, d.serverId));
  if (!server) return { ok: false, errors: { serverId: "Unknown server." } };

  const error = await db.transaction(async (tx): Promise<FormState["errors"] | null> => {
    const [used] = await tx.select({ n: count() }).from(t.sites).where(eq(t.sites.subscriptionId, sub.id));
    if ((used?.n ?? 0) >= plan.sites) return { subscriptionId: `${plan.name} is full (${plan.sites} sites). Upgrade or add a package first.` };
    const siteId = newId("site");
    const now = new Date().toISOString();
    await tx.insert(t.sites).values({
      id: siteId,
      accountId: d.accountId,
      subscriptionId: sub.id,
      serverId: d.serverId,
      name: d.name,
      type: d.type,
      primaryDomain: d.primaryDomain,
      status: "deploying",
      framework: d.type === "nextjs" ? "Next.js" : d.type === "wordpress" ? "WordPress" : "Static HTML",
      repo: d.repo || null,
      branch: d.repo ? "main" : null,
      lastDeployAt: now,
      uptime30d: 100,
      responseMs: 0,
    });
    const domain = await tx
      .insert(t.domains)
      .values({ id: newId("dom"), accountId: d.accountId, siteId, hostname: d.primaryDomain, status: "pending_dns", ssl: "pending" })
      .onConflictDoNothing()
      .returning({ id: t.domains.id });
    if (domain.length === 0) {
      tx.rollback();
    }
    await audit(adminActor(admin, d.accountId), "admin.site_create", `${d.name} (${d.type})`, tx);
    return null;
  }).catch((e: unknown) => {
    if (e instanceof Error && e.name === "TransactionRollbackError") return { primaryDomain: "That domain is already in use." };
    throw e;
  });
  if (error) return { ok: false, errors: error };
  refresh();
  return { ok: true, message: `${d.name} created and queued for its first deploy.` };
}

export async function moveSite(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const db = await getDb();
  const [site] = await db.select().from(t.sites).where(eq(t.sites.id, String(formData.get("siteId") ?? "")));
  const [server] = await db.select().from(t.servers).where(eq(t.servers.id, String(formData.get("serverId") ?? "")));
  if (!site || !server) return { ok: false, message: "Site or server not found." };
  if (site.serverId === server.id) return { ok: true, message: "Already on that server." };
  await db.update(t.sites).set({ serverId: server.id }).where(eq(t.sites.id, site.id));
  await audit(adminActor(admin, site.accountId), "admin.site_move", `${site.name} → ${server.name}`);
  refresh();
  return { ok: true, message: `${site.name} will move to ${server.name} on its next deploy.` };
}

const deployRefSchema = z
  .string()
  .trim()
  .max(64)
  .regex(/^[A-Za-z0-9_-]*$/, "Paste the application uuid from Coolify (letters, numbers and dashes).");

/**
 * Links a site to its application in Coolify, and makes sure its domain is monitored.
 * An empty value unlinks it. Monitoring is best effort: if the uptime service isn't
 * connected yet, the link is still saved.
 */
export async function linkSite(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = deployRefSchema.safeParse(formData.get("deployRef") ?? "");
  if (!parsed.success) return { ok: false, errors: { deployRef: parsed.error.issues[0]?.message ?? "Invalid value." } };
  const db = await getDb();
  const [site] = await db.select().from(t.sites).where(eq(t.sites.id, String(formData.get("siteId") ?? "")));
  if (!site) return { ok: false, message: "Site not found." };
  const deployRef = parsed.data || null;
  let monitorRef = site.monitorRef;
  let monitorNote = "";
  if (deployRef && !monitorRef) {
    try {
      monitorRef = (await getAdapters().uptime.ensureMonitor({ id: site.id, primaryDomain: site.primaryDomain })).monitorRef;
    } catch (e) {
      const message = providerMessage(e);
      if (!message) throw e;
      monitorNote = ` Monitoring was not set up: ${message}`;
    }
  }
  await db.update(t.sites).set({ deployRef, monitorRef }).where(eq(t.sites.id, site.id));
  await audit(adminActor(admin, site.accountId), "admin.site_link", `${site.name} → ${deployRef ?? "unlinked"}`);
  refresh();
  return { ok: true, message: deployRef ? `${site.name} is linked.${monitorNote}` : `${site.name} is unlinked.` };
}

export async function upsertPackage(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = z
    .object({
      accountId: id,
      subscriptionId: z.string().max(64).optional(),
      planId: z.enum(plans.map((p) => p.id) as [string, ...string[]]),
      cycle: z.enum(["monthly", "yearly"]),
      price: z.coerce.number().min(0, "Price can't be negative.").max(100_000),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const db = await getDb();
  const [account] = await db.select({ id: t.accounts.id }).from(t.accounts).where(eq(t.accounts.id, d.accountId));
  if (!account) return { ok: false, message: "Client not found." };
  const priceCents = Math.round(d.price * 100);
  const updated = d.subscriptionId
    ? await db
        .update(t.subscriptions)
        .set({ planId: d.planId, cycle: d.cycle, priceCents })
        .where(and(eq(t.subscriptions.id, d.subscriptionId), eq(t.subscriptions.accountId, d.accountId)))
        .returning({ id: t.subscriptions.id })
    : [];
  if (updated.length > 0) {
    await audit(adminActor(admin, d.accountId), "admin.package_update", `${d.planId} ${d.cycle} ${formatCents(priceCents)}`);
  } else {
    const start = new Date();
    const renews = new Date(start);
    if (d.cycle === "monthly") renews.setUTCMonth(renews.getUTCMonth() + 1);
    else renews.setUTCFullYear(renews.getUTCFullYear() + 1);
    await db.insert(t.subscriptions).values({ id: newId("sub"), accountId: d.accountId, planId: d.planId, cycle: d.cycle, priceCents, startedAt: start.toISOString(), renewsAt: renews.toISOString(), status: "active" });
    await audit(adminActor(admin, d.accountId), "admin.package_add", `${d.planId} ${d.cycle} ${formatCents(priceCents)}`);
  }
  refresh();
  return { ok: true, message: "Package saved." };
}

// ---------- Invoices & payments ----------

const invoiceSchema = z.object({
  accountId: z.string().min(1, "Choose a client.").max(64),
  dueInDays: z.coerce.number().int().min(0).max(90),
  recurring: z.enum(["on"]).optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function createInvoice(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = invoiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const db = await getDb();
  const [account] = await db.select().from(t.accounts).where(eq(t.accounts.id, parsed.data.accountId));
  if (!account) return { ok: false, errors: { accountId: "Choose a client." } };
  const descriptions = formData.getAll("lineDescription").map(String);
  const amounts = formData.getAll("lineAmount").map((v) => Number(v));
  const lines = descriptions
    .slice(0, 50)
    .map((description, i) => ({ description: description.trim().slice(0, 200), quantity: 1, unitCents: Math.round((amounts[i] ?? 0) * 100) }))
    .filter((l) => l.description && Number.isFinite(l.unitCents) && l.unitCents >= 0 && l.unitCents <= 100_000_00);
  if (lines.length === 0) return { ok: false, errors: { lines: "Add at least one line with a description and amount." } };
  const now = new Date();
  const due = new Date(now.getTime() + parsed.data.dueInDays * 86_400_000);
  const invoiceId = newId("inv");
  const total = formatCents(invoiceTotalCents({ lines }));
  const number = await db.transaction(async (tx) => {
    const number = await nextInvoiceNumber(tx, now);
    await tx.insert(t.invoices).values({ id: invoiceId, number, accountId: account.id, issuedAt: now.toISOString(), dueAt: due.toISOString(), status: "unpaid", lines, recurring: parsed.data.recurring === "on", notes: parsed.data.notes || null });
    await notify(tx, account.id, { kind: "invoice", title: `New invoice ${number}`, body: `${total} due on ${due.toISOString().slice(0, 10)}.`, href: `/dashboard/billing/${invoiceId}` });
    await audit(adminActor(admin, account.id), "admin.invoice_create", `${number} ${total}`, tx);
    return number;
  });
  await getAdapters().email.send({ to: account.billingEmail, subject: `Invoice ${number} for ${total}`, body: `Your invoice ${number} for ${total} is ready.` });
  refresh();
  return { ok: true, message: `Invoice ${number} created and emailed.` };
}

/** Creates next-period invoices for every active package whose renewal is due within 7 days. */
export async function runRecurringBilling(): Promise<FormState> {
  const admin = await getAdmin();
  const db = await getDb();
  const now = Date.now();
  const soon = new Date(now + 7 * 86_400_000).toISOString();
  const recently = new Date(now - 20 * 86_400_000).toISOString();
  const dueSubs = await db
    .select()
    .from(t.subscriptions)
    .where(and(eq(t.subscriptions.status, "active"), lt(t.subscriptions.renewsAt, soon)));
  const byAccount = new Map<string, typeof dueSubs>();
  for (const sub of dueSubs) byAccount.set(sub.accountId, [...(byAccount.get(sub.accountId) ?? []), sub]);

  let created = 0;
  for (const [accountId, due] of byAccount) {
    await db.transaction(async (tx) => {
      // One renewal run at a time per client, so a double click can't bill twice.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`billing:${accountId}`}))`);
      const [billed] = await tx
        .select({ id: t.invoices.id })
        .from(t.invoices)
        .where(and(eq(t.invoices.accountId, accountId), eq(t.invoices.recurring, true), gt(t.invoices.issuedAt, recently)))
        .limit(1);
      if (billed) return;
      const issued = new Date(now);
      const number = await nextInvoiceNumber(tx, issued);
      const invoiceId = newId("inv");
      const lines = due.map((s) => ({ description: `${getPlan(s.planId)?.name ?? s.planId} (${s.cycle})`, quantity: 1, unitCents: s.priceCents }));
      const dueAt = due.map((s) => s.renewsAt).sort()[0] ?? soon;
      await tx.insert(t.invoices).values({ id: invoiceId, number, accountId, issuedAt: issued.toISOString(), dueAt, status: "unpaid", lines, recurring: true });
      await notify(tx, accountId, { kind: "invoice", title: `New invoice ${number}`, body: `${formatCents(invoiceTotalCents({ lines }))} for your renewal.`, href: `/dashboard/billing/${invoiceId}` });
      created++;
    });
  }
  await audit(adminActor(admin), "admin.recurring_run", `${created} invoice(s)`);
  refresh();
  return { ok: true, message: created ? `Created ${created} renewal invoice(s).` : "No renewals need invoicing right now." };
}

export async function setInvoiceStatus(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const db = await getDb();
  const [invoice] = await db.select().from(t.invoices).where(eq(t.invoices.id, String(formData.get("invoiceId") ?? "")));
  if (!invoice) return { ok: false, message: "Invoice not found." };
  const event = formData.get("event") === "void" ? "void" : "mark_paid";
  const next = nextInvoiceStatus(invoice.status, event);
  if (!next) return { ok: false, message: `Can't ${event === "void" ? "void" : "mark paid"} an invoice that is ${invoice.status.replace("_", " ")}.` };
  const changed = await db.transaction(async (tx) => {
    const moved = await tx
      .update(t.invoices)
      .set({ status: next })
      .where(and(eq(t.invoices.id, invoice.id), eq(t.invoices.status, invoice.status)))
      .returning({ id: t.invoices.id });
    if (moved.length === 0) return false;
    if (next === "paid") await notify(tx, invoice.accountId, { kind: "payment_confirmed", title: `Payment confirmed for ${invoice.number}`, body: "Thank you. Your payment was received.", href: `/dashboard/billing/${invoice.id}` });
    await audit(adminActor(admin, invoice.accountId), event === "void" ? "admin.invoice_void" : "admin.invoice_paid", invoice.number, tx);
    return true;
  });
  if (!changed) return { ok: false, message: "This invoice was just changed by someone else. Reload and try again." };
  refresh();
  return { ok: true, message: next === "paid" ? "Marked as paid." : "Invoice voided." };
}

export async function reviewPayment(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const db = await getDb();
  const [payment] = await db.select().from(t.payments).where(eq(t.payments.id, String(formData.get("paymentId") ?? "")));
  if (!payment || payment.status !== "pending_verification") return { ok: false, message: "This payment was already reviewed." };
  const [invoice] = await db.select().from(t.invoices).where(eq(t.invoices.id, payment.invoiceId));
  if (!invoice) return { ok: false, message: "Invoice not found." };
  const approve = formData.get("decision") === "approve";
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!approve && reason.length < 3) return { ok: false, errors: { reason: "Tell the client why (they will see this)." } };
  const next = nextInvoiceStatus(invoice.status, approve ? "approve" : "reject");
  if (!next) return { ok: false, message: "Invoice is not waiting for verification." };

  const reviewed = await db.transaction(async (tx) => {
    // Claim the payment; a second reviewer finds it already decided.
    const claimed = await tx
      .update(t.payments)
      .set({ status: approve ? "approved" : "rejected", reviewedAt: new Date().toISOString(), reviewedBy: admin.id, rejectReason: approve ? null : reason })
      .where(and(eq(t.payments.id, payment.id), eq(t.payments.status, "pending_verification")))
      .returning({ id: t.payments.id });
    if (claimed.length === 0) return false;
    await tx.update(t.invoices).set({ status: next }).where(eq(t.invoices.id, invoice.id));
    await notify(
      tx,
      invoice.accountId,
      approve
        ? { kind: "payment_confirmed", title: `Payment confirmed for ${invoice.number}`, body: `Thank you. Your payment of ${formatCents(payment.amountCents)} was received.`, href: `/dashboard/billing/${invoice.id}` }
        : { kind: "invoice", title: `We couldn't confirm your payment for ${invoice.number}`, body: reason, href: `/dashboard/billing/${invoice.id}` },
    );
    await audit(adminActor(admin, invoice.accountId), approve ? "admin.payment_approve" : "admin.payment_reject", `${invoice.number} ${payment.reference}`, tx);
    return true;
  });
  if (!reviewed) return { ok: false, message: "This payment was already reviewed." };

  const [account] = await db.select({ billingEmail: t.accounts.billingEmail }).from(t.accounts).where(eq(t.accounts.id, invoice.accountId));
  if (account) {
    await getAdapters().email.send(
      approve
        ? { to: account.billingEmail, subject: `Payment received for ${invoice.number}`, body: `Thank you. We received your payment of ${formatCents(payment.amountCents)} for invoice ${invoice.number}.` }
        : { to: account.billingEmail, subject: `We couldn't confirm your payment for ${invoice.number}`, body: `We could not match your payment for invoice ${invoice.number}.\n\nReason: ${reason}\n\nYou can submit it again from your dashboard.` },
    );
  }
  refresh();
  return { ok: true, message: approve ? "Payment approved. Invoice marked paid." : "Payment rejected. The client has been told why." };
}

const methodSchema = z.object({
  label: z.string().trim().min(2, "Enter a label.").max(60),
  kind: z.enum(["bank_transfer", "wise", "other"]),
  instructions: z.string().trim().min(5, "Add short instructions.").max(400),
  fields: z.string().trim().min(3, "Add at least one detail line.").max(2000),
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
  const db = await getDb();
  const values = { label: parsed.data.label, kind: parsed.data.kind, instructions: parsed.data.instructions, fields };
  const updated = await db
    .update(t.paymentMethods)
    .set(values)
    .where(eq(t.paymentMethods.id, String(formData.get("methodId") ?? "")))
    .returning({ id: t.paymentMethods.id });
  if (updated.length === 0) await db.insert(t.paymentMethods).values({ id: newId("pm"), ...values, enabled: true });
  await audit(adminActor(admin), "admin.payment_method_save", parsed.data.label);
  refresh();
  return { ok: true, message: "Payment method saved." };
}

export async function togglePaymentMethod(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const db = await getDb();
  const [method] = await db
    .update(t.paymentMethods)
    .set({ enabled: sql`not ${t.paymentMethods.enabled}` })
    .where(eq(t.paymentMethods.id, String(formData.get("methodId") ?? "")))
    .returning({ enabled: t.paymentMethods.enabled, label: t.paymentMethods.label });
  if (!method) return { ok: false, message: "Not found." };
  await audit(adminActor(admin), method.enabled ? "admin.payment_method_enable" : "admin.payment_method_disable", method.label);
  refresh();
  return { ok: true, message: method.enabled ? "Enabled." : "Disabled." };
}

// ---------- Support ----------

export async function staffReply(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const body = z.string().trim().min(2, "Write a reply.").max(10_000).safeParse(formData.get("body"));
  if (!body.success) return { ok: false, errors: { body: body.error.issues[0]?.message ?? "Write a reply." } };
  const db = await getDb();
  const [ticket] = await db.select().from(t.tickets).where(eq(t.tickets.id, String(formData.get("ticketId") ?? "")));
  if (!ticket) return { ok: false, message: "Ticket not found." };
  await db.transaction(async (tx) => {
    await tx.insert(t.ticketMessages).values({ id: newId("msg"), ticketId: ticket.id, authorId: admin.id, authorName: "Zaffre support", fromStaff: true, body: body.data, attachments: [] });
    await tx.update(t.tickets).set({ status: "awaiting_client", updatedAt: new Date().toISOString() }).where(eq(t.tickets.id, ticket.id));
    await notify(tx, ticket.accountId, { kind: "ticket_reply", title: `Support replied to #${ticket.number}`, body: body.data.slice(0, 140), href: `/dashboard/support/${ticket.id}` });
    await audit(adminActor(admin, ticket.accountId), "admin.ticket_reply", `#${ticket.number}`, tx);
  });
  const [account] = await db.select({ billingEmail: t.accounts.billingEmail }).from(t.accounts).where(eq(t.accounts.id, ticket.accountId));
  if (account) await getAdapters().email.send({ to: account.billingEmail, subject: `[#${ticket.number}] ${ticket.subject}`, body: `Zaffre support replied to your ticket:\n\n${body.data}` });
  refresh();
  return { ok: true, message: "Reply sent. The client was notified." };
}

export async function setTicketStatus(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const status = z.enum(["open", "awaiting_client", "closed"]).safeParse(formData.get("status"));
  if (!status.success) return { ok: false, message: "Invalid request." };
  const db = await getDb();
  const [ticket] = await db
    .update(t.tickets)
    .set({ status: status.data, updatedAt: new Date().toISOString() })
    .where(eq(t.tickets.id, String(formData.get("ticketId") ?? "")))
    .returning({ number: t.tickets.number, accountId: t.tickets.accountId });
  if (!ticket) return { ok: false, message: "Invalid request." };
  await audit(adminActor(admin, ticket.accountId), "admin.ticket_status", `#${ticket.number} → ${status.data}`);
  refresh();
  return { ok: true, message: "Status updated." };
}

// ---------- Backups ----------

export async function updateRestoreRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const status = z.enum(["requested", "in_progress", "done"]).safeParse(formData.get("status"));
  if (!status.success) return { ok: false, message: "Invalid request." };
  const db = await getDb();
  const [req] = await db
    .update(t.restoreRequests)
    .set({ status: status.data })
    .where(eq(t.restoreRequests.id, String(formData.get("requestId") ?? "")))
    .returning({ siteId: t.restoreRequests.siteId });
  if (!req) return { ok: false, message: "Invalid request." };
  const [site] = await db.select({ name: t.sites.name, accountId: t.sites.accountId }).from(t.sites).where(eq(t.sites.id, req.siteId));
  await audit(adminActor(admin, site?.accountId), "admin.restore_status", `${site?.name ?? req.siteId} → ${status.data}`);
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
  const now = new Date().toISOString();
  const value: Announcement = { message: parsed.data.message, tone: parsed.data.tone, enabled: parsed.data.enabled === "on", updatedAt: now };
  const db = await getDb();
  await db
    .insert(t.settings)
    .values({ key: "announcement", value, updatedAt: now })
    .onConflictDoUpdate({ target: t.settings.key, set: { value, updatedAt: now } });
  await audit(adminActor(admin), "admin.announcement", value.enabled ? "shown" : "hidden");
  refresh();
  return { ok: true, message: value.enabled ? "Banner is live in every client dashboard." : "Saved. Banner is hidden." };
}

export async function saveEmailTemplate(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdmin();
  const parsed = z.object({ subject: z.string().trim().min(3).max(150), body: z.string().trim().min(10).max(5000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const db = await getDb();
  const [tpl] = await db
    .update(t.emailTemplates)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(t.emailTemplates.id, String(formData.get("templateId") ?? "")))
    .returning({ name: t.emailTemplates.name });
  if (!tpl) return { ok: false, message: "Template not found." };
  await audit(adminActor(admin), "admin.template_save", tpl.name);
  refresh();
  return { ok: true, message: "Template saved." };
}
