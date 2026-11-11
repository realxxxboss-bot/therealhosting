import { Activity, GitBranch, Globe, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";

const rows = [
  { name: "Company website", type: "Next.js", domain: "ukclient.example", ms: 142, tone: "success" as const, label: "Up" },
  { name: "Online shop", type: "Next.js", domain: "shop.ukclient.example", ms: 211, tone: "success" as const, label: "Up" },
  { name: "Blog", type: "WordPress", domain: "blog.ukclient.example", ms: 265, tone: "success" as const, label: "Up" },
  { name: "Spring offer page", type: "Static", domain: "offer.ukclient.example", ms: 38, tone: "success" as const, label: "Up" },
];

/** Illustration of the client dashboard for the home page. Uses demo data only. */
export function DashboardPreview() {
  return (
    <figure className="relative">
      <div className="rounded-[24px] border border-border bg-surface p-2 shadow-[0_30px_80px_-30px_rgb(0_20_168/45%)]">
        <div className="flex items-center gap-1.5 px-3 py-2" aria-hidden>
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="ml-3 rounded-md bg-surface-2 px-3 py-0.5 text-[11px] text-muted">zaffrehost.com/dashboard</span>
        </div>
        <div className="rounded-[18px] border border-border bg-background p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Activity, label: "Sites up", value: "6 / 6" },
              { icon: GitBranch, label: "Last deploy", value: "5h ago" },
              { icon: ShieldCheck, label: "SSL", value: "All active" },
              { icon: Globe, label: "Domains", value: "9" },
            ].map((s) => (
              <div key={s.label} className="rounded-[12px] border border-border bg-surface p-3">
                <s.icon className="size-4 text-primary" aria-hidden />
                <p className="mt-2 text-[11px] text-muted">{s.label}</p>
                <p className="font-display text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-border rounded-[12px] border border-border bg-surface">
            {rows.map((r) => (
              <li key={r.name} className="flex items-center gap-3 px-3 py-2.5 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.name}</p>
                  <p className="truncate text-muted">
                    {r.type} · {r.domain}
                  </p>
                </div>
                <span className="hidden text-muted sm:inline">{r.ms} ms</span>
                <StatusBadge tone={r.tone} label={r.label} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="sr-only">Preview of the Zaffre client dashboard with demo data.</figcaption>
    </figure>
  );
}
