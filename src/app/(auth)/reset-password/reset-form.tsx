"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export function ResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialFormState);
  if (state.ok) return <Alert tone="success" className="mt-6">{state.message}</Alert>;
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Email" htmlFor="email" error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" className="h-12 text-base" required aria-invalid={Boolean(state.errors?.email)} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
