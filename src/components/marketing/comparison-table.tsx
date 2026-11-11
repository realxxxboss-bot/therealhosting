import { Check, Minus } from "lucide-react";
import { plans, siteTypes, type SiteType } from "@/config/plans";
import { formatUSD } from "@/lib/utils";

const rows: { label: string; value: (p: (typeof plans)[number]) => string | boolean }[] = [
  { label: "Price / month (monthly)", value: (p) => formatUSD(p.monthly) },
  { label: "Price / year", value: (p) => formatUSD(p.monthly * 10) },
  { label: "Sites / apps", value: (p) => String(p.sites) },
  { label: "Reserved vCPU", value: (p) => String(p.vcpu) },
  { label: "Reserved RAM", value: (p) => `${p.ramGb} GB` },
  { label: "NVMe storage", value: (p) => `${p.storageGb} GB` },
  { label: "Bandwidth / month", value: (p) => `${p.bandwidthTb} TB` },
  { label: "Backup history", value: (p) => `${p.backupDays} days` },
  { label: "Free migration", value: () => true },
  { label: "Free SSL", value: () => true },
  { label: "Managed updates", value: () => true },
  { label: "Team access (no seat fees)", value: () => true },
  { label: "Staging copy on request", value: (p) => p.tier !== "starter" },
  { label: "Priority support queue", value: (p) => p.tier === "pro" },
];

export function ComparisonTable({ type }: { type: SiteType }) {
  const cols = plans.filter((p) => p.type === type);
  return (
    <div className="overflow-x-auto rounded-[16px] border border-border bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <caption className="sr-only">{siteTypes[type].label} plan comparison</caption>
        <thead>
          <tr className="border-b border-border bg-surface-2">
            <th scope="col" className="px-4 py-3 text-left font-medium text-muted">
              {siteTypes[type].short}
            </th>
            {cols.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-3 text-left font-semibold">
                {p.name.split(" ").pop()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-normal text-muted">
                {row.label}
              </th>
              {cols.map((p) => {
                const v = row.value(p);
                return (
                  <td key={p.id} className="px-4 py-3">
                    {typeof v === "boolean" ? (
                      v ? (
                        <Check className="size-4 text-success" aria-label="Included" />
                      ) : (
                        <Minus className="size-4 text-muted" aria-label="Not included" />
                      )
                    ) : (
                      v
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
