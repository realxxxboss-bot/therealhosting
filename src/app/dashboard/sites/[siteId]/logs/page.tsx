import { requestTime } from "@/lib/request";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getSite } from "@/lib/data/client";
import { getAdapters } from "@/lib/adapters";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const levelColor = { info: "text-zaffre-300", warn: "text-amber-300", error: "text-red-300" } as const;

export default async function LogsPage({ params }: PageProps<"/dashboard/sites/[siteId]/logs">) {
  const now = await requestTime();
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = await getSite(viewer, siteId);
  if (!site) notFound();
  const lines = await getAdapters().deploy.logs(site, { limit: 60, now });
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm font-medium">Recent logs</p>
        <p className="text-xs text-muted">Last {lines.length} lines, times in UTC, secrets are redacted</p>
      </div>
      <div className="max-h-[560px] overflow-auto bg-zaffre-950 p-4 font-mono text-xs leading-6 text-zaffre-50" tabIndex={0} aria-label="Log output">
        {lines.map((l, i) => (
          <div key={`${l.at}-${i}`} className="flex gap-3 whitespace-pre">
            <span className="text-zaffre-200/70">{l.at.slice(5, 19).replace("T", " ")}</span>
            <span className={cn("w-12 uppercase", levelColor[l.level])}>{l.level}</span>
            <span className="w-16 text-zaffre-200/70">{l.source}</span>
            <span>{l.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
