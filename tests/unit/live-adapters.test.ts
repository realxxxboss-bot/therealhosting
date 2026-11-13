import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adapterMode,
  getAdapters,
  liveConnections,
  NotConnectedError,
  ProviderError,
  providerMessage,
} from "@/lib/adapters";
import { createCoolifyAdapter, parseLogs } from "@/lib/adapters/live/coolify";
import {
  createCloudflareAdapter,
  describe as describeHostname,
} from "@/lib/adapters/live/cloudflare";
import {
  createUptimeRobotAdapter,
  hourlySeries,
  ninetyDayRanges,
} from "@/lib/adapters/live/uptimerobot";

type Call = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
};

/** Replaces fetch with a list of canned answers, and records each request. */
function fakeFetch(...answers: { status?: number; json?: unknown }[]) {
  const calls: Call[] = [];
  const queue = [...answers];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    calls.push({
      url: String(url),
      method: init.method ?? "GET",
      headers: init.headers as Record<string, string>,
      body: init.body as string | undefined,
    });
    const next = queue.shift() ?? { json: {} };
    return new Response(JSON.stringify(next.json ?? {}), {
      status: next.status ?? 200,
    });
  });
  return calls;
}

const site = {
  id: "site_1",
  primaryDomain: "shop.example.com",
  deployRef: "app-uuid-1",
  monitorRef: "777",
};
const now = Date.parse("2026-11-12T12:00:00Z");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Coolify", () => {
  const coolify = createCoolifyAdapter(
    "https://coolify.example.com/",
    "1|secret",
  );

  it("deploys by application uuid with a bearer token", async () => {
    const calls = fakeFetch({
      json: { deployments: [{ deployment_uuid: "dep-9" }] },
    });
    expect(await coolify.redeploy(site)).toEqual({
      deploymentId: "dep-9",
      status: "queued",
    });
    expect(calls[0]?.url).toBe(
      "https://coolify.example.com/api/v1/deploy?uuid=app-uuid-1&force=false",
    );
    expect(calls[0]?.headers.Authorization).toBe("Bearer 1|secret");
  });

  it("refuses a site that is not linked, without calling the server", async () => {
    const calls = fakeFetch();
    await expect(
      coolify.restart({ ...site, deployRef: undefined }),
    ).rejects.toBeInstanceOf(NotConnectedError);
    expect(calls).toHaveLength(0);
  });

  it("updates an existing variable and creates a new one", async () => {
    const calls = fakeFetch(
      { json: [{ uuid: "e1", key: "API_KEY" }] },
      {},
      { json: [{ uuid: "e1", key: "API_KEY" }] },
      {},
    );
    await coolify.setEnv(site, [{ key: "API_KEY", value: "a" }]);
    await coolify.setEnv(site, [{ key: "NEW_ONE", value: "b" }]);
    expect(calls.map((c) => c.method)).toEqual(["GET", "PATCH", "GET", "POST"]);
    expect(JSON.parse(calls[3]?.body ?? "{}")).toMatchObject({
      key: "NEW_ONE",
      value: "b",
    });
  });

  it("turns a refused token into a not-connected message that hides the token", async () => {
    fakeFetch({ status: 401, json: { message: "Unauthenticated." } });
    const error = await coolify.restart(site).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NotConnectedError);
    expect(providerMessage(error)).not.toContain("secret");
  });

  it("reads plain text logs, newest first", () => {
    const lines = parseLogs(
      "2026-11-12T10:00:00Z ready\n2026-11-12T10:01:00Z Error: boom\n",
      now,
    );
    expect(lines.map((l) => l.level)).toEqual(["info", "error"]);
    expect(lines[0]?.at).toBe("2026-11-12T10:00:00.000Z");
  });
});

