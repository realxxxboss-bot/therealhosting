import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { can, canAccessSite, type Capability } from "@/lib/auth/permissions";
import { decrypt } from "@/lib/auth/secrets";
import type { Viewer } from "@/lib/auth/session";
import { getDb, schema as t, type Database, type Tx } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { clientIp } from "@/lib/request";
import { fromRow, fromRows, inviteColumns, userColumns } from "./rows";
import type {
  Announcement,
  AuditEvent,
  Backup,
  Deployment,
  Domain,
  EnvVar,
  Invite,
  Invoice,
  Mailbox,
  Membership,
  Notification,
  NotificationPrefs,
  Payment,
  PaymentMethod,
  RestoreRequest,
  Server,
  SessionRecord,
  Site,
  Subscription,
  Ticket,
  TicketMessage,
  User,
} from "./types";

/**
 * Client-side data access. Every function takes the Viewer and filters by viewer.account.id
 * in the SQL itself, so a client can never read another account's data
 * (tenant isolation, docs/DECISIONS.md D-005).
 */

export class ForbiddenError extends Error {
  constructor(message = "You don't have access to this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** What a suspended account can still do: see things, pay invoices and talk to us. */
const allowedWhileSuspended: Capability[] = ["sites:view", "billing:view", "billing:pay", "support:use"];

export function assertCan(viewer: Viewer, capability: Capability): void {
  if (!can(viewer.membership, capability)) throw new ForbiddenError();
  // An admin acting as the client can still fix things on a suspended account.
  if (viewer.account.status === "suspended" && !viewer.impersonator && !allowedWhileSuspended.includes(capability)) {
    throw new ForbiddenError("This account is suspended, so changes are paused. Open a support ticket or pay any open invoice, and we will restore it.");
  }
}

export function hasCapability(viewer: Viewer, capability: Capability): boolean {
  return can(viewer.membership, capability);
}

export async function listSites(viewer: Viewer): Promise<Site[]> {
  if (!can(viewer.membership, "sites:view")) return [];
  const db = await getDb();
  const rows = await db.select().from(t.sites).where(eq(t.sites.accountId, viewer.account.id)).orderBy(asc(t.sites.createdAt), asc(t.sites.id));
  return fromRows<Site>(rows).filter((s) => canAccessSite(viewer.membership, s.id));
}

export async function getSite(viewer: Viewer, siteId: string): Promise<Site | null> {
  if (!canAccessSite(viewer.membership, siteId)) return null;
  const db = await getDb();
  const [row] = await db
    .select()
    .from(t.sites)
    .where(and(eq(t.sites.id, siteId), eq(t.sites.accountId, viewer.account.id)));
  return row ? fromRow<Site>(row) : null;
}

export async function getSiteOrThrow(viewer: Viewer, siteId: string): Promise<Site> {
  const site = await getSite(viewer, siteId);
  if (!site) throw new ForbiddenError("Site not found.");
  return site;
}

export async function listSubscriptions(viewer: Viewer): Promise<Subscription[]> {
  const db = await getDb();
  return fromRows<Subscription>(await db.select().from(t.subscriptions).where(eq(t.subscriptions.accountId, viewer.account.id)).orderBy(asc(t.subscriptions.id)));
}

export async function listDomains(viewer: Viewer): Promise<Domain[]> {
  const db = await getDb();
  const all = fromRows<Domain>(await db.select().from(t.domains).where(eq(t.domains.accountId, viewer.account.id)).orderBy(asc(t.domains.createdAt), asc(t.domains.id)));
  if (viewer.membership.siteIds === null && can(viewer.membership, "domains:manage")) return all;
  const visible = new Set((await listSites(viewer)).map((s) => s.id));
  return all.filter((d) => d.siteId !== null && visible.has(d.siteId));
}

export async function listSiteDomains(viewer: Viewer, siteId: string): Promise<Domain[]> {
  await getSiteOrThrow(viewer, siteId);
  const db = await getDb();
  return fromRows<Domain>(
    await db
      .select()
      .from(t.domains)
      .where(and(eq(t.domains.accountId, viewer.account.id), eq(t.domains.siteId, siteId)))
      .orderBy(asc(t.domains.createdAt), asc(t.domains.id)),
  );
}

export async function listEnvVars(viewer: Viewer, siteId: string): Promise<EnvVar[]> {
  await getSiteOrThrow(viewer, siteId);
  const db = await getDb();
  const rows = fromRows<EnvVar>(await db.select().from(t.envVars).where(eq(t.envVars.siteId, siteId)).orderBy(asc(t.envVars.key)));
  // Values are encrypted at rest. Sample rows are plain text, so fall back to the stored value.
  return rows.map((row) => ({ ...row, value: decrypt(row.value) ?? row.value }));
}

export async function listDeployments(viewer: Viewer, siteId: string): Promise<Deployment[]> {
  await getSiteOrThrow(viewer, siteId);
  const db = await getDb();
  return fromRows<Deployment>(await db.select().from(t.deployments).where(eq(t.deployments.siteId, siteId)).orderBy(desc(t.deployments.createdAt)));
}

export async function listBackups(viewer: Viewer, siteId: string): Promise<Backup[]> {
  await getSiteOrThrow(viewer, siteId);
  const db = await getDb();
  return fromRows<Backup>(await db.select().from(t.backups).where(eq(t.backups.siteId, siteId)).orderBy(desc(t.backups.createdAt)));
}

export async function listRestoreRequests(viewer: Viewer, siteId: string): Promise<RestoreRequest[]> {
  await getSiteOrThrow(viewer, siteId);
  const db = await getDb();
  return fromRows<RestoreRequest>(await db.select().from(t.restoreRequests).where(eq(t.restoreRequests.siteId, siteId)).orderBy(desc(t.restoreRequests.createdAt)));
}

export async function listMailboxes(viewer: Viewer): Promise<Mailbox[]> {
  if (!can(viewer.membership, "email:manage")) return [];
  const db = await getDb();
  return fromRows<Mailbox>(await db.select().from(t.mailboxes).where(eq(t.mailboxes.accountId, viewer.account.id)).orderBy(asc(t.mailboxes.address)));
}

export async function listInvoices(viewer: Viewer): Promise<Invoice[]> {
  if (!can(viewer.membership, "billing:view")) return [];
  const db = await getDb();
  return fromRows<Invoice>(await db.select().from(t.invoices).where(eq(t.invoices.accountId, viewer.account.id)).orderBy(desc(t.invoices.issuedAt)));
}

export async function getInvoice(viewer: Viewer, invoiceId: string): Promise<Invoice | null> {
  if (!can(viewer.membership, "billing:view")) return null;
  const db = await getDb();
  const [row] = await db
    .select()
    .from(t.invoices)
    .where(and(eq(t.invoices.id, invoiceId), eq(t.invoices.accountId, viewer.account.id)));
  return row ? fromRow<Invoice>(row) : null;
}

export async function listPayments(viewer: Viewer): Promise<Payment[]> {
  if (!can(viewer.membership, "billing:view")) return [];
  const db = await getDb();
  return fromRows<Payment>(await db.select().from(t.payments).where(eq(t.payments.accountId, viewer.account.id)).orderBy(desc(t.payments.submittedAt)));
}

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const db = await getDb();
  return fromRows<PaymentMethod>(await db.select().from(t.paymentMethods).where(eq(t.paymentMethods.enabled, true)).orderBy(asc(t.paymentMethods.label)));
}

/** Attaches messages to ticket rows, oldest message first. */
export async function withMessages(db: Database | Tx, rows: (typeof t.tickets.$inferSelect)[]): Promise<Ticket[]> {
  if (rows.length === 0) return [];
  const messages = await db
    .select()
    .from(t.ticketMessages)
    .where(inArray(t.ticketMessages.ticketId, rows.map((r) => r.id)))
    .orderBy(asc(t.ticketMessages.createdAt), asc(t.ticketMessages.id));
  const byTicket = new Map<string, TicketMessage[]>();
  for (const { ticketId, ...message } of messages) {
    const list = byTicket.get(ticketId) ?? [];
    list.push(message);
    byTicket.set(ticketId, list);
  }
  return rows.map((row) => ({ ...row, messages: byTicket.get(row.id) ?? [] }));
}

export async function listTickets(viewer: Viewer): Promise<Ticket[]> {
  const db = await getDb();
  const rows = await db.select().from(t.tickets).where(eq(t.tickets.accountId, viewer.account.id)).orderBy(desc(t.tickets.updatedAt));
  const sites = viewer.membership.role === "owner" ? null : new Set((await listSites(viewer)).map((s) => s.id));
  const visible = sites === null ? rows : rows.filter((r) => r.siteId === null || sites.has(r.siteId));
  return withMessages(db, visible);
}

export async function getTicket(viewer: Viewer, ticketId: string): Promise<Ticket | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(t.tickets)
    .where(and(eq(t.tickets.id, ticketId), eq(t.tickets.accountId, viewer.account.id)));
  if (!row) return null;
  if (viewer.membership.role !== "owner" && row.siteId !== null && !(await getSite(viewer, row.siteId))) return null;
  const [ticket] = await withMessages(db, [row]);
  return ticket ?? null;
}

