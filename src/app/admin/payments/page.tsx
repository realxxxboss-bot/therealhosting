import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import { FileCheck2 } from "lucide-react";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { reviewPayment } from "@/app/actions/admin";
import { invoiceTotalCents } from "@/lib/billing";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { FormShell } from "@/components/app/form-shell";
import { ActionButton } from "@/components/app/action-button";
import { formatBytes, formatCents, formatDateTime, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment checks" };

export default async function PaymentsPage() {
  const now = await requestTime();
  await getAdmin();
  const store = db();
  const accounts = new Map(store.accounts.map((a) => [a.id, a.name]));
  const methods = new Map(store.paymentMethods.map((m) => [m.id, m.label]));
  const users = new Map(store.users.map((u) => [u.id, u.name]));
  const pending = store.payments.filter((p) => p.status === "pending_verification");
  const reviewed = store.payments.filter((p) => p.status !== "pending_verification").sort((a, b) => (b.reviewedAt ?? "").localeCompare(a.reviewedAt ?? ""));

  return (
    <>
      <PageHeader title="Payment checks" description="Match each proof to the money in the bank or Wise account, then approve or reject." />
      {pending.length === 0 ? (
        <EmptyState icon={FileCheck2} title="Nothing to check" body="New payment proofs from clients will appear here." />
      ) : (
        <div className="grid gap-4">
          {pending.map((p) => {
            const invoice = store.invoices.find((i) => i.id === p.invoiceId);
            const due = invoice ? invoiceTotalCents(invoice) : 0;
            return (
              <Card key={p.id}>
                <CardHeader>
                  <div>
                    <CardTitle>
                      {accounts.get(p.accountId)}, {invoice?.number}
                    </CardTitle>
                    <CardDescription>
                      Sent {formatRelative(p.submittedAt, now)} by {users.get(p.submittedBy)}
                    </CardDescription>
                  </div>
                  <StatusBadge tone="warning" label="Waiting for you" />
                </CardHeader>
                <CardContent className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <dt className="text-muted">Amount sent</dt>
                    <dd className="font-semibold">{formatCents(p.amountCents)}</dd>
                    <dt className="text-muted">Invoice total</dt>
                    <dd className={p.amountCents === due ? "" : "font-semibold text-danger"}>
                      {formatCents(due)}
                      {p.amountCents !== due ? " (doesn't match)" : ""}
                    </dd>
                    <dt className="text-muted">Method</dt>
                    <dd>{methods.get(p.methodId)}</dd>
                    <dt className="text-muted">Reference</dt>
                    <dd className="font-mono text-xs">{p.reference}</dd>
                    <dt className="text-muted">Proof file</dt>
                    <dd>
                      {p.proofFileName} <span className="text-muted">({formatBytes(p.proofSize)})</span>
                    </dd>
                  </dl>
                  <div className="grid content-start gap-4">
                    <ActionButton action={reviewPayment} fields={{ paymentId: p.id, decision: "approve" }} label="Approve and mark paid" variant="primary" size="md" confirm="Have you seen this money arrive?" />
                    <FormShell action={reviewPayment} submitLabel="Reject" variant="danger" className="rounded-[8px] border border-border p-4">
                      <input type="hidden" name="paymentId" value={p.id} />
                      <input type="hidden" name="decision" value="reject" />
                      <Field label="Reason (the client sees this)" htmlFor={`reason-${p.id}`}>
                        <Input id={`reason-${p.id}`} name="reason" placeholder="We can't find this transfer yet. Please check the reference." />
                      </Field>
                    </FormShell>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reviewed</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <caption className="sr-only">Reviewed payments</caption>
            <THead>
              <tr>
                <TH>Client</TH>
                <TH>Amount</TH>
                <TH>Reference</TH>
                <TH>Result</TH>
                <TH>Reviewed</TH>
              </tr>
            </THead>
            <tbody>
              {reviewed.map((p) => (
                <TR key={p.id}>
                  <TD>{accounts.get(p.accountId)}</TD>
                  <TD>{formatCents(p.amountCents)}</TD>
                  <TD className="font-mono text-xs">{p.reference}</TD>
                  <TD>
                    <StatusBadge tone={p.status === "approved" ? "success" : "danger"} label={p.status === "approved" ? "Approved" : "Rejected"} />
                    {p.rejectReason ? <span className="block text-xs text-muted">{p.rejectReason}</span> : null}
                  </TD>
                  <TD className="text-muted">{p.reviewedAt ? formatDateTime(p.reviewedAt) : "—"}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
