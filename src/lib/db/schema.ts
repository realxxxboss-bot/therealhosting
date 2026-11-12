import { sql } from "drizzle-orm";
import { bigint, boolean, customType, doublePrecision, index, integer, jsonb, pgSequence, pgTable, primaryKey, serial, text, uniqueIndex } from "drizzle-orm/pg-core";
import type { BillingCycle, SiteType } from "@/config/plans";
import type {
  BackupStatus,
  DeployStatus,
  DomainStatus,
  InvoiceLine,
  InvoiceStatus,
  NotificationKind,
  PaymentStatus,
  Role,
  SiteStatus,
  SslStatus,
  TicketPriority,
  TicketStatus,
} from "@/lib/data/types";

/**
 * Postgres schema (Drizzle). Column names mirror `src/lib/data/types.ts`, so a row maps
 * straight onto the domain type the UI already uses.
 *
 * Conventions:
 * - Ids are prefixed text (`acc_…`, `site_…`), created by `newId()` in `./ids`.
 * - Times are `timestamptz` in the database and ISO-8601 strings in TypeScript.
 * - Money is whole US cents in an integer column.
 * - Every tenant-owned table carries `account_id` and is only read through the
 *   data-access functions, which filter by the viewer's account (DECISIONS D-005).
 */

/** `timestamptz` that reads and writes ISO strings, matching the domain types. */
const ts = customType<{ data: string; driverData: string | Date }>({
  dataType: () => "timestamp with time zone",
  fromDriver: (value) => (value instanceof Date ? value : new Date(value)).toISOString(),
  toDriver: (value) => value,
});

/** Raw bytes (`bytea`). */
const bytes = customType<{ data: Buffer; driverData: Buffer | Uint8Array }>({
  dataType: () => "bytea",
  fromDriver: (value) => Buffer.from(value),
});

const createdAt = () => ts("created_at").notNull().default(sql`now()`);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** Always stored lower-case. */
    email: text("email").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    /** scrypt hash, see `src/lib/auth/password.ts`. Null until the user sets a password. */
    passwordHash: text("password_hash"),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    /** Base32 TOTP secret, encrypted with the app key. Null when 2FA is off. */
    totpSecret: text("totp_secret"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_key").on(t.email)],
);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  billingEmail: text("billing_email").notNull(),
  country: text("country"),
  status: text("status").$type<"active" | "suspended">().notNull().default("active"),
  createdAt: createdAt(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<Role>().notNull(),
    /** null = every site in the account. */
    siteIds: jsonb("site_ids").$type<string[] | null>(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("memberships_account_user_key").on(t.accountId, t.userId), index("memberships_user_idx").on(t.userId)],
);

export const invites = pgTable(
  "invites",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").$type<Role>().notNull(),
    siteIds: jsonb("site_ids").$type<string[] | null>(),
    invitedBy: text("invited_by").notNull().references(() => users.id),
    /** SHA-256 of the emailed token. The token itself is never stored. */
    tokenHash: text("token_hash"),
    expiresAt: ts("expires_at"),
    createdAt: createdAt(),
  },
  (t) => [index("invites_account_idx").on(t.accountId), uniqueIndex("invites_token_key").on(t.tokenHash)],
);

export const servers = pgTable("servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  provider: text("provider").$type<"vps" | "proxmox">().notNull(),
  ip: text("ip").notNull(),
  vcpu: integer("vcpu").notNull(),
  ramGb: integer("ram_gb").notNull(),
  diskGb: integer("disk_gb").notNull(),
  status: text("status").$type<"healthy" | "warning" | "down">().notNull().default("healthy"),
  cpuPct: integer("cpu_pct").notNull().default(0),
  ramPct: integer("ram_pct").notNull().default(0),
  diskPct: integer("disk_pct").notNull().default(0),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    cycle: text("cycle").$type<BillingCycle>().notNull(),
    /** Locked price for this subscription. Never changes on renewal. */
    priceCents: integer("price_cents").notNull(),
    startedAt: ts("started_at").notNull(),
    renewsAt: ts("renews_at").notNull(),
    status: text("status").$type<"active" | "cancelled">().notNull().default("active"),
  },
  (t) => [index("subscriptions_account_idx").on(t.accountId)],
);

