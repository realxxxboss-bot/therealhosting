import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { getInvoice, hasCapability, listPayments } from "@/lib/data/client";
import { invoiceTotalCents, isOverdue } from "@/lib/billing";
import { site } from "@/config/site";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { InvoiceStatusBadge } from "@/components/app/status";
import { PrintButton } from "@/components/app/print-button";
import { formatCents, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({ params, searchParams }: PageProps<"/dashboard/billing/[invoiceId]">) {
  const now = await requestTime();
  const { invoiceId } = await params;
  const submitted = (await searchParams).submitted === "1";
  const viewer = await getViewer();
  const invoice = getInvoice(viewer, invoiceId);
  if (!invoice) notFound();
  const total = invoiceTotalCents(invoice);
  const payment = listPayments(viewer).find((p) => p.invoiceId === invoice.id);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/billing" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> Billing
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          {invoice.status === "unpaid" && hasCapability(viewer, "billing:pay") ? <ButtonLink href={`/dashboard/billing/${invoice.id}/pay`}>Pay {formatCents(total)}</ButtonLink> : null}
        </div>
      </div>
      {submitted ? (
        <Alert tone="success" title="Thanks, we've received your payment proof" className="mb-6 print:hidden">
          We&apos;ll check it and confirm by email, usually within one business day. The invoice shows &quot;Pending verification&quot; until then.
        </Alert>
      ) : null}
      {invoice.status === "pending_verification" && !submitted ? (
        <Alert tone="info" title="Payment being checked" className="mb-6 print:hidden">
          You sent proof {payment ? `(reference ${payment.reference})` : ""}. We&apos;ll confirm it soon.
        </Alert>
      ) : null}
      <Card>
        <CardContent className="p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Logo />
              <p className="mt-3 text-sm text-muted">{site.legalName}</p>
              <p className="text-sm text-muted">{site.contact.supportEmail}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-semibold">Invoice</h1>
              <p className="font-mono text-sm">{invoice.number}</p>
              <div className="mt-2">
                <InvoiceStatusBadge status={invoice.status} overdue={isOverdue(invoice, now)} />
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted">Billed to</p>
              <p className="mt-1 font-medium">{viewer.account.name}</p>
              <p className="text-sm text-muted">{viewer.account.billingEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Issued</p>
              <p className="mt-1">{formatDate(invoice.issuedAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Due</p>
              <p className="mt-1">{formatDate(invoice.dueAt)}</p>
            </div>
          </div>
          <table className="mt-8 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th scope="col" className="py-2 font-medium">Description</th>
                <th scope="col" className="py-2 text-right font-medium">Qty</th>
                <th scope="col" className="py-2 text-right font-medium">Unit</th>
                <th scope="col" className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l) => (
                <tr key={l.description} className="border-b border-border">
                  <td className="py-3">{l.description}</td>
                  <td className="py-3 text-right">{l.quantity}</td>
                  <td className="py-3 text-right">{l.unitCents === 0 ? "Free" : formatCents(l.unitCents)}</td>
                  <td className="py-3 text-right">{formatCents(l.unitCents * l.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="pt-4 text-right font-semibold">
                  Total (USD)
                </th>
                <td className="pt-4 text-right font-display text-xl font-semibold">{formatCents(total)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="mt-10 text-xs text-muted">Thank you for hosting with {site.name}. Questions about this invoice: {site.contact.supportEmail}.</p>
        </CardContent>
      </Card>
    </>
  );
}
