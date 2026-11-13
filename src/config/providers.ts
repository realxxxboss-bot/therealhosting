/**
 * Every outside provider that handles personal data for us. The Privacy Policy and the
 * sub-processor list both render this table, so they can never disagree.
 *
 * `status`:
 * - "live": in use today.
 * - "at-launch": chosen, and will be in use before the first client site goes live.
 * - "when-connected": used only if you connect it (for example a Git provider for deploys).
 * Update this file, and email account holders 30 days ahead (DPA section 6), before adding a processor of client content.
 */
export type ProviderStatus = "live" | "at-launch" | "when-connected";

export interface Provider {
  name: string;
  purpose: string;
  data: string;
  location: string;
  status: ProviderStatus;
  /** Processes the content of client websites (a sub-processor under the DPA), not only our own account data. */
  processesClientContent: boolean;
}

export const providers: Provider[] = [
  { name: "Hetzner Online", purpose: "Servers that client websites and their databases run on", data: "Website files, databases, visitor logs", location: "Germany (EU)", status: "at-launch", processesClientContent: true },
  { name: "Cloudflare", purpose: "DNS, SSL certificates, content delivery, security filtering and off-site backup storage (R2)", data: "Visitor IP addresses and requests; encrypted backups", location: "Global network; backups stored in the EU jurisdiction", status: "at-launch", processesClientContent: true },
  { name: "Vercel", purpose: "Runs this website and the client dashboard", data: "Account and dashboard data in transit, request logs", location: "Global network (United States company)", status: "live", processesClientContent: false },
  { name: "Neon", purpose: "The database behind the dashboard: accounts, invoices, tickets", data: "Account, billing and support records", location: "Frankfurt, Germany (EU)", status: "at-launch", processesClientContent: false },
  { name: "Resend", purpose: "Sends account emails such as password resets, invites and invoices", data: "Name, email address, email content", location: "United States", status: "at-launch", processesClientContent: false },
  { name: "UptimeRobot", purpose: "Checks from outside whether websites are up", data: "Website addresses only", location: "Checks from several countries", status: "at-launch", processesClientContent: false },
  { name: "Unsplash", purpose: "Serves the photographs on this website", data: "Visitor IP address and browser details when an image loads", location: "United States", status: "live", processesClientContent: false },
  { name: "GitHub, GitLab or Bitbucket", purpose: "Deploys your code when you connect a repository", data: "Repository access and commit details", location: "United States", status: "when-connected", processesClientContent: true },
];

export const providerStatusLabel: Record<ProviderStatus, string> = {
  live: "In use",
  "at-launch": "From launch",
  "when-connected": "If you connect it",
};
