import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { getInvoice, hasCapability, listPaymentMethods } from "@/lib/data/client";
import { invoiceTotalCents } from "@/lib/billing";
import { submitPaymentProof } from "@/app/actions/billing";
import { MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { formatCents, formatDate } from "@/lib/utils";
import { ProofForm } from "./proof-form";

export const metadata: Metadata = { title: "Pay invoice" };

export default async function PayInvoicePage({ params }: PageProps<"/dashboard/billing/[invoiceId]/pay">) {
  const { invoiceId } = await params;
  const viewer = await getViewer();
  if (!hasCapability(viewer, "billing:pay")) notFound();
  const invoice = getInvoice(viewer, invoiceId);
  if (!invoice) notFound();
  if (invoice.status !== "unpaid") redirect(`/dashboard/billing/${invoice.id}`);
  const total = invoiceTotalCents(invoice);
  const methods = listPaymentMethods();

  return (
    <>
      <Link href={`/dashboard/billing/${invoice.id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Invoice {invoice.number}
      </Link>
      <PageHeader title={`Pay ${formatCents(total)}`} description={`Invoice ${invoice.number}, due ${formatDate(invoice.dueAt)}.`} />
      <ol className="grid gap-6">
        <li>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>1. Send the payment</CardTitle>
                <CardDescription>
                  Use one of these methods. Put <span className="font-mono font-semibold text-foreground">{invoice.number}</span> in the payment reference.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {methods.map((m) => (
                <div key={m.id} className="rounded-[8px] border border-border p-5">
                  <p className="font-semibold">{m.label}</p>
                  <p className="mt-1 text-sm text-muted">{m.instructions}</p>
                  <dl className="mt-4 grid gap-2">
                    {[...m.fields, { label: "Amount", value: formatCents(total) }, { label: "Reference", value: invoice.number }].map((f) => (
                      <div key={f.label} className="flex flex-wrap items-center justify-between gap-2 rounded-[4px] bg-surface-2 px-3 py-2">
                        <dt className="text-xs text-muted">{f.label}</dt>
                        <dd className="flex items-center gap-2">
                          <span className="font-mono text-sm">{f.value}</span>
                          <CopyButton value={f.value} label="Copy" />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </CardContent>
          </Card>
        </li>
        <li>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>2. Upload proof of payment</CardTitle>
                <CardDescription>A screenshot or PDF of the confirmation from your bank or Wise. PNG, JPG, WebP or PDF, up to {MAX_UPLOAD_BYTES / 1024 / 1024} MB. Stored privately.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ProofForm invoiceId={invoice.id} methods={methods.map((m) => ({ id: m.id, label: m.label }))} action={submitPaymentProof} />
            </CardContent>
          </Card>
        </li>
      </ol>
    </>
  );
}
