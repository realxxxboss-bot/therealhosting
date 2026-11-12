import type { CustomHostnameAdapter, DnsRecord, HostnameCheck } from "../types";
import { requestJson } from "./http";
import { apexOf, subdomainLabel } from "../mock/hostnames";

/**
 * Cloudflare for SaaS custom hostnames. Clients point their domain at our edge hostname
 * (a CNAME to `EDGE_HOSTNAME`); Cloudflare then issues the certificate and routes traffic
 * to the fallback origin (our server). Needs a token with Zone "SSL and Certificates: Edit".
 */
export function createCloudflareAdapter(
  token: string,
  zoneId: string,
  edgeHostname: string,
  apexIp?: string,
): CustomHostnameAdapter {
  const api = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(zoneId)}/custom_hostnames`;
  const headers = { Authorization: `Bearer ${token}` };

  interface CustomHostname {
    id: string;
    hostname: string;
    status: string;
    ssl?: { status?: string; validation_errors?: { message?: string }[] };
    verification_errors?: string[];
    ownership_verification?: { name?: string; value?: string; type?: string };
  }
  interface Envelope<T> {
    success: boolean;
    result: T;
    errors?: { code: number; message: string }[];
  }

  async function find(hostname: string): Promise<CustomHostname | undefined> {
    const data = await requestJson<Envelope<CustomHostname[]>>(
      "Cloudflare",
      `${api}?hostname=${encodeURIComponent(hostname)}`,
      { headers },
    );
    return data.result?.find((h) => h.hostname === hostname);
  }

  return {
    name: "Cloudflare",
    requiredRecords(hostname) {
      const label = subdomainLabel(hostname, apexOf(hostname));
      // A root domain can't hold a normal CNAME. With EDGE_APEX_IP set we give an A record;
      // otherwise a CNAME at "@", which works where the DNS provider flattens it (Cloudflare, ALIAS/ANAME).
      const record: DnsRecord =
        label === "@" && apexIp
          ? { type: "A", name: "@", value: apexIp, ttl: 300 }
          : { type: "CNAME", name: label, value: edgeHostname, ttl: 300 };
      return [record];
    },
    async create(hostname) {
      const existing = await find(hostname);
      if (existing) return { id: existing.id };
      const data = await requestJson<Envelope<CustomHostname>>(
        "Cloudflare",
        api,
        {
          method: "POST",
          headers,
          body: {
            hostname,
            ssl: {
              method: "http",
              type: "dv",
              settings: { min_tls_version: "1.2" },
            },
          },
        },
      );
      return { id: data.result.id };
    },
    async check(hostname) {
      const found = await find(hostname);
      if (!found) {
        await this.create(hostname);
        return {
          hostname,
          dnsOk: false,
          ssl: "pending",
          observed: [],
          message: `We registered ${hostname} again. Add the DNS record below, then check in a few minutes.`,
        };
      }
      return describe(found, edgeHostname);
    },
    async remove(hostname) {
      const found = await find(hostname);
      if (found)
        await requestJson(
          "Cloudflare",
          `${api}/${encodeURIComponent(found.id)}`,
          { method: "DELETE", headers },
        );
      return { ok: true };
    },
  };
}

/** Maps Cloudflare's hostname and certificate states onto what the dashboard shows. */
export function describe(
  h: {
    hostname: string;
    status: string;
    ssl?: { status?: string; validation_errors?: { message?: string }[] };
    verification_errors?: string[];
  },
  edgeHostname: string,
): HostnameCheck {
  const sslStatus = h.ssl?.status ?? "initializing";
  const dnsOk = h.status === "active";
  const ssl: HostnameCheck["ssl"] =
    sslStatus === "active"
      ? "active"
      : /timed_out|expired|deleted|blocked|failed/.test(sslStatus)
        ? "error"
        : "pending";
  const problems = [
    ...(h.verification_errors ?? []),
    ...(h.ssl?.validation_errors ?? []).map((e) => e.message ?? ""),
  ].filter(Boolean);
  let message: string;
  if (dnsOk && ssl === "active") message = `${h.hostname} is live with HTTPS.`;
  else if (dnsOk)
    message = `${h.hostname} points at us. The HTTPS certificate is being issued; this usually takes a few minutes.`;
  else if (ssl === "error")
    message = `The certificate for ${h.hostname} could not be issued. Check the DNS record, then press Check now again.`;
  else
    message = `We can't see ${h.hostname} pointing at ${edgeHostname} yet. DNS changes can take up to an hour.`;
  return {
    hostname: h.hostname,
    dnsOk,
    ssl,
    observed: problems.slice(0, 3),
    message,
  };
}