export async function listNotifications(viewer: Viewer): Promise<Notification[]> {
  const billing = can(viewer.membership, "billing:view");
  const siteAccess = can(viewer.membership, "sites:view");
  const db = await getDb();
  const rows = fromRows<Notification>(
    await db.select().from(t.notifications).where(eq(t.notifications.accountId, viewer.account.id)).orderBy(desc(t.notifications.createdAt)).limit(200),
  );
  return rows.filter((n) => (n.kind === "invoice" || n.kind === "payment_confirmed" ? billing : n.kind === "info" || n.kind === "ticket_reply" ? true : siteAccess));
}

export async function getNotificationPrefs(viewer: Viewer): Promise<NotificationPrefs | undefined> {
  const db = await getDb();
  const [row] = await db.select().from(t.notificationPrefs).where(eq(t.notificationPrefs.userId, viewer.user.id));
  return row;
}

export async function listTeam(viewer: Viewer): Promise<{ members: { membership: Membership; user: User }[]; invites: Invite[] }> {
  assertCan(viewer, "team:manage");
  const db = await getDb();
  const rows = await db
    .select({ membership: t.memberships, user: userColumns })
    .from(t.memberships)
    .innerJoin(t.users, eq(t.users.id, t.memberships.userId))
    .where(eq(t.memberships.accountId, viewer.account.id))
    .orderBy(asc(t.memberships.createdAt));
  const invites = await db.select(inviteColumns).from(t.invites).where(eq(t.invites.accountId, viewer.account.id)).orderBy(desc(t.invites.createdAt));
  return { members: rows.map((r) => ({ membership: r.membership, user: r.user })), invites };
}

