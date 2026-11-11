import type { BillingCycle, SiteType } from "@/config/plans";

export type Role = "owner" | "developer" | "billing";
export type SiteStatus = "up" | "down" | "degraded" | "deploying" | "paused";
export type InvoiceStatus = "unpaid" | "pending_verification" | "paid" | "void";
export type PaymentStatus = "pending_verification" | "approved" | "rejected";
export type TicketStatus = "open" | "awaiting_client" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type DomainStatus = "pending_dns" | "verifying" | "active" | "error";
export type SslStatus = "pending" | "active" | "error";
export type DeployStatus = "queued" | "building" | "ready" | "failed" | "cancelled";
export type BackupStatus = "completed" | "running" | "failed";

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  billingEmail: string;
  country?: string;
  createdAt: string;
  status: "active" | "suspended";
}

export interface Membership {
  id: string;
  accountId: string;
  userId: string;
  role: Role;
  /** null = all sites in the account */
  siteIds: string[] | null;
  createdAt: string;
}

export interface Invite {
  id: string;
  accountId: string;
  email: string;
  role: Role;
  siteIds: string[] | null;
  invitedBy: string;
  createdAt: string;
}

export interface Server {
  id: string;
  name: string;
  region: string;
  provider: "vps" | "proxmox";
  ip: string;
  vcpu: number;
  ramGb: number;
  diskGb: number;
  status: "healthy" | "warning" | "down";
  cpuPct: number;
  ramPct: number;
  diskPct: number;
}

export interface Subscription {
  id: string;
  accountId: string;
  planId: string;
  cycle: BillingCycle;
  /** Locked price in cents for this subscription. Never changes on renewal. */
  priceCents: number;
  startedAt: string;
  renewsAt: string;
  status: "active" | "cancelled";
}

export interface Site {
  id: string;
  accountId: string;
  subscriptionId: string;
  serverId: string;
  name: string;
  type: SiteType;
  primaryDomain: string;
  status: SiteStatus;
  framework: string;
  repo?: string;
  branch?: string;
  createdAt: string;
  lastDeployAt: string;
  uptime30d: number;
  responseMs: number;
}

export interface Domain {
  id: string;
  accountId: string;
  siteId: string | null;
  hostname: string;
  status: DomainStatus;
  ssl: SslStatus;
  redirectTo?: string;
  registrar?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface EnvVar {
  id: string;
  siteId: string;
  key: string;
  value: string;
  target: "production" | "preview" | "all";
  updatedAt: string;
}

export interface Deployment {
  id: string;
  siteId: string;
  status: DeployStatus;
  commit: string;
  message: string;
  branch: string;
  author: string;
  createdAt: string;
  durationSec: number;
}

export interface Backup {
  id: string;
  siteId: string;
  status: BackupStatus;
  kind: "daily" | "manual" | "pre-deploy";
  sizeBytes: number;
  createdAt: string;
  location: string;
}

export interface RestoreRequest {
  id: string;
  siteId: string;
  backupId: string;
  requestedBy: string;
  note: string;
  status: "requested" | "in_progress" | "done";
  createdAt: string;
}

export interface Mailbox {
  id: string;
  accountId: string;
  address: string;
  domain: string;
  quotaGb: number;
  usedGb: number;
  createdAt: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitCents: number;
}

export interface Invoice {
  id: string;
  number: string;
  accountId: string;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  recurring: boolean;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  accountId: string;
  methodId: string;
  amountCents: number;
  reference: string;
  proofFileName: string;
  proofMime: string;
  proofSize: number;
  status: PaymentStatus;
  submittedAt: string;
  submittedBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReason?: string;
}

export interface PaymentMethod {
  id: string;
  kind: "bank_transfer" | "wise" | "other";
  label: string;
  instructions: string;
  fields: { label: string; value: string }[];
  enabled: boolean;
}

export interface TicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  fromStaff: boolean;
  body: string;
  attachments: { name: string; size: number }[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: number;
  accountId: string;
  siteId: string | null;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export type NotificationKind = "site_down" | "site_up" | "invoice" | "payment_confirmed" | "ticket_reply" | "deploy" | "info";

export interface Notification {
  id: string;
  accountId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPrefs {
  userId: string;
  email: Record<NotificationKind, boolean>;
  whatsapp: Record<NotificationKind, boolean>;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  /** Set when an admin acts while signed in as a client. */
  impersonatorId?: string;
  accountId?: string;
  action: string;
  target?: string;
  createdAt: string;
  ip?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  device: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
}

export interface AdminNote {
  id: string;
  accountId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface Announcement {
  enabled: boolean;
  tone: "info" | "warning";
  message: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
}
