import type { DomainAvailability, RegistrarAdapter } from "../types";

/** Indicative yearly prices for the demo. Real prices come from the registrar API (Phase 3+). */
const demoTldPrices: Record<string, number> = { com: 12, net: 14, org: 12, io: 45, dev: 15, co: 28, app: 17, uk: 9 };

export function normaliseDomainQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9.-]/g, "")
    .replace(/\.+$/, "");
}

export const mockRegistrarAdapter: RegistrarAdapter = {
  name: "Mock registrar",
  canPurchase: false,
  async search(query) {
    const clean = normaliseDomainQuery(query);
    if (!clean) return [];
    const label = clean.split(".")[0] ?? clean;
    const askedTld = clean.includes(".") ? clean.slice(label.length + 1) : null;
    const tlds = askedTld ? [askedTld, ...Object.keys(demoTldPrices).filter((t) => t !== askedTld)] : Object.keys(demoTldPrices);
    return tlds.slice(0, 6).map<DomainAvailability>((tld, i) => {
      const price = demoTldPrices[tld] ?? null;
      // Demo rule: short names and the first exact match are "taken".
      const available = !(label.length <= 4 || (i === 0 && askedTld === "com"));
      return { domain: `${label}.${tld}`, available, priceUsd: price, renewalUsd: price };
    });
  },
};
