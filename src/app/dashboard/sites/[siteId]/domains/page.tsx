import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getSite, hasCapability, listSiteDomains } from "@/lib/data/client";
import { getAdapters } from "@/lib/adapters";
import { addDomain, checkDomain, removeDomain, setRedirect } from "@/app/actions/sites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainStatusBadge, SslBadge } from "@/components/app/status";
import { ActionButton } from "@/components/app/action-button";
import { DnsRecordsTable } from "@/components/app/dns-records";
import { AddDomainForm, RedirectForm } from "./forms";

export default async function SiteDomainsPage({ params }: PageProps<"/dashboard/sites/[siteId]/domains">) {
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = await getSite(viewer, siteId);
  if (!site) notFound();
  const domains = await listSiteDomains(viewer, site.id);
  const canManage = hasCapability(viewer, "domains:manage") && hasCapability(viewer, "sites:manage");
  const adapters = getAdapters();

  return (
    <div className="grid gap-6">
      {canManage ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Connect a domain</CardTitle>
              <CardDescription>Your domain stays with your registrar. You add two DNS records and we handle SSL automatically.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AddDomainForm siteId={site.id} action={addDomain} />
          </CardContent>
        </Card>
      ) : null}

      {domains.map((d) => {
        const others = domains.filter((o) => o.id !== d.id && !o.redirectTo).map((o) => o.hostname);
        return (
          <Card key={d.id}>
            <CardHeader>
              <div className="min-w-0">
                <CardTitle className="font-mono text-[15px]">{d.hostname}</CardTitle>
                <CardDescription>
                  {d.hostname === site.primaryDomain ? "Primary domain" : d.redirectTo ? `Redirects to ${d.redirectTo}` : "Serves this site"}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DomainStatusBadge status={d.status} />
                <SslBadge status={d.ssl} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              {d.status !== "active" ? (
                <div className="grid gap-4">
                  <ol className="grid gap-2 text-sm">
                    <li>
                      <span className="font-semibold">1.</span> Sign in to the company where you bought <span className="font-mono">{d.hostname}</span> (your registrar or DNS provider).
                    </li>
                    <li>
                      <span className="font-semibold">2.</span> Open the DNS settings and add these records exactly as shown. Remove any old A or CNAME record for the same name.
                    </li>
                    <li>
                      <span className="font-semibold">3.</span> Come back and press <strong>Check now</strong>. DNS changes can take a few minutes, sometimes up to an hour.
                    </li>
                  </ol>
                  <DnsRecordsTable records={adapters.hostnames.requiredRecords(d.hostname)} />
                </div>
              ) : null}
              {canManage ? (
                <div className="flex flex-wrap items-start gap-3">
                  <ActionButton action={checkDomain} fields={{ domainId: d.id }} label="Check now" pendingLabel="Checking DNS…" variant={d.status === "active" ? "secondary" : "primary"} />
                  {others.length > 0 ? <RedirectForm siteId={site.id} domainId={d.id} options={others} current={d.redirectTo ?? ""} action={setRedirect} /> : null}
                  {d.hostname !== site.primaryDomain ? (
                    <ActionButton action={removeDomain} fields={{ siteId: site.id, domainId: d.id }} label="Remove" variant="ghost" confirm={`Remove ${d.hostname} from ${site.name}?`} />
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
