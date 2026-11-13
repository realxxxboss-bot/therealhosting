/**
 * Startup check of the settings in the hosting platform. Runs once when the server starts
 * (src/instrumentation.ts) and lists every problem in the logs at once, instead of each one
 * surfacing later as a failed request. It never prints values, only names.
 */
export interface EnvProblem {
  level: "error" | "warning";
  message: string;
}

type Env = Record<string, string | undefined>;

const pairs: [string, string[]][] = [
  ["Coolify", ["COOLIFY_API_URL", "COOLIFY_API_TOKEN"]],
  ["Cloudflare", ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ZONE_ID", "EDGE_HOSTNAME"]],
];

export function checkEnv(env: Env): EnvProblem[] {
  const problems: EnvProblem[] = [];
  const set = (name: string) => Boolean(env[name]);
  const production = env.NODE_ENV === "production";
  const realDatabase = set("DATABASE_URL");

  if (realDatabase && (env.SESSION_SECRET ?? "").length < 32) {
    problems.push({ level: "error", message: "SESSION_SECRET must be at least 32 characters when DATABASE_URL is set. Sign-in will fail until it is." });
  }
  if (env.ADAPTER_MODE === "live" && !realDatabase) {
    problems.push({ level: "error", message: "ADAPTER_MODE=live needs DATABASE_URL." });
  }
  if (realDatabase && env.ADAPTER_MODE === "mock") {
    problems.push({ level: "warning", message: "ADAPTER_MODE=mock with a real database: clients will see demo data and the demo banner." });
  }
  if (production && realDatabase && !set("RESEND_API_KEY")) {
    problems.push({ level: "error", message: "RESEND_API_KEY is not set. Password resets, invites, invoices and contact-form messages will NOT be sent." });
  }
  if (production && !set("NEXT_PUBLIC_SITE_URL")) {
    problems.push({ level: "warning", message: "NEXT_PUBLIC_SITE_URL is not set. Canonical links and the sitemap fall back to https://zaffrehost.com." });
  }
  if (production && realDatabase && !set("APP_URL") && !set("NEXT_PUBLIC_SITE_URL")) {
    problems.push({ level: "warning", message: "APP_URL is not set. Emailed links will use the deploy URL." });
  }
  for (const [provider, names] of pairs) {
    const present = names.filter(set);
    if (present.length > 0 && present.length < names.length) {
      const missing = names.filter((n) => !set(n)).join(", ");
      problems.push({ level: "error", message: `${provider} is half configured. Missing: ${missing}. It will show as "not connected".` });
    }
  }
  return problems;
}
