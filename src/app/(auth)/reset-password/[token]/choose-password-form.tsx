"use client";

import { useActionState } from "react";
import { choosePassword } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { initialFormState } from "@/lib/forms";

export function ChoosePasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(choosePassword, initialFormState);
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <input type="hidden" name="token" value={token} />
      <Field label="New password" htmlFor="password" hint="At least 10 characters. A few random words work well." error={state.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" className="h-12 text-base" minLength={10} required aria-invalid={Boolean(state.errors?.password)} />
      </Field>
      <Field label="New password again" htmlFor="confirm" error={state.errors?.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" className="h-12 text-base" required aria-invalid={Boolean(state.errors?.confirm)} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}
