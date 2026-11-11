import type { ServiceStatus, UptimeAdapter, UptimePoint } from "../types";
import { seededRandom } from "./rng";

const platformServices = [
  { id: "web", name: "Website hosting", description: "Next.js, WordPress and static sites" },
  { id: "dashboard", name: "Client dashboard", description: "Sign-in, billing and site management" },
  { id: "deploys", name: "Deployments", description: "Builds and Git deploys" },
  { id: "dns", name: "DNS and SSL", description: "Custom domains and certificates" },
  { id: "backups", name: "Backups", description: "Daily off-site backups" },
  { id: "email", name: "Email", description: "Mailboxes and notifications" },
];

export const mockUptimeAdapter: UptimeAdapter = {
  name: "Mock uptime monitor",
  async siteSeries(siteId, { hours, now }) {
    const rand = seededRandom(siteId);
    const points: UptimePoint[] = [];
    const base = 120 + rand() * 180;
    const down = siteId.endsWith("5") ? new Set([hours - 3, hours - 2]) : new Set<number>();
    for (let i = hours - 1; i >= 0; i--) {
      const at = new Date(now - i * 3_600_000).toISOString();
      const isDown = down.has(hours - i);
      points.push({ at, up: !isDown, responseMs: isDown ? 0 : Math.round(base + (rand() - 0.5) * 80 + (i % 24 < 6 ? -20 : 15)) });
    }
    return points;
  },
  async platformStatus() {
    // Demo mode: no real measurements exist yet, so uptime is shown as "no data" rather than invented numbers.
    return platformServices.map<ServiceStatus>((s) => ({
      ...s,
      status: "operational",
      uptime90d: null,
      history: Array.from({ length: 90 }, () => "nodata"),
    }));
  },
};