export const sites = pgTable(
  "sites",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    subscriptionId: text("subscription_id").notNull().references(() => subscriptions.id),
    serverId: text("server_id").notNull().references(() => servers.id),
    name: text("name").notNull(),
    type: text("type").$type<SiteType>().notNull(),
    primaryDomain: text("primary_domain").notNull(),
    status: text("status").$type<SiteStatus>().notNull().default("deploying"),
    framework: text("framework").notNull(),
    repo: text("repo"),
    branch: text("branch"),
    /** Application uuid in Coolify. */
    deployRef: text("deploy_ref"),
    /** Monitor id in the uptime service. */
    monitorRef: text("monitor_ref"),
    createdAt: createdAt(),
    lastDeployAt: ts("last_deploy_at").notNull(),
    uptime30d: doublePrecision("uptime_30d").notNull().default(100),
    responseMs: integer("response_ms").notNull().default(0),
  },
  (t) => [index("sites_account_idx").on(t.accountId), index("sites_server_idx").on(t.serverId)],
);

export const domains = pgTable(
  "domains",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    siteId: text("site_id").references(() => sites.id, { onDelete: "set null" }),
    hostname: text("hostname").notNull(),
    status: text("status").$type<DomainStatus>().notNull().default("pending_dns"),
    ssl: text("ssl").$type<SslStatus>().notNull().default("pending"),
    redirectTo: text("redirect_to"),
    registrar: text("registrar"),
    expiresAt: ts("expires_at"),
    /** Custom hostname id at Cloudflare. */
    providerRef: text("provider_ref"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("domains_hostname_key").on(t.hostname), index("domains_account_idx").on(t.accountId)],
);

export const envVars = pgTable(
  "env_vars",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    target: text("target").$type<"production" | "preview" | "all">().notNull().default("all"),
    updatedAt: ts("updated_at").notNull().default(sql`now()`),
  },
  (t) => [uniqueIndex("env_vars_site_key_target_key").on(t.siteId, t.key, t.target)],
);

export const deployments = pgTable(
  "deployments",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    status: text("status").$type<DeployStatus>().notNull(),
    commit: text("commit").notNull(),
    message: text("message").notNull(),
    branch: text("branch").notNull(),
    author: text("author").notNull(),
    createdAt: createdAt(),
    durationSec: integer("duration_sec").notNull().default(0),
  },
  (t) => [index("deployments_site_created_idx").on(t.siteId, t.createdAt)],
);

export const backups = pgTable(
  "backups",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    status: text("status").$type<BackupStatus>().notNull(),
    kind: text("kind").$type<"daily" | "manual" | "pre-deploy">().notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
    createdAt: createdAt(),
    location: text("location").notNull(),
  },
  (t) => [index("backups_site_created_idx").on(t.siteId, t.createdAt)],
);

export const restoreRequests = pgTable(
  "restore_requests",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    backupId: text("backup_id").notNull().references(() => backups.id, { onDelete: "cascade" }),
    requestedBy: text("requested_by").notNull(),
    note: text("note").notNull().default(""),
    status: text("status").$type<"requested" | "in_progress" | "done">().notNull().default("requested"),
    createdAt: createdAt(),
  },
  (t) => [index("restore_requests_site_idx").on(t.siteId)],
);

export const mailboxes = pgTable(
  "mailboxes",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    address: text("address").notNull(),
    domain: text("domain").notNull(),
    quotaGb: integer("quota_gb").notNull(),
    usedGb: doublePrecision("used_gb").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("mailboxes_address_key").on(t.address), index("mailboxes_account_idx").on(t.accountId)],
);

/** Source of the running invoice number (ZF-2026-0001). */
export const invoiceNumberSeq = pgSequence("invoice_number_seq", { startWith: 1 });

export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    number: text("number").notNull(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    issuedAt: ts("issued_at").notNull(),
    dueAt: ts("due_at").notNull(),
    status: text("status").$type<InvoiceStatus>().notNull().default("unpaid"),
    lines: jsonb("lines").$type<InvoiceLine[]>().notNull(),
    recurring: boolean("recurring").notNull().default(false),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("invoices_number_key").on(t.number), index("invoices_account_issued_idx").on(t.accountId, t.issuedAt)],
);

