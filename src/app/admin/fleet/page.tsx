import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth/viewer";
import { loadAdminStore } from "@/lib/data/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Servers" };

function Meter({ label, pct }: { label: string; pct: number }) {
  const tone = pct >= 85 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface-2" role="meter" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-2 rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function FleetPage() {
  await getAdmin();
  const store = await loadAdminStore();
  return (
    <>
      <PageHeader title="Servers" description="Fleet health. Values come from the monitoring adapter (demo data for now)." />
      <div className="grid gap-6 md:grid-cols-2">
        {store.servers.map((s) => {
          const sites = store.sites.filter((x) => x.serverId === s.id);
          return (
            <Card key={s.id}>
              <CardHeader>
                <div>
                  <CardTitle className="font-mono">{s.name}</CardTitle>
                  <CardDescription>
                    {s.region}, {s.vcpu} vCPU, {s.ramGb} GB RAM, {s.diskGb} GB disk, {s.ip}
                  </CardDescription>
                </div>
                <StatusBadge tone={s.status === "healthy" ? "success" : s.status === "warning" ? "warning" : "danger"} label={s.status === "healthy" ? "Healthy" : s.status === "warning" ? "Needs a look" : "Down"} />
              </CardHeader>
              <CardContent className="grid gap-3">
                <Meter label="CPU" pct={s.cpuPct} />
                <Meter label="Memory" pct={s.ramPct} />
                <Meter label="Disk" pct={s.diskPct} />
                <p className="pt-2 text-sm text-muted">
                  {sites.length} sites: {sites.map((x) => x.name).join(", ") || "none"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
