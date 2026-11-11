import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getServer, getSite, hasCapability, listSiteDomains, listSubscriptions } from "@/lib/data/client";
import { getPlan } from "@/config/plans";
import { updateSiteSettings } from "@/app/actions/sites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SettingsForm } from "./settings-form";

export default async function SiteSettingsPage({ params }: PageProps<"/dashboard/sites/[siteId]/settings">) {
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = getSite(viewer, siteId);
  if (!site || !hasCapability(viewer, "sites:manage")) notFound();
  const domains = listSiteDomains(viewer, site.id).filter((d) => !d.redirectTo).map((d) => d.hostname);
  const plan = getPlan(listSubscriptions(viewer).find((s) => s.id === site.subscriptionId)?.planId ?? "");
  const server = getServer(site.serverId);
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm siteId={site.id} name={site.name} primaryDomain={site.primaryDomain} domains={domains} action={updateSiteSettings} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Plan and resources</CardTitle>
            <CardDescription>
              {plan?.name}: {plan?.vcpu} vCPU, {plan?.ramGb} GB RAM and {plan?.storageGb} GB storage reserved for this package. Hosted in {server?.region}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ButtonLink href={`/dashboard/support/new?site=${site.id}&topic=upgrade`} variant="secondary">
            Ask about an upgrade
          </ButtonLink>
        </CardContent>
      </Card>
      <Card className="border-danger/40">
        <CardHeader>
          <div>
            <CardTitle>Remove this site</CardTitle>
            <CardDescription>We&apos;ll take a final backup, send you a copy and then remove the site. This is done by our team so nothing is deleted by accident.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ButtonLink href={`/dashboard/support/new?site=${site.id}&topic=remove`} variant="secondary" className="text-danger">
            Request removal
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
