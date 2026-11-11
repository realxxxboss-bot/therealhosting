import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RotateCw, Power } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { getSite, hasCapability } from "@/lib/data/client";
import { redeploySite, restartSite } from "@/app/actions/sites";
import { TabsNav } from "@/components/app/tabs-nav";
import { SiteStatusBadge } from "@/components/app/status";
import { SiteTypeIcon, siteTypeLabel } from "@/components/app/site-type";
import { ActionButton } from "@/components/app/action-button";
import { PageSkeleton } from "@/components/app/app-shell";

export default function SiteLayout({ children, params }: LayoutProps<"/dashboard/sites/[siteId]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SiteFrame params={params}>{children}</SiteFrame>
    </Suspense>
  );
}

async function SiteFrame({ children, params }: { children: ReactNode; params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = getSite(viewer, siteId);
  if (!site) notFound();
  const base = `/dashboard/sites/${site.id}`;
  const canManage = hasCapability(viewer, "sites:manage");
  const tabs = [
    { href: base, label: "Overview", exact: true },
    { href: `${base}/domains`, label: "Domains" },
    ...(site.type !== "wordpress" ? [{ href: `${base}/deployments`, label: "Deployments" }] : []),
    { href: `${base}/backups`, label: "Backups" },
    { href: `${base}/analytics`, label: "Analytics" },
    ...(site.type === "nextjs" ? [{ href: `${base}/environment`, label: "Environment" }] : []),
    { href: `${base}/logs`, label: "Logs" },
    ...(canManage ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];

  return (
    <>
      <Link href="/dashboard/sites" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All sites
      </Link>
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <SiteTypeIcon type={site.type} className="size-12 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{site.name}</h1>
            <SiteStatusBadge status={site.status} />
          </div>
          <a href={`https://${site.primaryDomain}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
            {site.primaryDomain} <ExternalLink className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <p className="mt-0.5 text-xs text-muted">
            {siteTypeLabel(site.type)} · {site.framework}
          </p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap items-start gap-2">
            {site.type !== "wordpress" ? (
              <ActionButton action={redeploySite} fields={{ siteId: site.id }} label="Redeploy" pendingLabel="Starting…" icon={<RotateCw aria-hidden />} />
            ) : null}
            <ActionButton action={restartSite} fields={{ siteId: site.id }} label="Restart" pendingLabel="Restarting…" icon={<Power aria-hidden />} confirm={`Restart ${site.name}? It may be unavailable for a few seconds.`} />
          </div>
        ) : null}
      </div>
      <TabsNav tabs={tabs} label="Site sections" />
      <div className="pt-6">{children}</div>
    </>
  );
}
