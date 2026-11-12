import type {
  AnalyticsAdapter,
  BackupStorageAdapter,
  CustomHostnameAdapter,
  DeployAdapter,
  MailboxAdapter,
  MessageAdapter,
  RegistrarAdapter,
  UptimeAdapter,
} from "../types";
import { NotConnectedError } from "../types";
import { platformServices } from "../mock/uptime";
import { requiredRecords } from "../mock/hostnames";

/**
 * Stand-ins used in live mode while a provider's settings are missing. They never show demo
 * data: actions get a clear "not connected" message and charts stay empty.
 */
const fail = (what: string) => () =>
  Promise.reject(
    new NotConnectedError(
      `${what} is not connected yet. Our team is setting it up.`,
    ),
  );

export const deployNotConnected: DeployAdapter = {
  name: "Not connected",
  redeploy: fail("Deploys"),
  restart: fail("Restarts"),
  setEnv: fail("Saving settings to the server"),
  deleteEnv: fail("Saving settings to the server"),
  logs: async () => [],
};

export const hostnamesNotConnected: CustomHostnameAdapter = {
  name: "Not connected",
  requiredRecords,
  create: fail("Custom domains"),
  check: fail("Domain checks"),
  remove: fail("Custom domains"),
};

export const uptimeNotConnected: UptimeAdapter = {
  name: "Not connected",
  siteSeries: async () => [],
  ensureMonitor: fail("Uptime monitoring"),
  platformStatus: async () =>
    platformServices.map((s) => ({
      ...s,
      status: "operational" as const,
      uptime90d: null,
      history: Array.from({ length: 90 }, () => "nodata" as const),
    })),
};

export const analyticsNotConnected: AnalyticsAdapter = {
  name: "Not connected",
  traffic: async () => [],
};

export const backupsNotConnected: BackupStorageAdapter = {
  name: "Not connected",
  location: "Not connected",
  signedDownloadUrl: fail("Backup downloads"),
};

export const mailboxesNotConnected: MailboxAdapter = {
  name: "Not connected",
  webmailUrl: "",
  create: fail("Mailboxes"),
  resetPassword: fail("Mailboxes"),
  dnsStatus: async () => [],
};

export const registrarNotConnected: RegistrarAdapter = {
  name: "Not connected",
  canPurchase: false,
  search: fail("Domain search"),
};

export const whatsappNotConnected: MessageAdapter = {
  name: "Not connected",
  channel: "whatsapp",
  send: async () => ({ id: "not_connected" }),
};
