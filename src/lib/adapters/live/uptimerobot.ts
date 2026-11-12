import type { ServiceStatus, UptimeAdapter, UptimePoint } from "../types";
import { platformServices } from "../mock/uptime";
import { requestJson } from "./http";

/**
 * UptimeRobot API v2 (POST, form-encoded, `api_key` in the body).
 * Each site gets an HTTP monitor on its primary domain. The status page uses monitors whose
 * friendly name starts with "zaffre:<service id>", e.g. "zaffre:dashboard". A service with
 * no monitor shows "no data" instead of a made-up number.
 */
const API = "https://api.uptimerobot.com/v2";

interface Monitor {
  id: number;
  friendly_name: string;
  url: string;
  /** 0 paused, 1 not checked yet, 2 up, 8 seems down, 9 down. */
  status: number;
  custom_uptime_ratio?: string;
  custom_uptime_ranges?: string;
  response_times?: { datetime: number; value: number }[];
  logs?: { type: number; datetime: number; duration: number }[];
}
interface MonitorsResponse {
  stat: "ok" | "fail";
  monitors?: Monitor[];
  monitor?: { id: number };
  error?: { message?: string };
}

export function createUptimeRobotAdapter(apiKey: string): UptimeAdapter {
  const post = (method: string, params: Record<string, string>) =>
    requestJson<MonitorsResponse>("UptimeRobot", `${API}/${method}`, {
      method: "POST",
      form: { api_key: apiKey, format: "json", ...params },
    });

  return {
    name: "UptimeRobot",
    async siteSeries(site, { hours, now }) {
      if (!site.monitorRef) return [];
      const since = Math.floor((now - Math.min(hours, 168) * 3_600_000) / 1000);
      const data = await post("getMonitors", {
        monitors: site.monitorRef,
        response_times: "1",
        response_times_start_date: String(since),
        response_times_end_date: String(Math.floor(now / 1000)),
        logs: "1",
      });
      const monitor = data.monitors?.[0];
      return monitor ? hourlySeries(monitor, hours, now) : [];
    },
    async ensureMonitor(site) {
      const url = `https://${site.primaryDomain}`;
      const found = await post("getMonitors", { search: site.primaryDomain });
      const existing = found.monitors?.find(
        (m) => m.url.replace(/\/+$/, "") === url,
      );
      if (existing) return { monitorRef: String(existing.id) };
      const created = await post("newMonitor", {
        friendly_name: `site:${site.id}`,
        url,
        type: "1",
        interval: "300",
      });
      if (created.stat !== "ok" || !created.monitor)
        throw new Error(
          `UptimeRobot did not create a monitor: ${created.error?.message ?? "unknown error"}`,
        );
      return { monitorRef: String(created.monitor.id) };
    },
    async platformStatus({ now }) {
      const data = await post("getMonitors", {
        search: "zaffre:",
        custom_uptime_ranges: ninetyDayRanges(now),
      });
      const byService = new Map(
        (data.monitors ?? []).map((m) => [
          m.friendly_name.replace(/^zaffre:/, ""),
          m,
        ]),
      );
      return platformServices.map<ServiceStatus>((s) => {
        const m = byService.get(s.id);
        if (!m)
          return {
            ...s,
            status: "operational",
            uptime90d: null,
            history: Array.from({ length: 90 }, () => "nodata"),
          };
        const daily = (m.custom_uptime_ranges ?? "").split("-").map(Number);
        const history = daily.map((r) =>
          Number.isNaN(r)
            ? "nodata"
            : r >= 99.9
              ? "up"
              : r >= 98
                ? "degraded"
                : "down",
        ) as ServiceStatus["history"];
        const measured = daily.filter((r) => !Number.isNaN(r));
        return {
          ...s,
          status:
            m.status === 9
              ? "outage"
              : m.status === 8
                ? "degraded"
                : "operational",
          uptime90d: measured.length
            ? Math.round(
                (measured.reduce((a, b) => a + b, 0) / measured.length) * 100,
              ) / 100
            : null,
          history:
            history.length === 90
              ? history
              : Array.from({ length: 90 }, () => "nodata"),
        };
      });
    },
  };
}

/** 90 one-day windows, oldest first, in UptimeRobot's "start_end-start_end" format (unix seconds). */
export function ninetyDayRanges(now: number): string {
  const day = 86_400;
  const end = Math.floor(now / 1000);
  return Array.from({ length: 90 }, (_, i) => {
    const to = end - (89 - i) * day;
    return `${to - day}_${to}`;
  }).join("-");
}

/** Buckets response times into hours; an hour inside a "down" log entry counts as down. */
export function hourlySeries(
  monitor: Pick<Monitor, "response_times" | "logs">,
  hours: number,
  now: number,
): UptimePoint[] {
  const downs = (monitor.logs ?? [])
    .filter((l) => l.type === 1)
    .map((l) => [l.datetime * 1000, (l.datetime + l.duration) * 1000] as const);
  const points: UptimePoint[] = [];
  for (let i = hours - 1; i >= 0; i--) {
    const end = now - i * 3_600_000;
    const start = end - 3_600_000;
    const inHour = (monitor.response_times ?? [])
      .filter((r) => r.datetime * 1000 > start && r.datetime * 1000 <= end)
      .map((r) => r.value);
    const down = downs.some(([a, b]) => a < end && b > start);
    const avg = inHour.length
      ? Math.round(inHour.reduce((a, b) => a + b, 0) / inHour.length)
      : 0;
    points.push({
      at: new Date(end).toISOString(),
      up: !down,
      responseMs: down ? 0 : avg,
    });
  }
  return points;
}
