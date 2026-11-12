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

export function adapterMode(): "mock" | "live" {
  return process.env.ADAPTER_MODE === "live" ? "live" : "mock";
}

function emailAdapter(): MessageAdapter {
  const key = process.env.RESEND_API_KEY;
  if (!key) return mockEmailAdapter;
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
