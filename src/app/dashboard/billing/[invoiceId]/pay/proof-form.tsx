"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export function ProofForm({ invoiceId, methods, action }: { invoiceId: string; methods: { id: string; label: string }[]; action: (p: FormState, f: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="grid max-w-xl gap-4" encType="multipart/form-data">
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <Field label="How did you pay?" htmlFor="methodId" error={err.methodId}>
        <Select id="methodId" name="methodId" defaultValue={methods[0]?.id}>
          {methods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Transfer reference" htmlFor="reference" error={err.reference} hint="The transaction ID from your bank or Wise receipt.">
        <Input id="reference" name="reference" className="font-mono" autoComplete="off" aria-invalid={Boolean(err.reference)} />
      </Field>
      <Field label="Proof of payment" htmlFor="proof" error={err.proof}>
        <Input id="proof" name="proof" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary" aria-invalid={Boolean(err.proof)} />
      </Field>
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Uploading…" : "Submit payment proof"}
        </Button>
      </div>
    </form>
  );
}
