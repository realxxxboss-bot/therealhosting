import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import { Suspense } from "react";
import { getAdapters } from "@/lib/adapters";
import type { ServiceStatus } from "@/lib/adapters/types";
import { PageHero, Section } from "@/components/marketing/section";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "System status",
  description: "Live health of Zaffre hosting, dashboard, deployments, DNS, backups and email.",
  alternates: { canonical: "/status" },
};

const tone = { operational: "success", degraded: "warning", outage: "danger" } as const;
const label = { operational: "Operational", degraded: "Degraded", outage: "Outage" } as const;
const barColor = { up: "bg-success", degraded: "bg-warning", down: "bg-danger", nodata: "bg-border" } as const;

export default function StatusPage() {
  return (
    <>
      <PageHero eyebrow="Status" title="System status" body="Live health of our services. Monitoring runs outside our own servers, so this page keeps working during an incident." />
      <Section className="pt-10 sm:pt-12">
        <Suspense fallback={<p className="text-muted">Checking services…</p>}>
          <LiveStatus />
        </Suspense>
      </Section>
    </>
  );
}

async function LiveStatus() {
  const now = await requestTime();
  const services = await getAdapters().uptime.platformStatus({ now });
  const worst = services.some((s) => s.status === "outage") ? "outage" : services.some((s) => s.status === "degraded") ? "degraded" : "operational";
  return (
    <div className="grid gap-6">
      <Alert tone={worst === "operational" ? "success" : worst === "degraded" ? "warning" : "danger"} title={worst === "operational" ? "All systems operational" : "Some systems are affected"}>
        Last checked {formatDateTime(new Date(now).toISOString())}.
      </Alert>
      <ul className="divide-y divide-border rounded-[16px] border border-border bg-surface">
        {services.map((s) => (
          <ServiceRow key={s.id} service={s} />
        ))}
      </ul>
      <p className="text-sm text-muted">
        Uptime history starts when monitoring goes live. We show &quot;no data&quot; instead of estimates until real measurements exist.
      </p>
    </div>
  );
}

function ServiceRow({ service }: { service: ServiceStatus }) {
  return (
    <li className="px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{service.name}</p>
          <p className="text-sm text-muted">{service.description}</p>
        </div>
        <StatusBadge tone={tone[service.status]} label={label[service.status]} />
      </div>
      <div className="mt-4 flex h-8 items-stretch gap-[2px]" role="img" aria-label={`${service.name}: 90-day history ${service.uptime90d === null ? "not available yet" : `${service.uptime90d}% uptime`}`}>
        {service.history.map((h, i) => (
          <span key={i} className={cn("flex-1 rounded-[2px]", barColor[h])} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>90 days ago</span>
        <span>{service.uptime90d === null ? "No data yet" : `${service.uptime90d}% uptime`}</span>
        <span>Today</span>
      </div>
    </li>
  );
}
