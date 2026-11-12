import type { DeployAdapter, LogLine, SiteRef } from "../types";
import { NotConnectedError } from "../types";
import { requestJson } from "./http";

/**
 * Coolify v4 API (self-hosted). Base path `/api/v1`, `Authorization: Bearer <token>`.
 * Each Zaffre site is linked to one Coolify application by its uuid (`sites.deploy_ref`).
 * The endpoint shapes below follow the Coolify v4 API reference; the first live connection
 * is checked by hand (docs/RUNBOOK-SERVER.md, Hissa G) before clients use it.
 */
export function createCoolifyAdapter(
  baseUrl: string,
  token: string,
): DeployAdapter {
  const api = `${baseUrl.replace(/\/+$/, "")}/api/v1`;
  const headers = { Authorization: `Bearer ${token}` };
  const call = <T>(
    path: string,
    init: Parameters<typeof requestJson>[2] = {},
  ) => requestJson<T>("Coolify", `${api}${path}`, { ...init, headers });

  function appId(site: SiteRef): string {
    if (!site.deployRef)
      throw new NotConnectedError(
        "This site is not linked to a server app yet. Our team has been told; please try again later.",
      );
    return encodeURIComponent(site.deployRef);
  }

  interface CoolifyEnv {
    uuid: string;
    key: string;
  }

  return {
    name: "Coolify",
    async redeploy(site) {
      const data = await call<{ deployments?: { deployment_uuid?: string }[] }>(
        `/deploy?uuid=${appId(site)}&force=false`,
      );
      const deploymentId = data.deployments?.[0]?.deployment_uuid;
      return {
        deploymentId:
          deploymentId ?? `dep_${site.id}_${Date.now().toString(36)}`,
        status: "queued",
      };
    },
    async restart(site) {
      await call(`/applications/${appId(site)}/restart`);
      return { ok: true };
    },
    async setEnv(site, vars) {
      const id = appId(site);
      const existing = await call<CoolifyEnv[]>(`/applications/${id}/envs`);
      for (const v of vars) {
        const found = existing.some((e) => e.key === v.key);
        await call(`/applications/${id}/envs`, {
          method: found ? "PATCH" : "POST",
          body: { key: v.key, value: v.value, is_preview: false },
        });
      }
      return { ok: true };
    },
    async deleteEnv(site, key) {
      const id = appId(site);
      const existing = await call<CoolifyEnv[]>(`/applications/${id}/envs`);
      for (const e of existing.filter((x) => x.key === key)) {
        await call(`/applications/${id}/envs/${encodeURIComponent(e.uuid)}`, {
          method: "DELETE",
        });
      }
      return { ok: true };
    },
    async logs(site, { limit, now }) {
      const data = await call<{ logs?: string }>(
        `/applications/${appId(site)}/logs?lines=${Math.min(Math.max(limit, 1), 500)}`,
      );
      return parseLogs(data.logs ?? "", now)
        .slice(-limit)
        .reverse();
    },
  };
}

/** Turns the plain text log Coolify returns into lines. Docker prefixes each line with an RFC 3339 time when timestamps are on. */
export function parseLogs(text: string, now: number): LogLine[] {
  return text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const match = /^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(.*)$/.exec(line);
      const stamp = match?.[1];
      const message = (match?.[2] ?? line).slice(0, 2000);
      const at =
        stamp && !Number.isNaN(Date.parse(stamp))
          ? new Date(stamp).toISOString()
          : new Date(now).toISOString();
      const level: LogLine["level"] = /\b(error|fatal|exception)\b/i.test(
        message,
      )
        ? "error"
        : /\bwarn(ing)?\b/i.test(message)
          ? "warn"
          : "info";
      return { at, level, source: "runtime" as const, message };
    });
}
