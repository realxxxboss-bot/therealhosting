/**
 * Infrastructure adapter contracts. The UI and server actions only talk to these interfaces.
 * Each adapter has a mock (demo data) implementation and, where the provider exists, a live one.
 * See docs/DECISIONS.md D-004.
 */

/** What an adapter needs to know about a site. `deployRef` and `monitorRef` are the ids in Coolify and the uptime monitor. */
export interface SiteRef {
  id: string;
  primaryDomain: string;
  deployRef?: string;
  monitorRef?: string;
}

/**
 * Thrown by a live adapter when the provider is not configured yet, or the site is not
 * linked to it. Actions show the message to the user instead of a generic error.
 */
export class NotConnectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotConnectedError";
  }
}

// ---------- Deploys (Coolify) ----------
export interface DeployResult {
  deploymentId: string;
  status: "queued";
}

export interface LogLine {
  at: string;
  level: "info" | "warn" | "error";
  source: "build" | "runtime" | "cron" | "proxy";
  message: string;
}

export interface DeployAdapter {
  readonly name: string;
  redeploy(site: SiteRef): Promise<DeployResult>;
  restart(site: SiteRef): Promise<{ ok: true }>;
  setEnv(site: SiteRef, vars: { key: string; value: string }[]): Promise<{ ok: true }>;
  deleteEnv(site: SiteRef, key: string): Promise<{ ok: true }>;
  logs(site: SiteRef, opts: { limit: number; now: number }): Promise<LogLine[]>;
}

// ---------- DNS + custom hostnames (Cloudflare) ----------
export interface DnsRecord {
  type: "A" | "AAAA" | "CNAME" | "TXT" | "MX";
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export interface HostnameCheck {
  hostname: string;
  dnsOk: boolean;
  ssl: "pending" | "active" | "error";
  /** What we found in public DNS, shown to the client to help fix mistakes. */
  observed: string[];
  message: string;
}

export interface CustomHostnameAdapter {
  readonly name: string;
  /** DNS records the client must add for this hostname. */
  requiredRecords(hostname: string): DnsRecord[];
  create(hostname: string): Promise<{ id: string }>;
  check(hostname: string): Promise<HostnameCheck>;
  remove(hostname: string): Promise<{ ok: true }>;
}

// ---------- Backups (R2) ----------
export interface BackupStorageAdapter {
  readonly name: string;
  readonly location: string;
  signedDownloadUrl(objectKey: string, expiresInSec: number): Promise<string>;
}

// ---------- Uptime monitoring ----------
export interface UptimePoint {
  at: string;
  responseMs: number;
  up: boolean;
}

export interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  status: "operational" | "degraded" | "outage";
  uptime90d: number | null;
  history: ("up" | "degraded" | "down" | "nodata")[];
}

export interface UptimeAdapter {
  readonly name: string;
  siteSeries(site: SiteRef, opts: { hours: number; now: number }): Promise<UptimePoint[]>;
  /** Makes sure the site's address is monitored. Returns the monitor id to store on the site. */
  ensureMonitor(site: SiteRef): Promise<{ monitorRef: string }>;
  platformStatus(opts: { now: number }): Promise<ServiceStatus[]>;
}

// ---------- Analytics ----------
export interface TrafficPoint {
  date: string;
  visitors: number;
  bandwidthMb: number;
}

export interface AnalyticsAdapter {
  readonly name: string;
  traffic(siteId: string, opts: { days: number; now: number }): Promise<TrafficPoint[]>;
}

// ---------- Mailboxes (Migadu) ----------
export interface MailDnsStatus {
  record: DnsRecord;
  label: "MX" | "SPF" | "DKIM" | "DMARC" | "Autoconfig";
  ok: boolean;
}

export interface MailboxAdapter {
  readonly name: string;
  readonly webmailUrl: string;
  /** Creates the mailbox and returns a one-time link where the user sets the password. */
  create(address: string): Promise<{ setupUrl: string }>;
  /** Returns a one-time password reset link. */
  resetPassword(address: string): Promise<{ resetUrl: string }>;
  dnsStatus(domain: string): Promise<MailDnsStatus[]>;
}

// ---------- Transactional email (Resend) + WhatsApp ----------
export interface OutboundMessage {
  to: string;
  subject?: string;
  body: string;
  /** Email only: where replies go. Defaults to our own public address. */
  replyTo?: string;
}

export interface MessageAdapter {
  readonly name: string;
  readonly channel: "email" | "whatsapp";
  send(message: OutboundMessage): Promise<{ id: string }>;
}

// ---------- Registrar ----------
export interface DomainAvailability {
  domain: string;
  available: boolean;
  /** Yearly price in USD, same on renewal, when known. */
  priceUsd: number | null;
  renewalUsd: number | null;
}

export interface RegistrarAdapter {
  readonly name: string;
  readonly canPurchase: boolean;
  search(query: string): Promise<DomainAvailability[]>;
}

// ---------- Payments ----------
export interface PaymentProvider {
  readonly id: "manual" | "stripe";
  readonly label: string;
  /** Manual providers collect proof; card providers redirect to a checkout. */
  readonly flow: "proof_upload" | "redirect";
}
