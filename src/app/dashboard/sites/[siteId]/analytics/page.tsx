import { requestTime } from "@/lib/request";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getSite } from "@/lib/data/client";
import { getAdapters } from "@/lib/adapters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Chart } from "@/components/app/chart";

export default async function AnalyticsPage({ params }: PageProps<"/dashboard/sites/[siteId]/analytics">) {
  const now = await requestTime();
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = getSite(viewer, siteId);
  if (!site) notFound();
  const traffic = await getAdapters().analytics.traffic(site.id, { days: 30, now });
  const visitors = traffic.reduce((s, p) => s + p.visitors, 0);
  const bandwidthGb = traffic.reduce((s, p) => s + p.bandwidthMb, 0) / 1024;
  const label = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Visitors, 30 days" value={visitors.toLocaleString("en-US")} />
        <Stat label="Bandwidth, 30 days" value={`${bandwidthGb.toFixed(1)} GB`} />
        <Stat label="Avg visitors / day" value={Math.round(visitors / traffic.length).toLocaleString("en-US")} />
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Visitors</CardTitle>
            <CardDescription>Unique visitors per day. Privacy-friendly: no cookies, counted at the edge.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Chart kind="bar" title="Visitors" data={traffic.map((p) => ({ label: label(p.date), value: p.visitors }))} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Bandwidth</CardTitle>
            <CardDescription>Data served per day, in megabytes.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Chart kind="line" title="Bandwidth (MB)" unit=" MB" data={traffic.map((p) => ({ label: label(p.date), value: p.bandwidthMb }))} />
        </CardContent>
      </Card>
    </div>
  );
}
