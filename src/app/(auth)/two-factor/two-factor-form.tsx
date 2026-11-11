"use client";

import { useActionState } from "react";
import { verifyTwoFactor } from "@/app/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export function TwoFactorForm() {
  const [state, action, pending] = useActionState(verifyTwoFactor, initialFormState);
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Authentication code" htmlFor="code" error={state.errors?.code}>
        <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} className="h-14 font-mono text-2xl tracking-[0.35em]" required aria-invalid={Boolean(state.errors?.code)} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Checking…" : "Verify"}
      </Button>
    </form>
  );
}
