import "server-only";
import type {
  AnalyticsAdapter,
  BackupStorageAdapter,
  CustomHostnameAdapter,
  DeployAdapter,
  MailboxAdapter,
  MessageAdapter,
  PaymentProvider,
  RegistrarAdapter,
  UptimeAdapter,
} from "./types";
import { mockDeployAdapter } from "./mock/deploy";
import { mockCustomHostnameAdapter } from "./mock/hostnames";
import { mockBackupStorageAdapter } from "./mock/backups";
import { mockUptimeAdapter } from "./mock/uptime";
import { mockAnalyticsAdapter } from "./mock/analytics";
import { mockMailboxAdapter } from "./mock/mail";
import { mockEmailAdapter, mockWhatsAppAdapter } from "./mock/messages";
import { mockRegistrarAdapter } from "./mock/registrar";
import { createResendAdapter } from "./live/resend";
import { createCoolifyAdapter } from "./live/coolify";
import { createCloudflareAdapter } from "./live/cloudflare";
import { createUptimeRobotAdapter } from "./live/uptimerobot";
import {
  analyticsNotConnected,
  backupsNotConnected,
  deployNotConnected,
  hostnamesNotConnected,
  mailboxesNotConnected,
  registrarNotConnected,
  uptimeNotConnected,
  whatsappNotConnected,
} from "./live/not-connected";

export { NotConnectedError } from "./types";
export { ProviderError, providerMessage } from "./live/http";
export type { SiteRef } from "./types";

export interface Adapters {
  deploy: DeployAdapter;
  hostnames: CustomHostnameAdapter;
  backups: BackupStorageAdapter;
  uptime: UptimeAdapter;
  analytics: AnalyticsAdapter;
  mailboxes: MailboxAdapter;
  email: MessageAdapter;
  whatsapp: MessageAdapter;
  registrar: RegistrarAdapter;
  payments: PaymentProvider[];
}

const manualPayments: PaymentProvider = { id: "manual", label: "Bank transfer / Wise", flow: "proof_upload" };

const mockAdapters: Adapters = {
  deploy: mockDeployAdapter,
  hostnames: mockCustomHostnameAdapter,
  backups: mockBackupStorageAdapter,
  uptime: mockUptimeAdapter,
  analytics: mockAnalyticsAdapter,
  mailboxes: mockMailboxAdapter,
  email: mockEmailAdapter,
  whatsapp: mockWhatsAppAdapter,
  registrar: mockRegistrarAdapter,
  payments: [manualPayments],
};

let resend: MessageAdapter | undefined;
let live: { key: string; adapters: Adapters } | undefined;

/**
 * `ADAPTER_MODE` decides when it is set. When it is not, a real database means live mode,
 * so connecting `DATABASE_URL` alone can never leave real clients looking at demo data.
 */
export function adapterMode(): "mock" | "live" {
  const mode = process.env.ADAPTER_MODE;
  if (mode === "live" || mode === "mock") return mode;
  return process.env.DATABASE_URL ? "live" : "mock";
}

let warnedNoEmail = false;

function emailAdapter(): MessageAdapter {
  const key = process.env.RESEND_API_KEY;
  // The public sample-data preview never sends real email, even with a key set: anyone can
  // sign in to it as the demo admin and invite any address.
  if (!process.env.DATABASE_URL) return mockEmailAdapter;
  if (!key) {
    if (!warnedNoEmail && process.env.NODE_ENV === "production") {
      warnedNoEmail = true;
      console.error("[email] RESEND_API_KEY is not set. Emails are recorded in the admin outbox and NOT sent.");
    }
    return mockEmailAdapter;
  }
  resend ??= createResendAdapter(key);
  return resend;
}

const env = (name: string) => process.env[name] || undefined;

/** Which live providers have their settings filled in. Shown on the admin overview. */
export function liveConnections() {
  return {
    coolify: Boolean(env("COOLIFY_API_URL") && env("COOLIFY_API_TOKEN")),
    cloudflare: Boolean(env("CLOUDFLARE_API_TOKEN") && env("CLOUDFLARE_ZONE_ID") && env("EDGE_HOSTNAME")),
    uptimerobot: Boolean(env("UPTIMEROBOT_API_KEY")),
    resend: Boolean(env("RESEND_API_KEY")),
  };
}

function buildLiveAdapters(): Adapters {
  const c = liveConnections();
  return {
    deploy: c.coolify ? createCoolifyAdapter(env("COOLIFY_API_URL")!, env("COOLIFY_API_TOKEN")!) : deployNotConnected,
    hostnames: c.cloudflare ? createCloudflareAdapter(env("CLOUDFLARE_API_TOKEN")!, env("CLOUDFLARE_ZONE_ID")!, env("EDGE_HOSTNAME")!, env("EDGE_APEX_IP")) : hostnamesNotConnected,
    uptime: c.uptimerobot ? createUptimeRobotAdapter(env("UPTIMEROBOT_API_KEY")!) : uptimeNotConnected,
    // Not built yet. In live mode these show "not connected" instead of demo data.
    backups: backupsNotConnected,
    analytics: analyticsNotConnected,
    mailboxes: mailboxesNotConnected,
    registrar: registrarNotConnected,
    whatsapp: whatsappNotConnected,
    email: emailAdapter(),
    payments: [manualPayments],
  };
}

/**
 * Returns the adapter set for this environment.
 * - mock (default): demo data everywhere, email through Resend when a key is set.
 * - live: real Coolify, Cloudflare and UptimeRobot clients for each provider whose settings
 *   are present. A provider without settings answers "not connected"; it never falls back to demo data.
 */
export function getAdapters(): Adapters {
  if (adapterMode() === "live") {
    const key = JSON.stringify(liveConnections());
    if (!live || live.key !== key) live = { key, adapters: buildLiveAdapters() };
    return live.adapters;
  }
  const email = emailAdapter();
  return email === mockEmailAdapter ? mockAdapters : { ...mockAdapters, email };
}
