import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { createInvoice, runRecurringBilling, setInvoiceStatus } from "@/app/actions/admin";
import { invoiceTotalCents, isOverdue } from "@/lib/billing";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { FormShell } from "@/components/app/form-shell";
import { ActionButton } from "@/components/app/action-button";
import { InvoiceStatusBadge } from "@/components/app/status";
import { formatCents, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Invoices" };

export default async function AdminInvoicesPage() {
  const now = await requestTime();
  await getAdmin();
  const store = db();
  const accounts = new Map(store.accounts.map((a) => [a.id, a.name]));
  const invoices = [...store.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Create one-off invoices, run renewals and record payments made outside the dashboard."
        actions={<FormShell action={runRecurringBilling} submitLabel="Run renewals now" pendingLabel="Running…" variant="secondary" />}
      />
      <Card>
        <CardContent className="px-0 py-0">
          <Table>
            <caption className="sr-only">All invoices</caption>
            <THead>
              <tr>
                <TH>Number</TH>
                <TH>Client</TH>
                <TH>Issued</TH>
                <TH>Due</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <tbody>
              {invoices.map((i) => (
                <TR key={i.id}>
                  <TD className="font-mono text-xs font-semibold">
                    {i.number}
                    {i.recurring ? <span className="block font-sans font-normal text-muted">Renewal</span> : null}
                  </TD>
                  <TD>{accounts.get(i.accountId)}</TD>
                  <TD className="text-muted">{formatDate(i.issuedAt)}</TD>
                  <TD className="text-muted">{formatDate(i.dueAt)}</TD>
                  <TD className="font-medium">{formatCents(invoiceTotalCents(i))}</TD>
                  <TD>
                    <InvoiceStatusBadge status={i.status} overdue={isOverdue(i, now)} />
                  </TD>
                  <TD className="text-right">
                    {i.status === "unpaid" || i.status === "pending_verification" ? (
                      <div className="flex justify-end gap-2">
                        <ActionButton action={setInvoiceStatus} fields={{ invoiceId: i.id, event: "mark_paid" }} label="Mark paid" confirm={`Mark ${i.number} as paid?`} />
                        {i.status === "unpaid" ? <ActionButton action={setInvoiceStatus} fields={{ invoiceId: i.id, event: "void" }} label="Void" variant="ghost" confirm={`Void ${i.number}? This can't be undone.`} /> : null}
                      </div>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>New invoice</CardTitle>
            <CardDescription>The client is notified in the dashboard and by email. Amounts in USD.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <FormShell action={createInvoice} submitLabel="Create and send" pendingLabel="Creating…" resetOnSuccess>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Client" htmlFor="inv-account">
                <Select id="inv-account" name="accountId">
                  {store.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Due in (days)" htmlFor="dueInDays">
                <Input id="dueInDays" name="dueInDays" type="number" min={0} max={90} defaultValue={7} />
              </Field>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" name="recurring" className="size-4 accent-[var(--primary)]" /> Mark as renewal
              </label>
            </div>
            <fieldset className="grid gap-3">
              <legend className="mb-2 text-sm font-medium">Lines</legend>
              {[0, 1, 2].map((n) => (
                <div key={n} className="grid gap-3 sm:grid-cols-[1fr_160px]">
                  <Input name="lineDescription" aria-label={`Line ${n + 1} description`} placeholder={n === 0 ? "Migration of example.com" : "Optional line"} />
                  <Input name="lineAmount" aria-label={`Line ${n + 1} amount in USD`} type="number" min={0} step="0.01" placeholder="0.00" />
                </div>
              ))}
            </fieldset>
            <Field label="Note on invoice (optional)" htmlFor="notes">
              <Input id="notes" name="notes" />
            </Field>
          </FormShell>
        </CardContent>
      </Card>
    </>
  );
}