export async function listSessions(viewer: Viewer): Promise<SessionRecord[]> {
  const db = await getDb();
  const rows = await db.select().from(t.sessions).where(eq(t.sessions.userId, viewer.user.id)).orderBy(desc(t.sessions.lastActiveAt));
  const now = new Date().toISOString();
  return rows
    .filter((s) => s.expiresAt > now)
    .map((s) => ({ id: s.id, userId: s.userId, device: s.device, location: s.location, lastActiveAt: s.lastActiveAt, current: s.id === viewer.sessionId }));
}

export async function listActivity(viewer: Viewer): Promise<AuditEvent[]> {
  const db = await getDb();
  const scope =
    viewer.membership.role === "owner"
      ? eq(t.auditLog.accountId, viewer.account.id)
      : and(eq(t.auditLog.accountId, viewer.account.id), eq(t.auditLog.actorId, viewer.user.id));
  return fromRows<AuditEvent>(await db.select().from(t.auditLog).where(scope).orderBy(desc(t.auditLog.createdAt)).limit(200));
}

export async function getAnnouncement(): Promise<Announcement | null> {
  const db = await getDb();
  const [row] = await db.select().from(t.settings).where(eq(t.settings.key, "announcement"));
  const value = row?.value as Announcement | undefined;
  return value?.enabled ? value : null;
}

export async function getServer(serverId: string): Promise<Server | null> {
  const db = await getDb();
  const [row] = await db.select().from(t.servers).where(eq(t.servers.id, serverId));
  return row ?? null;
}

type AuditActor = { user: Pick<User, "id" | "name">; impersonator?: Pick<User, "id"> | null; account?: { id: string } };

/** Writes an audit event. Sensitive actions always call this. Pass `tx` to write inside a transaction. */
export async function audit(viewer: AuditActor, action: string, target?: string, tx?: Database | Tx): Promise<void> {
  const db = tx ?? (await getDb());
  let ip: string | undefined;
  try {
    ip = await clientIp();
  } catch {
    ip = undefined; // Outside a request (scripts, tests).
  }
  await db.insert(t.auditLog).values({
    id: newId("aud"),
    actorId: viewer.user.id,
    actorName: viewer.user.name,
    impersonatorId: viewer.impersonator?.id,
    accountId: viewer.account?.id,
    action,
    target,
    ip,
  });
}
