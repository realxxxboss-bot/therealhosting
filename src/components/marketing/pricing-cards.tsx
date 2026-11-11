"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus } from "lucide-react";
import { effectiveMonthly, plansByType, priceFor, siteTypes, tiers, type BillingCycle, type Plan, type SiteType } from "@/config/plans";
import { ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/motion/segmented";
import { cn, formatUSD } from "@/lib/utils";

const typeOptions = (["nextjs", "wordpress", "static"] as const).map((t) => ({ value: t, label: siteTypes[t].short }));
const cycleOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly, 2 months free" },
] as const satisfies readonly { value: BillingCycle; label: string }[];

function siteCount(plan: Plan): string {
  const unit = siteTypes[plan.type].unit;
  return `${plan.sites} ${unit}${plan.sites > 1 ? "s" : ""}`;
}

const specs: { label: string; value: (p: Plan) => string }[] = [
  { label: "Covers", value: siteCount },
  { label: "Reserved CPU", value: (p) => `${p.vcpu} vCPU` },
  { label: "Reserved memory", value: (p) => `${p.ramGb} GB` },
  { label: "Storage", value: (p) => `${p.storageGb} GB NVMe` },
  { label: "Bandwidth", value: (p) => `${p.bandwidthTb} TB a month` },
  { label: "Backup history", value: (p) => `${p.backupDays} days` },
];

const extras: { label: string; value: (p: Plan) => string | boolean }[] = [
  { label: "Price per site", value: (p) => `${formatUSD(Math.round((p.monthly / p.sites) * 100) / 100)} a month` },
  { label: "Yearly price", value: (p) => formatUSD(priceFor(p, "yearly")) },
  { label: "Staging copy on request", value: (p) => p.tier !== "starter" },
  { label: "Priority support queue", value: (p) => p.tier === "pro" },
];

function Price({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const amount = formatUSD(effectiveMonthly(plan, cycle));
  return (
    <p className="mt-6 flex items-baseline gap-2">
      <span className="relative inline-flex overflow-hidden text-[3.25rem] leading-none font-semibold tracking-[-0.04em]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={amount} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            {amount}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-muted">a month</span>
    </p>
  );
}

/**
 * Plans for one site type as three ruled columns, with the plan differences in a table below.
 * The type and billing switches drive both, so there is one comparison on the page.
 */
export function PricingCards({ initialType = "nextjs", showTypeSwitch = true, showCompare = false }: { initialType?: SiteType; showTypeSwitch?: boolean; showCompare?: boolean }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [type, setType] = useState<SiteType>(initialType);
  const visible = plansByType(type);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {showTypeSwitch ? <Segmented label="Site type" options={typeOptions} value={type} onChange={setType} /> : <p className="text-lg font-semibold">{siteTypes[type].label}</p>}
        <Segmented label="Billing period" options={cycleOptions} value={cycle} onChange={setCycle} />
      </div>
      <p className="mt-5 max-w-2xl text-muted">{siteTypes[type].description}</p>

      <ul className="mt-8 grid border-y border-foreground lg:grid-cols-3 lg:divide-x lg:divide-border">
        {visible.map((plan) => (
          <li key={plan.id} className={cn("flex flex-col border-b border-border px-0 py-8 last:border-b-0 lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:pr-0")}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-semibold tracking-[-0.025em]">{tiers[plan.tier].label}</h3>
              {plan.highlight ? <span className="rounded-[2px] bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">Recommended</span> : null}
            </div>
            <p className="mt-2 min-h-12 text-muted">{plan.blurb}</p>
            <Price plan={plan} cycle={cycle} />
            <p className="mt-2 text-sm text-muted">{cycle === "yearly" ? `${formatUSD(priceFor(plan, "yearly"))} billed once a year.` : "Billed monthly."} Same price when you renew.</p>
            <ButtonLink href={`/contact?plan=${plan.id}&cycle=${cycle}`} variant={plan.highlight ? "primary" : "secondary"} size="lg" className="mt-7">
              Request {tiers[plan.tier].label}
            </ButtonLink>
            <dl className="mt-8 border-t border-border text-[0.9375rem]">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b border-border py-3">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-right font-medium">{spec.value(plan)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-muted">No card needed. We reply with an invoice, you pay by bank transfer or Wise, and we start moving your sites.</p>

      {showCompare ? (
        <div className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[560px] text-[0.9375rem]">
            <caption className="pb-4 text-left text-xl font-semibold tracking-[-0.02em]">What changes between {siteTypes[type].short} plans</caption>
            <thead>
              <tr className="border-y border-foreground">
                <td className="py-3" />
                {visible.map((p) => (
                  <th key={p.id} scope="col" className="px-4 py-3 text-left font-semibold">
                    {tiers[p.tier].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {extras.map((row) => (
                <tr key={row.label} className="border-b border-border">
                  <th scope="row" className="py-3 pr-4 text-left font-normal text-muted">
                    {row.label}
                  </th>
                  {visible.map((p) => {
                    const v = row.value(p);
                    return (
                      <td key={p.id} className="px-4 py-3 font-medium">
                        {typeof v === "boolean" ? v ? <Check className="size-4" aria-label="Included" /> : <Minus className="size-4 text-muted" aria-label="Not included" /> : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
