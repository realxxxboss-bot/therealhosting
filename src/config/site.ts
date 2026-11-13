/**
 * Brand and company facts. Anything marked TODO(confirm) is a placeholder
 * that the owner must confirm (see docs/OWNER-ACTIONS.md). Do not invent facts here.
 */
export const site = {
  name: "Zaffre",
  domain: "zaffrehost.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://zaffrehost.com",
  tagline: "Managed hosting, done for you.",
  positioning:
    "Cloud-level performance, business-level price, plus real people managing it for you.",
  description:
    "Premium managed hosting for Next.js, WordPress and static sites. We deploy, update, back up and fix. One fixed price with no renewal jump, and real people on support.",
  currency: "USD",
  /** Name used in legal documents. Owner confirmed "Zaffre" on 2026-11-13; update when a company is registered. */
  legalName: "Zaffre",
  /** Governing law for the Terms of Service. Chosen 2026-11-13 (DECISIONS D-017); the jurisdiction clause in terms.mdx names the same courts. */
  governingLaw: "the laws of England and Wales",
  /** Refund window in days for the Refund Policy. TODO(confirm). */
  refundWindowDays: 14,
  /** Where client data and backups are physically stored. Shown in the Privacy Policy. TODO(confirm) once the VPS is rented. */
  dataRegions: ["Germany, EU"],
  /** Short form for the footer and FAQ. Must stay true to dataRegions. */
  dataRegionShort: "the EU",
  /** Where off-site backups are stored. Cloudflare R2 "EU" jurisdiction. TODO(confirm). */
  backupRegions: ["European Union (Cloudflare R2, EU jurisdiction)"],
  contact: {
    /** The one public address, confirmed by the owner on 2026-11-13. */
    email: "info@zaffrehost.com",
    /** Kept as names for the two jobs; both go to the same inbox for now. */
    supportEmail: "info@zaffrehost.com",
    salesEmail: "info@zaffrehost.com",
    /** E.164 number without "+" for wa.me links. Empty until the owner confirms. TODO(confirm). */
    whatsappNumber: "",
    supportHours: "Every day, replies within business hours",
  },
  /** Confirmed by the owner on 2026-11-13. The handle is "zaffreehost" (two e's) on every network. */
  social: {
    handle: "zaffreehost",
    instagram: "https://www.instagram.com/zaffreehost",
    facebook: "https://www.facebook.com/zaffreehost",
    threads: "https://www.threads.com/@zaffreehost",
  },
  /** Year shown in the footer. Kept in config so static pages need no clock. */
  copyrightYear: 2026,
} as const;

export type SiteConfig = typeof site;

/** True once the owner has replaced a TODO(confirm) placeholder with a real value. */
export function isConfirmed(value: string): boolean {
  return !value.startsWith("TODO(confirm)");
}

/** The legal entity when it is confirmed, otherwise the brand name. Placeholders are never shown to visitors. */
export const legalEntity: string = isConfirmed(site.legalName) ? site.legalName : site.name;

export function whatsappLink(message?: string): string | null {
  if (!site.contact.whatsappNumber) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.contact.whatsappNumber}${text}`;
}

export function socialProfiles(): { label: string; href: string }[] {
  return [
    { label: "Instagram", href: site.social.instagram },
    { label: "Facebook", href: site.social.facebook },
    { label: "Threads", href: site.social.threads },
  ].filter((p) => p.href);
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}
