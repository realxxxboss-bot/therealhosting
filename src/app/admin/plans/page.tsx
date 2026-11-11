import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { plans, priceFor, siteTypes } from "@/config/plans";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { formatUSD } from "@/lib/utils";

export const metadata: Metadata = { title: "Plans" };

export default async function PlansPage() {
  await getAdmin();
  const store = db();
  return (
    <>
      <PageHeader title="Plans" description="The public price list. Per-client deals are set on each client's packages." />
      <Alert className="mb-6">
        List prices live in code (src/config/plans.ts) so the pricing page, dashboard and invoices can never disagree. Changing a list price never changes what existing clients pay: their price is locked on their package.
      </Alert>
      <Card>
        <CardContent className="px-0 py-0">
          <Table>
            <caption className="sr-only">Plans</caption>
            <THead>
              <tr>
                <TH>Plan</TH>
                <TH>Type</TH>
                <TH>Monthly</TH>
                <TH>Yearly</TH>
                <TH>Sites</TH>
                <TH>Resources</TH>
                <TH>Backups</TH>
                <TH>Active packages</TH>
              </tr>
            </THead>
            <tbody>
              {plans.map((p) => (
                <TR key={p.id}>
                  <TD className="font-medium">{p.name}</TD>
                  <TD className="text-muted">{siteTypes[p.type].short}</TD>
                  <TD>{formatUSD(priceFor(p, "monthly"))}</TD>
                  <TD>{formatUSD(priceFor(p, "yearly"))}</TD>
                  <TD>{p.sites}</TD>
                  <TD className="text-muted">
                    {p.vcpu} vCPU, {p.ramGb} GB, {p.storageGb} GB SSD
                  </TD>
                  <TD className="text-muted">{p.backupDays} days</TD>
                  <TD>{store.subscriptions.filter((s) => s.planId === p.id && s.status === "active").length}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
