import type { CustomHostnameAdapter, DnsRecord } from "../types";

/** Edge target for client domains (Cloudflare for SaaS fallback origin). */
export const EDGE_CNAME_TARGET = "edge.zaffrehost.com";
/** Anycast IP used for apex domains that cannot CNAME. Demo value from the documentation range. */
export const EDGE_APEX_IP = "192.0.2.10";

/** Subdomain part of a hostname relative to its apex, e.g. "www" for www.example.com. */
export function subdomainLabel(hostname: string, apexDomain: string): string {
  return hostname === apexDomain ? "@" : hostname.slice(0, -(apexDomain.length + 1));
}

/** Simple apex detection: two labels, or three when the second-level label is a known public suffix. */
export function apexOf(hostname: string): string {
  const parts = hostname.split(".");
  const twoLevelSuffixes = new Set(["co.uk", "org.uk", "com.au", "co.nz", "com.br"]);
  const lastTwo = parts.slice(-2).join(".");
  return parts.slice(twoLevelSuffixes.has(lastTwo) ? -3 : -2).join(".");
}

export function requiredRecords(hostname: string): DnsRecord[] {
  const apex = apexOf(hostname);
  const label = subdomainLabel(hostname, apex);
  const isApex = label === "@";
  return [
    isApex
      ? { type: "A", name: "@", value: EDGE_APEX_IP, ttl: 300 }
      : { type: "CNAME", name: label, value: EDGE_CNAME_TARGET, ttl: 300 },
    { type: "TXT", name: isApex ? "_zaffre-verify" : `_zaffre-verify.${label}`, value: `zaffre-verify=${hostname}` },
  ];
}

export const mockCustomHostnameAdapter: CustomHostnameAdapter = {
  name: "Mock Cloudflare for SaaS",
  requiredRecords,
  async create(hostname) {
    return { id: `ch_${hostname.replace(/\W/g, "")}` };
  },
  async remove() {
    return { ok: true };
  },
  async check(hostname) {
    // Demo rule: hostnames containing "new" or "pending" are not pointed yet.
    const pointed = !/new|pending/.test(hostname);
    return {
      hostname,
      dnsOk: pointed,
      ssl: pointed ? "active" : "pending",
      observed: pointed ? [EDGE_CNAME_TARGET] : ["198.51.100.23 (old host)"],
      message: pointed
        ? "DNS points to Zaffre and the SSL certificate is active."
        : "We can still see the old DNS record. Changes can take up to an hour to spread. We'll keep checking.",
    };
  },
};
