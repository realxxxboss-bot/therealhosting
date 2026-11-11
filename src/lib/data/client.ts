import "server-only";
import { can, canAccessSite, type Capability } from "@/lib/auth/permissions";
import type { Viewer } from "@/lib/auth/session";
import { db, nextId } from "./store";
import type { AuditEvent, Invoice, Site } from "./types";

/**
 * Client-side data access. Every function takes the Viewer and filters by viewer.account.id,
 * so a client can never read another account's data (tenant isolation, docs/DECISIONS.md D-005).
 */

export class ForbiddenError extends Error {
  constructor(message = "You don't have access to this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(viewer: Viewer, capability: Capability): void {
  if (!can(viewer.membership, capability)) throw new ForbiddenError();
}

export function hasCapability(viewer: Viewer, capability: Capability): boolean {
  return can(viewer.membership, capability);
}

export function listSites(viewer: Viewer): Site[] {
  if (!can(viewer.membership, "sites:view")) return [];
  return db().sites.filter((s) => s.accountId === viewer.account.id && canAccessSite(viewer.membership, s.id));
}

export function getSite(viewer: Viewer, siteId: string): Site | null {
  return listSites(viewer).find((s) => s.id === siteId) ?? null;
}

export function getSiteOrThrow(viewer: Viewer, siteId: string): Site {
  const site = getSite(viewer, siteId);
  if (!site) throw new ForbiddenError("Site not found.");
  return site;
}

export function listSubscriptions(viewer: Viewer) {
  return db().subscriptions.filter((s) => s.accountId === viewer.account.id);
}

export function listDomains(viewer: Viewer) {
  const visible = new Set(listSites(viewer).map((s) => s.id));
  const all = db().domains.filter((d) => d.accountId === viewer.account.id);
  return viewer.membership.siteIds === null && can(viewer.membership, "domains:manage")
    ? all
    : all.filter((d) => d.siteId !== null && visible.has(d.siteId));
}

export function listSiteDomains(viewer: Viewer, siteId: string) {
  getSiteOrThrow(viewer, siteId);
  return db().domains.filter((d) => d.accountId === viewer.account.id && d.siteId === siteId);
}

export function listEnvVars(viewer: Viewer, siteId: string) {
  getSiteOrThrow(viewer, siteId);
  return db().envVars.filter((e) => e.siteId === siteId);
}

export function listDeployments(viewer: Viewer, siteId: string) {
  getSiteOrThrow(viewer, siteId);
  return db()
    .deployments.filter((d) => d.siteId === siteId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listBackups(viewer: Viewer, siteId: string) {
  getSiteOrThrow(viewer, siteId);
  return db()
    .backups.filter((b) => b.siteId === siteId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listRestoreRequests(viewer: Viewer, siteId: string) {
  getSiteOrThrow(viewer, siteId);
  return db().restoreRequests.filter((r) => r.siteId === siteId);
}

export function listMailboxes(viewer: Viewer) {
  if (!can(viewer.membership, "email:manage")) return [];
  return db().mailboxes.filter((m) => m.accountId === viewer.account.id);
}

export function listInvoices(viewer: Viewer): Invoice[] {
  if (!can(viewer.membership, "billing:view")) return [];
  return db()
    .invoices.filter((i) => i.accountId === viewer.account.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

export function getInvoice(viewer: Viewer, invoiceId: string): Invoice | null {
  return listInvoices(viewer).find((i) => i.id === invoiceId) ?? null;
}

export function listPayments(viewer: Viewer) {
  if (!can(viewer.membership, "billing:view")) return [];
  return db()
    .payments.filter((p) => p.accountId === viewer.account.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function listPaymentMethods() {
  return db().paymentMethods.filter((m) => m.enabled);
}

export function listTickets(viewer: Viewer) {
  const sites = new Set(listSites(viewer).map((s) => s.id));
  return db()
    .tickets.filter((t) => t.accountId === viewer.account.id)
    .filter((t) => viewer.membership.role === "owner" || t.siteId === null || sites.has(t.siteId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTicket(viewer: Viewer, ticketId: string) {
  return listTickets(viewer).find((t) => t.id === ticketId) ?? null;
}

export function listNotifications(viewer: Viewer) {
  const billing = can(viewer.membership, "billing:view");
  const siteAccess = can(viewer.membership, "sites:view");
  return db()
    .notifications.filter((n) => n.accountId === viewer.account.id)
    .filter((n) => (n.kind === "invoice" || n.kind === "payment_confirmed" ? billing : n.kind === "info" || n.kind === "ticket_reply" ? true : siteAccess))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getNotificationPrefs(viewer: Viewer) {
  return db().notificationPrefs.find((p) => p.userId === viewer.user.id);
}

export function listTeam(viewer: Viewer) {
  assertCan(viewer, "team:manage");
  const store = db();
  const members = store.memberships
    .filter((m) => m.accountId === viewer.account.id)
    .map((m) => ({ membership: m, user: store.users.find((u) => u.id === m.userId) }))
    .filter((x): x is { membership: typeof x.membership; user: NonNullable<typeof x.user> } => Boolean(x.user));
  const invites = store.invites.filter((i) => i.accountId === viewer.account.id);
  return { members, invites };
}

export function listSessions(viewer: Viewer) {
  return db().sessions.filter((s) => s.userId === viewer.user.id);
}

export function listActivity(viewer: Viewer): AuditEvent[] {
  const all = db().auditLog.filter((e) => e.accountId === viewer.account.id);
  const scoped = viewer.membership.role === "owner" ? all : all.filter((e) => e.actorId === viewer.user.id);
  return scoped.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAnnouncement() {
  const a = db().announcement;
  return a.enabled ? a : null;
}

export function getServer(serverId: string) {
  return db().servers.find((s) => s.id === serverId) ?? null;
}

/** Writes an audit event. Sensitive actions always call this. */
export function audit(viewer: Pick<Viewer, "user" | "impersonator"> & { account?: { id: string } }, action: string, target?: string): void {
  db().auditLog.unshift({
    id: nextId("aud"),
    actorId: viewer.user.id,
    actorName: viewer.user.name,
    impersonatorId: viewer.impersonator?.id,
    accountId: viewer.account?.id,
    action,
    target,
    createdAt: new Date().toISOString(),
  });
}
