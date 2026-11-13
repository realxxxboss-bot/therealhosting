import "server-only";
import { cache } from "react";
import { desc } from "drizzle-orm";
import { getAdmin } from "@/lib/auth/viewer";
import { getDb, schema as t } from "@/lib/db";
import { withMessages } from "./client";
import { fromRows, inviteColumns, userColumns } from "./rows";
import type {
  Account,
  AdminNote,
  Announcement,
  AuditEvent,
  Backup,
  Domain,
  EmailTemplate,
  Invite,
  Invoice,
  Membership,
  Payment,
  PaymentMethod,
  RestoreRequest,
  Server,
  Site,
  Subscription,
  Ticket,
  User,
} from "./types";

export interface AdminStore {
  users: User[];
  accounts: Account[];
  memberships: Membership[];
  invites: Invite[];
  servers: Server[];
  subscriptions: Subscription[];
  sites: Site[];
  domains: Domain[];
  backups: Backup[];
  restoreRequests: RestoreRequest[];
  invoices: Invoice[];
  payments: Payment[];
  paymentMethods: PaymentMethod[];
  tickets: Ticket[];
  auditLog: AuditEvent[];
  adminNotes: AdminNote[];
  announcement: Announcement;
  emailTemplates: EmailTemplate[];
}

const emptyAnnouncement: Announcement = { enabled: false, tone: "info", message: "", updatedAt: new Date(0).toISOString() };

/**
 * Everything the admin panel lists, read in one round of queries. Callers must have
 * passed `getAdmin()` first: this reads across every client account.
 *
 * The admin screens were built on whole-table views and the business has tens of
 * clients, so this is simple and fast enough today. Long tables are capped here
 * (audit log, backups); when volumes grow, each screen gets its own paged query.
 */
export const loadAdminStore = cache(async function loadAdminStore(): Promise<AdminStore> {
  // Holds every client's data, so it checks for a signed-in admin itself instead of trusting the caller.
  await getAdmin();
  const db = await getDb();
  const [users, accounts, memberships, invites, servers, subscriptions, sites, domains, backups, restoreRequests, invoices, payments, paymentMethods, ticketRows, auditLog, adminNotes, settings, emailTemplates] =
    await Promise.all([
      db.select(userColumns).from(t.users).orderBy(t.users.createdAt),
      db.select().from(t.accounts).orderBy(t.accounts.createdAt),
      db.select().from(t.memberships).orderBy(t.memberships.createdAt),
      db.select(inviteColumns).from(t.invites).orderBy(desc(t.invites.createdAt)),
      db.select().from(t.servers).orderBy(t.servers.name),
      db.select().from(t.subscriptions).orderBy(t.subscriptions.startedAt, t.subscriptions.id),
      db.select().from(t.sites).orderBy(t.sites.createdAt, t.sites.id),
      db.select().from(t.domains).orderBy(t.domains.createdAt, t.domains.id),
      db.select().from(t.backups).orderBy(desc(t.backups.createdAt)).limit(500),
      db.select().from(t.restoreRequests).orderBy(desc(t.restoreRequests.createdAt)).limit(200),
      db.select().from(t.invoices).orderBy(desc(t.invoices.issuedAt)).limit(1000),
      db.select().from(t.payments).orderBy(desc(t.payments.submittedAt)).limit(1000),
      db.select().from(t.paymentMethods).orderBy(t.paymentMethods.label),
      db.select().from(t.tickets).orderBy(desc(t.tickets.updatedAt)).limit(500),
      db.select().from(t.auditLog).orderBy(desc(t.auditLog.createdAt)).limit(500),
      db.select().from(t.adminNotes).orderBy(desc(t.adminNotes.createdAt)),
      db.select().from(t.settings),
      db.select().from(t.emailTemplates).orderBy(t.emailTemplates.name),
    ]);
  const announcement = (settings.find((s) => s.key === "announcement")?.value as Announcement | undefined) ?? emptyAnnouncement;
  return {
    users,
    accounts: fromRows<Account>(accounts),
    memberships,
    invites,
    servers,
    subscriptions,
    sites: fromRows<Site>(sites),
    domains: fromRows<Domain>(domains),
    backups,
    restoreRequests,
    invoices: fromRows<Invoice>(invoices),
    payments: fromRows<Payment>(payments),
    paymentMethods,
    tickets: await withMessages(db, ticketRows),
    auditLog: fromRows<AuditEvent>(auditLog),
    adminNotes,
    announcement,
    emailTemplates,
  };
});