describe("Cloudflare custom hostnames", () => {
  const cf = createCloudflareAdapter("cf-token", "zone1", "edge.zaffre.test");

  it("asks for a CNAME to the edge hostname", () => {
    expect(cf.requiredRecords("www.example.com")).toEqual([
      { type: "CNAME", name: "www", value: "edge.zaffre.test", ttl: 300 },
    ]);
    expect(
      createCloudflareAdapter(
        "t",
        "z",
        "edge.zaffre.test",
        "203.0.113.5",
      ).requiredRecords("example.co.uk")[0],
    ).toMatchObject({ type: "A", name: "@" });
  });

  it("creates a hostname once, reusing an existing one", async () => {
    const calls = fakeFetch(
      { json: { success: true, result: [] } },
      {
        json: {
          success: true,
          result: { id: "ch_1", hostname: "a.example.com", status: "pending" },
        },
      },
    );
    expect(await cf.create("a.example.com")).toEqual({ id: "ch_1" });
    expect(calls[1]?.method).toBe("POST");
    expect(calls[1]?.url).toBe(
      "https://api.cloudflare.com/client/v4/zones/zone1/custom_hostnames",
    );
    fakeFetch({
      json: {
        success: true,
        result: [{ id: "ch_1", hostname: "a.example.com", status: "active" }],
      },
    });
    expect(await cf.create("a.example.com")).toEqual({ id: "ch_1" });
  });

  it("maps statuses onto what the client sees", () => {
    expect(
      describeHostname(
        {
          hostname: "a.example.com",
          status: "active",
          ssl: { status: "active" },
        },
        "edge",
      ).ssl,
    ).toBe("active");
    expect(
      describeHostname(
        {
          hostname: "a.example.com",
          status: "active",
          ssl: { status: "pending_validation" },
        },
        "edge",
      ),
    ).toMatchObject({ dnsOk: true, ssl: "pending" });
    expect(
      describeHostname(
        {
          hostname: "a.example.com",
          status: "pending",
          ssl: { status: "validation_timed_out" },
        },
        "edge",
      ),
    ).toMatchObject({ dnsOk: false, ssl: "error" });
  });
});

describe("UptimeRobot", () => {
  it("sends the key in a form body, and returns hourly points", async () => {
    const calls = fakeFetch({
      json: {
        stat: "ok",
        monitors: [
          {
            id: 777,
            friendly_name: "x",
            url: "https://shop.example.com",
            status: 2,
            response_times: [{ datetime: now / 1000 - 60, value: 210 }],
          },
        ],
      },
    });
    const points = await createUptimeRobotAdapter("ur-key").siteSeries(site, {
      hours: 3,
      now,
    });
    expect(calls[0]?.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
    expect(new URLSearchParams(calls[0]?.body).get("api_key")).toBe("ur-key");
    expect(points).toHaveLength(3);
    expect(points.at(-1)).toMatchObject({ up: true, responseMs: 210 });
  });

  it("marks hours inside a down event", () => {
    const points = hourlySeries(
      { logs: [{ type: 1, datetime: now / 1000 - 1800, duration: 600 }] },
      2,
      now,
    );
    expect(points.map((p) => p.up)).toEqual([true, false]);
  });

  it("asks for 90 daily ranges", () => {
    expect(ninetyDayRanges(now).split("-")).toHaveLength(90);
  });

  it("shows no data for services without a monitor", async () => {
    fakeFetch({ json: { stat: "ok", monitors: [] } });
    const services = await createUptimeRobotAdapter("k").platformStatus({
      now,
    });
    expect(
      services.every(
        (s) => s.uptime90d === null && s.history.every((h) => h === "nodata"),
      ),
    ).toBe(true);
  });
});

describe("live mode registry", () => {
  it("uses a not-connected stand-in for providers without settings, never demo data", async () => {
    vi.stubEnv("ADAPTER_MODE", "live");
    vi.stubEnv("COOLIFY_API_URL", "");
    vi.stubEnv("UPTIMEROBOT_API_KEY", "");
    expect(liveConnections().coolify).toBe(false);
    const adapters = getAdapters();
    await expect(adapters.deploy.redeploy(site)).rejects.toBeInstanceOf(
      NotConnectedError,
    );
    expect(await adapters.deploy.logs(site, { limit: 10, now })).toEqual([]);
    expect(
      await adapters.analytics.traffic(site.id, { days: 30, now }),
    ).toEqual([]);
    expect(await adapters.uptime.siteSeries(site, { hours: 24, now })).toEqual(
      [],
    );
  });

  it("switches a provider on when its settings appear", () => {
    vi.stubEnv("ADAPTER_MODE", "live");
    vi.stubEnv("COOLIFY_API_URL", "https://coolify.example.com");
    vi.stubEnv("COOLIFY_API_TOKEN", "t");
    expect(getAdapters().deploy.name).toBe("Coolify");
  });

  it("keeps demo adapters in mock mode", () => {
    vi.stubEnv("ADAPTER_MODE", "mock");
    expect(getAdapters().deploy.name).toMatch(/Mock/);
    expect(providerMessage(new ProviderError("X", 500, "nope"))).toBe("nope");
    expect(providerMessage(new Error("bug"))).toBeNull();
  });

  it("defaults to live mode when a real database is connected", () => {
    vi.stubEnv("ADAPTER_MODE", "");
    vi.stubEnv("DATABASE_URL", "postgres://example");
    expect(adapterMode()).toBe("live");
    vi.stubEnv("DATABASE_URL", "");
    expect(adapterMode()).toBe("mock");
  });

  it("never sends real email from the sample-data preview", () => {
    vi.stubEnv("ADAPTER_MODE", "mock");
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    expect(getAdapters().email.name).toBe("Mock Resend");
  });
});
