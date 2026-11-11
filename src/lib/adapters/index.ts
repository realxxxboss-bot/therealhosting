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

export function adapterMode(): "mock" | "live" {
  return process.env.ADAPTER_MODE === "live" ? "live" : "mock";
}

/**
 * Returns the adapter set for this environment.
 * Live adapters (Coolify, Cloudflare, R2, UptimeRobot, Migadu, Resend) arrive in Phase 3;
 * until then "live" mode refuses to start rather than silently using demo data.
 */
export function getAdapters(): Adapters {
  if (adapterMode() === "live") {
    throw new Error("ADAPTER_MODE=live is not available yet. Live adapters ship in Phase 3. Use ADAPTER_MODE=mock.");
  }
  return mockAdapters;
}
