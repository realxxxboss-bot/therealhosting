import type { Metadata } from "next";
import { Suspense } from "react";
import { requestTime } from "@/lib/request";
import { getAdapters, providerMessage } from "@/lib/adapters";
import { uptimeNotConnected } from "@/lib/adapters/live/not-connected";
import type { ServiceStatus } from "@/lib/adapters/types";
import { site } from "@/config/site";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { RuledList, Split, TextLink } from "@/components/marketing/blocks";
import { StatusBadge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "System status",
  description: "Health of Zaffre hosting, dashboard, deployments, DNS, backups and email, and how we tell you when something is wrong.",
  alternates: { canonical: "/status" },
};

const tone = { operational: "success", degraded: "warning", outage: "danger" } as const;
const label = { operational: "Operational", degraded: "Degraded", outage: "Outage" } as const;
const barColor = { up: "bg-success", degraded: "bg-warning", down: "bg-danger", nodata: "bg-border" } as const;

const how = [
  { title: "Checked from outside", body: "Monitoring runs outside our own servers, so this page and our alerts keep working during an incident." },
  { title: "A person investigates", body: "An alert goes to a real person, who looks at it as soon as they see it and writes down what they find." },
  { title: "You hear from us", body: "If your site is affected, we tell you by email what happened, what we did, and whether you need to do anything." },
  { title: "Maintenance is announced", body: "Planned work is posted here and emailed to affected clients at least 48 hours before it starts." },
];

export default function StatusPage() {
  return (
    <>
      <PageHero title="System status" body="The health of each part of the service, and how we tell you when something is wrong." />
      <Section className="py-12 sm:py-16 lg:py-20">
        <Suspense fallback={<p className="text-muted">Checking services…</p>}>
          <LiveStatus />
        </Suspense>
      </Section>

      <Section tone="sunk">
        <Split heading={<SectionHeading title="How we watch the service" />}>
          <RuledList items={how} />
        </Split>
      </Section>

      <Section>
        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.03em]">Incident history</h2>
            <p className="mt-5 border-y border-border py-6 text-muted">No incidents have been recorded. When one happens, the notes are published here and stay here.</p>
          </div>
          <div>
            <h2 className="text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.03em]">Planned maintenance</h2>
            <p className="mt-5 border-y border-border py-6 text-muted">Nothing is scheduled.</p>
          </div>
        </div>
        <p className="mt-10 max-w-[62ch] text-muted">
          What we commit to on monitoring and response is written down in our <TextLink href="/legal/sla">Service Levels</TextLink>. If your site has a problem that is not shown here, write to{" "}
          <TextLink href={`mailto:${site.contact.supportEmail}`}>{site.contact.supportEmail}</TextLink>.
        </p>
      </Section>
    </>
  );
}

async function LiveStatus() {
  const now = await requestTime();
  const uptime = getAdapters().uptime;
  // If the monitor can't be reached, show "no data" rather than an error page or a guess.
  const services = await uptime.platformStatus({ now }).catch((e: unknown) => {
    if (!providerMessage(e)) throw e;
    return uptimeNotConnected.platformStatus({ now });
  });
  const measured = services.some((s) => s.history.some((h) => h !== "nodata"));
  const worst = services.some((s) => s.status === "outage") ? "outage" : services.some((s) => s.status === "degraded") ? "degraded" : "operational";
  const headline = !measured ? "Monitoring is not connected yet" : worst === "operational" ? "All systems operational" : "Some systems are affected";
  return (
    <div>
      <div className={cn("rounded-[8px] px-6 py-6 sm:px-8", !measured ? "bg-surface-2" : worst === "operational" ? "bg-success-soft" : worst === "degraded" ? "bg-warning-soft" : "bg-danger-soft")}>
        <p className="text-2xl font-semibold tracking-[-0.025em]">{headline}</p>
        <p className="mt-1 text-muted">
          {measured
            ? `Last checked ${formatDateTime(new Date(now).toISOString())}.`
            : `Monitoring is not connected yet. The services below are listed so you can see what will be measured. We show "no data" instead of estimates until real measurements exist.`}
        </p>
      </div>
      <ul className="mt-10 border-t border-foreground">
        {services.map((s) => (
          <ServiceRow key={s.id} service={s} measured={measured} />
        ))}
      </ul>
    </div>
  );
}

function ServiceRow({ service, measured }: { service: ServiceStatus; measured: boolean }) {
  const recent = service.history.slice(-30);
  return (
    <li className="border-b border-border py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{service.name}</p>
          <p className="text-muted">{service.description}</p>
        </div>
        {measured ? <StatusBadge tone={tone[service.status]} label={label[service.status]} /> : <StatusBadge tone="neutral" label="Not measured yet" />}
      </div>
      <div className="mt-4 hidden h-7 items-stretch gap-[2px] sm:flex" role="img" aria-label={`${service.name}: 90-day history ${service.uptime90d === null ? "not available yet" : `${service.uptime90d}% uptime`}`}>
        {service.history.map((h, i) => (
          <span key={i} className={cn("flex-1 rounded-[1px]", barColor[h])} />
        ))}
      </div>
      <div className="mt-4 flex h-7 items-stretch gap-[2px] sm:hidden" role="img" aria-label={`${service.name}: 30-day history ${service.uptime90d === null ? "not available yet" : `${service.uptime90d}% uptime over 90 days`}`}>
        {recent.map((h, i) => (
          <span key={i} className={cn("flex-1 rounded-[1px]", barColor[h])} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm text-muted">
        <span className="hidden sm:inline">90 days ago</span>
        <span className="sm:hidden">30 days ago</span>
        <span>{service.uptime90d === null ? "No data yet" : `${service.uptime90d}% uptime over 90 days`}</span>
        <span>Today</span>
      </div>
    </li>
  );
}
