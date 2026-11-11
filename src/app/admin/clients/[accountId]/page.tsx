import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { addAdminNote, impersonateClient, updateClient, upsertPackage } from "@/app/actions/admin";
import { getPlan, plans } from "@/config/plans";
import { roleLabels } from "@/lib/auth/permissions";
import { invoiceTotalCents } from "@/lib/billing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { FormShell } from "@/components/app/form-shell";
import { InvoiceStatusBadge, SiteStatusBadge } from "@/components/app/status";
import { formatCents, formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Client" };

export default async function ClientPage({ params }: PageProps<"/admin/clients/[accountId]">) {
  const { accountId } = await params;
  await getAdmin();
  const store = db();
  const account = store.accounts.find((a) => a.id === accountId);
  if (!account) notFound();
  const subs = store.subscriptions.filter((s) => s.accountId === account.id);
  const sites = store.sites.filter((s) => s.accountId === account.id);
  const invoices = store.invoices.filter((i) => i.accountId === account.id);
  const notes = store.adminNotes.filter((n) => n.accountId === account.id);
  const members = store.memberships
    .filter((m) => m.accountId === account.id)
    .map((m) => ({ m, u: store.users.find((u) => u.id === m.userId) }));

  return (
    <>
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Clients
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{account.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {account.billingEmail} · client since {formatDate(account.createdAt)}
          </p>
        </div>
        <form action={impersonateClient}>
          <input type="hidden" name="accountId" value={account.id} />
          <Button type="submit" variant="secondary">
            <LogIn className="size-4" aria-hidden /> Sign in as this client
          </Button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FormShell action={updateClient} submitLabel="Save">
              <input type="hidden" name="accountId" value={account.id} />
              <Field label="Name" htmlFor="name">
                <Input id="name" name="name" defaultValue={account.name} />
              </Field>
              <Field label="Billing email" htmlFor="billingEmail">
                <Input id="billingEmail" name="billingEmail" type="email" defaultValue={account.billingEmail} />
              </Field>
              <Field label="Status" htmlFor="status" hint="Suspending is a last resort. Overdue invoices never take sites offline automatically.">
                <Select id="status" name="status" defaultValue={account.status}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </Field>
            </FormShell>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Internal notes</CardTitle>
              <CardDescription>Only staff can see these.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormShell action={addAdminNote} submitLabel="Add note" resetOnSuccess>
              <input type="hidden" name="accountId" value={account.id} />
              <Field label="New note" htmlFor="note-body">
                <Textarea id="note-body" name="body" rows={3} />
              </Field>
            </FormShell>
            <ol className="grid gap-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-[12px] bg-surface-2 p-3 text-sm">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.authorName} · {formatDateTime(n.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Packages</CardTitle>
            <CardDescription>Price is locked per package. Change it here for a custom deal.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {subs.map((s) => (
            <PackageForm key={s.id} accountId={account.id} sub={s} used={sites.filter((x) => x.subscriptionId === s.id).length} />
          ))}
          <div className="rounded-[12px] border border-dashed border-border p-4">
            <p className="mb-3 text-sm font-semibold">Add a package</p>
            <PackageForm accountId={account.id} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sites</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <caption className="sr-only">Sites</caption>
              <tbody>
                {sites.map((s) => (
                  <TR key={s.id}>
                    <TD>
                      <span className="font-medium">{s.name}</span>
                      <span className="block text-xs text-muted">{s.primaryDomain}</span>
                    </TD>
                    <TD>
                      <SiteStatusBadge status={s.status} />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <caption className="sr-only">People</caption>
              <tbody>
                {members.map(({ m, u }) => (
                  <TR key={m.id}>
                    <TD>
                      <span className="font-medium">{u?.name}</span>
                      <span className="block text-xs text-muted">{u?.email}</span>
                    </TD>
                    <TD className="text-muted">{roleLabels[m.role].label}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <caption className="sr-only">Invoices</caption>
            <THead>
              <tr>
                <TH>Number</TH>
                <TH>Issued</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <tbody>
              {invoices.map((i) => (
                <TR key={i.id}>
                  <TD className="font-mono text-xs">{i.number}</TD>
                  <TD className="text-muted">{formatDate(i.issuedAt)}</TD>
                  <TD>{formatCents(invoiceTotalCents(i))}</TD>
                  <TD>
                    <InvoiceStatusBadge status={i.status} />
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function PackageForm({ accountId, sub, used }: { accountId: string; sub?: { id: string; planId: string; cycle: string; priceCents: number; renewsAt: string }; used?: number }) {
  const plan = sub ? getPlan(sub.planId) : undefined;
  const prefix = sub?.id ?? "new";
  return (
    <FormShell action={upsertPackage} submitLabel={sub ? "Update" : "Add package"} className="gap-3">
      <input type="hidden" name="accountId" value={accountId} />
      {sub ? <input type="hidden" name="subscriptionId" value={sub.id} /> : null}
      {sub && plan ? (
        <p className="text-sm text-muted">
          {used} of {plan.sites} sites used · renews {formatDate(sub.renewsAt)}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Plan" htmlFor={`${prefix}-plan`}>
          <Select id={`${prefix}-plan`} name="planId" defaultValue={sub?.planId ?? "nextjs-business"}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.monthly}/mo list)
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cycle" htmlFor={`${prefix}-cycle`}>
          <Select id={`${prefix}-cycle`} name="cycle" defaultValue={sub?.cycle ?? "monthly"}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </Field>
        <Field label="Locked price (USD per cycle)" htmlFor={`${prefix}-price`}>
          <Input id={`${prefix}-price`} name="price" type="number" min={0} step="0.01" defaultValue={sub ? (sub.priceCents / 100).toFixed(2) : "39.00"} />
        </Field>
      </div>
    </FormShell>
  );
}
