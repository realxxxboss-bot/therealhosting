/**
 * Plans and prices (USD). Source of truth for the pricing page, the dashboard and invoices.
 * Reasons for every number: docs/DECISIONS.md (D-002).
 */
export type SiteType = "nextjs" | "wordpress" | "static";
export type Tier = "starter" | "business" | "pro";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
  id: `${SiteType}-${Tier}`;
  type: SiteType;
  tier: Tier;
  name: string;
  /** Price per month when billed monthly, in whole USD. */
  monthly: number;
  sites: number;
  vcpu: number;
  ramGb: number;
  storageGb: number;
  bandwidthTb: number;
  backupDays: number;
  highlight?: boolean;
  blurb: string;
}

/** Yearly price = this many months of the monthly price (2 months free). */
export const YEARLY_MONTHS_CHARGED = 10;

export const siteTypes: Record<SiteType, { label: string; short: string; unit: string; description: string }> = {
  nextjs: {
    label: "Next.js hosting",
    short: "Next.js",
    unit: "app",
    description: "API routes, ISR, cron, image optimisation and caching, all working out of the box.",
  },
  wordpress: {
    label: "WordPress hosting",
    short: "WordPress",
    unit: "site",
    description: "Fast, secure WordPress with updates, backups and malware checks handled for you.",
  },
  static: {
    label: "Static hosting",
    short: "Static / HTML",
    unit: "site",
    description: "HTML, CSS and JavaScript sites served from a global CDN with free SSL.",
  },
};

export const tiers: Record<Tier, { label: string }> = {
  starter: { label: "Starter" },
  business: { label: "Business" },
  pro: { label: "Pro" },
};

export const plans: Plan[] = [
  { id: "static-starter", type: "static", tier: "starter", name: "Static Starter", monthly: 7, sites: 3, vcpu: 0.5, ramGb: 0.5, storageGb: 5, bandwidthTb: 0.5, backupDays: 7, blurb: "Portfolios, landing pages and small brochure sites." },
  { id: "static-business", type: "static", tier: "business", name: "Static Business", monthly: 12, sites: 10, vcpu: 1, ramGb: 1, storageGb: 20, bandwidthTb: 1, backupDays: 14, highlight: true, blurb: "Agencies and teams with several marketing sites." },
  { id: "static-pro", type: "static", tier: "pro", name: "Static Pro", monthly: 20, sites: 25, vcpu: 1, ramGb: 2, storageGb: 50, bandwidthTb: 2, backupDays: 30, blurb: "Many sites, more traffic, longer backup history." },

  { id: "wordpress-starter", type: "wordpress", tier: "starter", name: "WordPress Starter", monthly: 19, sites: 1, vcpu: 1, ramGb: 2, storageGb: 20, bandwidthTb: 1, backupDays: 14, blurb: "One business site or blog, fully managed." },
  { id: "wordpress-business", type: "wordpress", tier: "business", name: "WordPress Business", monthly: 29, sites: 3, vcpu: 2, ramGb: 4, storageGb: 50, bandwidthTb: 2, backupDays: 30, highlight: true, blurb: "Shops and busy sites that need room to grow." },
  { id: "wordpress-pro", type: "wordpress", tier: "pro", name: "WordPress Pro", monthly: 49, sites: 8, vcpu: 4, ramGb: 8, storageGb: 100, bandwidthTb: 4, backupDays: 30, blurb: "WooCommerce and high-traffic WordPress." },

  { id: "nextjs-starter", type: "nextjs", tier: "starter", name: "Next.js Starter", monthly: 24, sites: 2, vcpu: 1, ramGb: 2, storageGb: 20, bandwidthTb: 1, backupDays: 14, blurb: "One production app, with room for a second." },
  { id: "nextjs-business", type: "nextjs", tier: "business", name: "Next.js Business", monthly: 39, sites: 5, vcpu: 2, ramGb: 4, storageGb: 50, bandwidthTb: 2, backupDays: 30, highlight: true, blurb: "Product teams running several apps." },
  { id: "nextjs-pro", type: "nextjs", tier: "pro", name: "Next.js Pro", monthly: 69, sites: 12, vcpu: 4, ramGb: 8, storageGb: 100, bandwidthTb: 4, backupDays: 30, blurb: "Many apps, heavier traffic, more compute." },
];

/** Features included in every plan. Only list things we actually do. */
export const includedInEveryPlan = [
  "Free migration of your existing sites",
  "Free SSL for every domain",
  "Daily off-site backups",
  "Updates and security patches done for you",
  "Uptime monitoring with alerts",
  "Human support by ticket and email, every day",
  "Team access for developers at no extra cost",
  "Same price on renewal",
];

export function getPlan(id: string): Plan | undefined {
  return plans.find((p) => p.id === id);
}

export function plansByType(type: SiteType): Plan[] {
  return plans.filter((p) => p.type === type);
}

/** Price for one billing period in whole USD. */
export function priceFor(plan: Pick<Plan, "monthly">, cycle: BillingCycle): number {
  return cycle === "monthly" ? plan.monthly : plan.monthly * YEARLY_MONTHS_CHARGED;
}

/** Effective monthly price when billed yearly, rounded to cents. */
export function effectiveMonthly(plan: Pick<Plan, "monthly">, cycle: BillingCycle): number {
  return cycle === "monthly" ? plan.monthly : Math.round((plan.monthly * YEARLY_MONTHS_CHARGED * 100) / 12) / 100;
}

export function yearlySavingPercent(): number {
  return Math.round((1 - YEARLY_MONTHS_CHARGED / 12) * 100);
}

/** Competitor benchmark shown on the pricing page. Checked 2026-11-11, see DECISIONS D-002. */
export const competitorBenchmark = {
  checkedOn: "2026-11-11",
  rows: [
    { product: "Shared hosting, \"business\" tier (typical big host)", intro: "$4.49/mo on a 24-month term", renewal: "$16.99/mo", note: "Intro price needs a long prepay; renewal is almost 4× higher." },
    { product: "Entry cloud hosting (typical big host)", intro: "$7.99/mo on a 48-month term", renewal: "$25.99/mo", note: "Self-managed. You do updates, fixes and migrations." },
    { product: "Next.js platform, Pro plan", intro: "$20/mo per seat", renewal: "$20/mo per seat + usage", note: "Every developer seat is paid. Usage over the credit is billed on top." },
  ],
};
