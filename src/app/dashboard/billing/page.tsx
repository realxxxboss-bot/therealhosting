import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { hasCapability, listInvoices, listPayments, listPaymentMethods, listSites, listSubscriptions } from "@/lib/data/client";
import { getPlan } from "@/config/plans";
import { invoiceTotalCents, isOverdue } from "@/lib/billing";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/app/status";
import { formatCents, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  await connection();
  const now = Date.now();
  const viewer = await getViewer();
  if (!hasCapability(viewer, "billing:view")) notFound();
  const subs = listSubscriptions(viewer);
  const invoices = listInvoices(viewer);
  const payments = listPayments(viewer);
  const methods = new Map(listPaymentMethods().map((m) => [m.id, m.label]));
  const sites = listSites(viewer);
  const invoiceNumbers = new Map(invoices.map((i) => [i.id, i.number]));
  const overdue = invoices.filter((i) => isOverdue(i, now));
  const monthly = subs.reduce((sum, s) => sum + (s.cycle === "monthly" ? s.priceCents : Math.round(s.priceCents / 12)), 0);

  return (
    <>
      <PageHeader title="Billing" description="Your packages, invoices and payments. All amounts in USD." />
      {overdue.length > 0 ? (
        <Alert tone="warning" title="You have an overdue invoice" className="mb-6">
          Your sites are not affected. Please pay {overdue.map((i) => i.number).join(", ")} when you can.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Packages</CardTitle>
              <CardDescription>Prices are locked. They don&apos;t go up when you renew.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {subs.map((s) => {
              const plan = getPlan(s.planId);
              const used = sites.filter((x) => x.subscriptionId === s.id).length;
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-border p-4">
                  <div>
                    <p className="font-semibold">{plan?.name}</p>
                    <p className="text-sm text-muted">
                      {used} of {plan?.sites} sites · {s.cycle === "monthly" ? "Monthly" : "Yearly"} · renews {formatDate(s.renewsAt)}
                    </p>
                  </div>
                  <p className="font-display text-lg font-bold">
                    {formatCents(s.priceCents)}
                    <span className="text-sm font-normal text-muted"> / {s.cycle === "monthly" ? "mo" : "yr"}</span>
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Monthly equivalent</dt>
                <dd className="font-semibold">{formatCents(monthly)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Billing email</dt>
                <dd>{viewer.account.billingEmail}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Payment methods</dt>
                <dd>Bank transfer, Wise</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">Card payments are coming. Need to change a package? Open a support ticket.</p>
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
                <TH>Due</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <tbody>
              {invoices.map((inv) => (
                <TR key={inv.id}>
                  <TD>
                    <Link href={`/dashboard/billing/${inv.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                      {inv.number}
                    </Link>
                  </TD>
                  <TD className="text-muted">{formatDate(inv.issuedAt)}</TD>
                  <TD className="text-muted">{formatDate(inv.dueAt)}</TD>
                  <TD className="font-medium">{formatCents(invoiceTotalCents(inv))}</TD>
                  <TD>
                    <InvoiceStatusBadge status={inv.status} overdue={isOverdue(inv, now)} />
                  </TD>
                  <TD className="text-right">
                    {inv.status === "unpaid" && hasCapability(viewer, "billing:pay") ? (
                      <ButtonLink href={`/dashboard/billing/${inv.id}/pay`} size="sm">
                        Pay
                      </ButtonLink>
                    ) : (
                      <ButtonLink href={`/dashboard/billing/${inv.id}`} size="sm" variant="ghost">
                        View
                      </ButtonLink>
                    )}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <caption className="sr-only">Payments</caption>
            <THead>
              <tr>
                <TH>Date</TH>
                <TH>Invoice</TH>
                <TH>Method</TH>
                <TH>Reference</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <tbody>
              {payments.map((p) => (
                <TR key={p.id}>
                  <TD className="text-muted">{formatDate(p.submittedAt)}</TD>
                  <TD className="font-mono text-xs">{invoiceNumbers.get(p.invoiceId)}</TD>
                  <TD>{methods.get(p.methodId) ?? p.methodId}</TD>
                  <TD className="font-mono text-xs">{p.reference}</TD>
                  <TD>{formatCents(p.amountCents)}</TD>
                  <TD>
                    <StatusBadge
                      tone={p.status === "approved" ? "success" : p.status === "rejected" ? "danger" : "primary"}
                      label={p.status === "approved" ? "Confirmed" : p.status === "rejected" ? "Not confirmed" : "Being checked"}
                    />
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
