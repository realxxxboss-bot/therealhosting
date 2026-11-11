import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { savePaymentMethod, togglePaymentMethod } from "@/app/actions/admin";
import type { PaymentMethod } from "@/lib/data/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormShell } from "@/components/app/form-shell";
import { ActionButton } from "@/components/app/action-button";

export const metadata: Metadata = { title: "Payment methods" };

function MethodForm({ method }: { method?: PaymentMethod }) {
  const p = method?.id ?? "new";
  return (
    <FormShell action={savePaymentMethod} submitLabel={method ? "Save" : "Add method"} resetOnSuccess={!method}>
      {method ? <input type="hidden" name="methodId" value={method.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label" htmlFor={`${p}-label`}>
          <Input id={`${p}-label`} name="label" defaultValue={method?.label} />
        </Field>
        <Field label="Kind" htmlFor={`${p}-kind`}>
          <Select id={`${p}-kind`} name="kind" defaultValue={method?.kind ?? "bank_transfer"}>
            <option value="bank_transfer">Bank transfer</option>
            <option value="wise">Wise</option>
            <option value="other">Other</option>
          </Select>
        </Field>
      </div>
      <Field label="Instructions shown to the client" htmlFor={`${p}-instructions`}>
        <Input id={`${p}-instructions`} name="instructions" defaultValue={method?.instructions} />
      </Field>
      <Field label="Details, one per line as Label: value" htmlFor={`${p}-fields`} hint="Example: IBAN: XX00 0000 0000 0000">
        <Textarea id={`${p}-fields`} name="fields" rows={4} className="font-mono text-xs" defaultValue={method?.fields.map((f) => `${f.label}: ${f.value}`).join("\n")} />
      </Field>
    </FormShell>
  );
}

export default async function PaymentMethodsPage() {
  await getAdmin();
  const methods = db().paymentMethods;
  return (
    <>
      <PageHeader title="Payment methods" description="What clients see on the Pay screen." />
      <Alert tone="warning" title="Demo values" className="mb-6">
        These are placeholders. Put your real bank and Wise details here once the accounts are open (see OWNER-ACTIONS). Card payments arrive when a registered company is in place.
      </Alert>
      <div className="grid gap-6">
        {methods.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle>{m.label}</CardTitle>
              <div className="flex items-center gap-2">
                <StatusBadge tone={m.enabled ? "success" : "neutral"} label={m.enabled ? "Shown to clients" : "Hidden"} />
                <ActionButton action={togglePaymentMethod} fields={{ methodId: m.id }} label={m.enabled ? "Hide" : "Show"} variant="ghost" />
              </div>
            </CardHeader>
            <CardContent>
              <MethodForm method={m} />
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Add a method</CardTitle>
              <CardDescription>New methods are shown to clients straight away.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MethodForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
