import type { Metadata } from "next";
import Link from "next/link";
import { Globe } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { listDomains, listSites } from "@/lib/data/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { DomainStatusBadge, SslBadge } from "@/components/app/status";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Domains" };

export default async function DomainsPage() {
  const viewer = await getViewer();
  const domains = await listDomains(viewer);
  const sites = new Map((await listSites(viewer)).map((s) => [s.id, s]));
  return (
    <>
      <PageHeader title="Domains" description="Every domain connected to your account. Domains stay registered in your name." actions={<ButtonLink href="/domains" variant="secondary">Search for a domain</ButtonLink>} />
      <Alert tone="info" title="Buying domains through Zaffre is coming soon">
        For now, keep your domains at your current registrar. To connect a domain, open a site and go to its Domains tab.
      </Alert>
      <Card className="mt-6">
        {domains.length === 0 ? (
          <CardContent className="text-center text-sm text-muted">
            <Globe className="mx-auto mb-2 size-6" aria-hidden /> No domains yet.
          </CardContent>
        ) : (
          <Table>
            <caption className="sr-only">Your domains</caption>
            <THead>
              <tr>
                <TH>Domain</TH>
                <TH>Site</TH>
                <TH>DNS</TH>
                <TH>SSL</TH>
                <TH>Registrar</TH>
                <TH>Expires</TH>
              </tr>
            </THead>
            <tbody>
              {domains.map((d) => {
                const site = d.siteId ? sites.get(d.siteId) : undefined;
                return (
                  <TR key={d.id}>
                    <TD>
                      <p className="font-mono text-xs font-semibold">{d.hostname}</p>
                      {d.redirectTo ? <p className="text-xs text-muted">Redirects to {d.redirectTo}</p> : null}
                    </TD>
                    <TD>
                      {site ? (
                        <Link href={`/dashboard/sites/${site.id}/domains`} className="text-primary hover:underline">
                          {site.name}
                        </Link>
                      ) : (
                        <span className="text-muted">Not connected</span>
                      )}
                    </TD>
                    <TD>
                      <DomainStatusBadge status={d.status} />
                    </TD>
                    <TD>
                      <SslBadge status={d.ssl} />
                    </TD>
                    <TD className="text-muted">{d.registrar ?? "—"}</TD>
                    <TD className="text-muted">{d.expiresAt ? formatDate(d.expiresAt) : "—"}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
