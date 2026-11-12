import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/auth/viewer";
import { loadAdminStore } from "@/lib/data/admin";
import { createClient } from "@/app/actions/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { FormShell } from "@/components/app/form-shell";
import { formatCents, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage() {
  await getAdmin();
  const store = await loadAdminStore();
  const rows = store.accounts.map((a) => {
    const subs = store.subscriptions.filter((s) => s.accountId === a.id && s.status === "active");
    return {
      account: a,
      sites: store.sites.filter((s) => s.accountId === a.id).length,
      mrr: subs.reduce((sum, s) => sum + (s.cycle === "monthly" ? s.priceCents : Math.round(s.priceCents / 12)), 0),
      members: store.memberships.filter((m) => m.accountId === a.id).length,
    };
  });

  return (
    <>
      <PageHeader title="Clients" description="Every client account. Open one to manage packages, sites, notes, or to sign in as them." />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <caption className="sr-only">Clients</caption>
              <THead>
                <tr>
                  <TH>Client</TH>
                  <TH>Sites</TH>
                  <TH>People</TH>
                  <TH>Monthly</TH>
                  <TH>Since</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <tbody>
                {rows.map(({ account, sites, mrr, members }) => (
                  <TR key={account.id}>
                    <TD>
                      <Link href={`/admin/clients/${account.id}`} className="font-semibold text-primary hover:underline">
                        {account.name}
                      </Link>
                      <span className="block text-xs text-muted">{account.billingEmail}</span>
                    </TD>
                    <TD>{sites}</TD>
                    <TD>{members}</TD>
                    <TD>{formatCents(mrr)}</TD>
                    <TD className="text-muted">{formatDate(account.createdAt)}</TD>
                    <TD>
                      <StatusBadge tone={account.status === "active" ? "success" : "danger"} label={account.status === "active" ? "Active" : "Suspended"} />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Add a client</CardTitle>
              <CardDescription>Creates the account and its owner. The owner gets a welcome email with a link to set a password.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FormShell action={createClient} submitLabel="Create client" pendingLabel="Creating…">
              <Field label="Company or client name" htmlFor="name">
                <Input id="name" name="name" required />
              </Field>
              <Field label="Owner's name" htmlFor="ownerName">
                <Input id="ownerName" name="ownerName" required />
              </Field>
              <Field label="Owner's email" htmlFor="ownerEmail">
                <Input id="ownerEmail" name="ownerEmail" type="email" required />
              </Field>
              <Field label="Country (optional)" htmlFor="country" hint="Only used on invoices.">
                <Input id="country" name="country" />
              </Field>
            </FormShell>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
