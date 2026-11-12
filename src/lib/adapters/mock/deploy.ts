import type { DeployAdapter, LogLine } from "../types";
import { seededRandom } from "./rng";

const runtimeMessages: Omit<LogLine, "at">[] = [
  { level: "info", source: "proxy", message: "GET / 200 in 42ms" },
  { level: "info", source: "proxy", message: "GET /_next/image?w=1080 200 in 18ms (cache HIT)" },
  { level: "info", source: "runtime", message: "ISR: revalidated /blog in 210ms" },
  { level: "info", source: "cron", message: "Cron /api/cron/sync finished in 1.2s" },
  { level: "info", source: "proxy", message: "POST /api/contact 200 in 96ms" },
  { level: "warn", source: "runtime", message: "Slow data fetch: /api/products took 1840ms" },
  { level: "info", source: "proxy", message: "GET /pricing 200 in 31ms (cache HIT)" },
  { level: "error", source: "runtime", message: "Unhandled rejection in /api/webhook: upstream timeout (retried OK)" },
  { level: "info", source: "build", message: "Build completed in 48s" },
];

export const mockDeployAdapter: DeployAdapter = {
  name: "Mock Coolify",
  async redeploy(site) {
    return { deploymentId: `dep_${site.id}_${Math.random().toString(36).slice(2, 8)}`, status: "queued" };
  },
  async restart() {
    return { ok: true };
  },
  async setEnv() {
    return { ok: true };
  },
  async deleteEnv() {
    return { ok: true };
  },
  async logs(site, { limit, now }) {
    const rand = seededRandom(site.id);
    const lines: LogLine[] = [];
    let t = now;
    for (let i = 0; i < limit; i++) {
      t -= Math.floor(rand() * 90_000) + 5_000;
      const pick = runtimeMessages[Math.floor(rand() * runtimeMessages.length)] ?? runtimeMessages[0]!;
      lines.push({ ...pick, at: new Date(t).toISOString() });
    }
    return lines;
  },
};