export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey(),
  kind: text("kind").$type<"bank_transfer" | "wise" | "other">().notNull(),
  label: text("label").notNull(),
  instructions: text("instructions").notNull().default(""),
  fields: jsonb("fields").$type<{ label: string; value: string }[]>().notNull(),
  enabled: boolean("enabled").notNull().default(true),
});

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    methodId: text("method_id").notNull().references(() => paymentMethods.id),
    amountCents: integer("amount_cents").notNull(),
    reference: text("reference").notNull(),
    proofFileName: text("proof_file_name").notNull(),
    proofMime: text("proof_mime").notNull(),
    proofSize: integer("proof_size").notNull(),
    /** Row in `files` holding the uploaded proof. */
    proofFileId: text("proof_file_id"),
    status: text("status").$type<PaymentStatus>().notNull().default("pending_verification"),
    submittedAt: ts("submitted_at").notNull().default(sql`now()`),
    submittedBy: text("submitted_by").notNull(),
    reviewedAt: ts("reviewed_at"),
    reviewedBy: text("reviewed_by"),
    rejectReason: text("reject_reason"),
  },
  (t) => [index("payments_account_idx").on(t.accountId), index("payments_invoice_idx").on(t.invoiceId), index("payments_status_idx").on(t.status)],
);

export const tickets = pgTable(
  "tickets",
  {
    id: text("id").primaryKey(),
    /** Human ticket number (#1042), assigned by the database. */
    number: serial("number").notNull(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    siteId: text("site_id").references(() => sites.id, { onDelete: "set null" }),
    subject: text("subject").notNull(),
    status: text("status").$type<TicketStatus>().notNull().default("open"),
    priority: text("priority").$type<TicketPriority>().notNull().default("normal"),
    createdAt: createdAt(),
    updatedAt: ts("updated_at").notNull().default(sql`now()`),
  },
  (t) => [uniqueIndex("tickets_number_key").on(t.number), index("tickets_account_updated_idx").on(t.accountId, t.updatedAt)],
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    fromStaff: boolean("from_staff").notNull().default(false),
    body: text("body").notNull(),
    attachments: jsonb("attachments").$type<{ name: string; size: number; fileId?: string }[]>().notNull().default([]),
    createdAt: createdAt(),
  },
  (t) => [index("ticket_messages_ticket_created_idx").on(t.ticketId, t.createdAt)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    kind: text("kind").$type<NotificationKind>().notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    read: boolean("read").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_account_created_idx").on(t.accountId, t.createdAt)],
);

export const notificationPrefs = pgTable("notification_prefs", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  email: jsonb("email").$type<Record<NotificationKind, boolean>>().notNull(),
  whatsapp: jsonb("whatsapp").$type<Record<NotificationKind, boolean>>().notNull(),
});

/** Append-only. Nothing in the app updates or deletes audit rows. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").notNull(),
    actorName: text("actor_name").notNull(),
    /** Set when an admin acts while signed in as a client. */
    impersonatorId: text("impersonator_id"),
    accountId: text("account_id"),
    action: text("action").notNull(),
    target: text("target"),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_log_account_created_idx").on(t.accountId, t.createdAt), index("audit_log_created_idx").on(t.createdAt)],
);

/** Signed-in sessions. The cookie holds a random token; only its SHA-256 is stored. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    /** Account currently selected in the dashboard. */
    accountId: text("account_id"),
    /** Admin user id when an admin is signed in as a client. */
    impersonatorId: text("impersonator_id"),
    device: text("device").notNull().default("Unknown device"),
    location: text("location").notNull().default(""),
    createdAt: createdAt(),
    lastActiveAt: ts("last_active_at").notNull().default(sql`now()`),
    expiresAt: ts("expires_at").notNull(),
  },
  (t) => [uniqueIndex("sessions_token_key").on(t.tokenHash), index("sessions_user_idx").on(t.userId)],
);

/** One-time links: password reset and first password setup. */
export const passwordResets = pgTable(
  "password_resets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: ts("expires_at").notNull(),
    usedAt: ts("used_at"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("password_resets_token_key").on(t.tokenHash)],
);

export const adminNotes = pgTable(
  "admin_notes",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("admin_notes_account_idx").on(t.accountId)],
);

export const emailTemplates = pgTable("email_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  updatedAt: ts("updated_at").notNull().default(sql`now()`),
});

/**
 * Private uploads: payment proofs and ticket attachments. Never public. They are only
 * served by routes that first check the viewer may see the owning account.
 */
export const files = pgTable(
  "files",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    data: bytes("data").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("files_account_idx").on(t.accountId)],
);

/** Small site-wide values, such as the dashboard announcement. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: ts("updated_at").notNull().default(sql`now()`),
});

/** Fixed-window counters, so limits hold across every running copy of the app. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: ts("window_start").notNull(),
    count: integer("count").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);
