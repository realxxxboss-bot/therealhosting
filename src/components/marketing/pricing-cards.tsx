"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { plans, siteTypes, effectiveMonthly, priceFor, yearlySavingPercent, type BillingCycle, type SiteType } from "@/config/plans";
import { ButtonLink } from "@/components/ui/button";
import { cn, formatUSD } from "@/lib/utils";

const typeOrder: SiteType[] = ["nextjs", "wordpress", "static"];

export function PricingCards({ initialType = "nextjs", showTypeSwitch = true }: { initialType?: SiteType; showTypeSwitch?: boolean }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [type, setType] = useState<SiteType>(initialType);
  const visible = plans.filter((p) => p.type === type);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {showTypeSwitch ? (
          <div role="radiogroup" aria-label="Site type" className="inline-flex rounded-[12px] border border-border bg-surface p-1">
            {typeOrder.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => setType(t)}
                className={cn("rounded-[9px] px-4 py-2 text-sm font-medium transition-colors", type === t ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground")}
              >
                {siteTypes[t].short}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div role="radiogroup" aria-label="Billing period" className="inline-flex items-center rounded-[12px] border border-border bg-surface p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cycle === c}
              onClick={() => setCycle(c)}
              className={cn("rounded-[9px] px-4 py-2 text-sm font-medium transition-colors", cycle === c ? "bg-foreground text-background" : "text-muted hover:text-foreground")}
            >
              {c === "monthly" ? "Monthly" : `Yearly · save ${yearlySavingPercent()}%`}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">{siteTypes[type].description}</p>

      <ul className="mt-6 grid gap-4 lg:grid-cols-3">
        {visible.map((plan) => (
          <li
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-[20px] border bg-surface p-6 shadow-[var(--shadow-soft)]",
              plan.highlight ? "border-primary ring-1 ring-primary" : "border-border",
            )}
          >
            {plan.highlight ? (
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Recommended</span>
            ) : null}
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <p className="mt-1 min-h-10 text-sm text-muted">{plan.blurb}</p>
            <p className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold tracking-tight">{formatUSD(effectiveMonthly(plan, cycle))}</span>
              <span className="text-sm text-muted">/ month</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {cycle === "yearly" ? `${formatUSD(priceFor(plan, "yearly"))} billed yearly. ` : "Billed monthly. "}
              Same price on renewal.
            </p>
            <ButtonLink href={`/contact?plan=${plan.id}&cycle=${cycle}`} variant={plan.highlight ? "primary" : "secondary"} className="mt-6">
              Choose {plan.name.split(" ").pop()}
            </ButtonLink>
            <ul className="mt-6 grid gap-2.5 text-sm">
              {[
                `${plan.sites} ${siteTypes[plan.type].unit}${plan.sites > 1 ? "s" : ""}`,
                `${plan.vcpu} vCPU · ${plan.ramGb} GB RAM reserved`,
                `${plan.storageGb} GB NVMe storage`,
                `${plan.bandwidthTb} TB bandwidth / month`,
                `${plan.backupDays} days of daily backups`,
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
