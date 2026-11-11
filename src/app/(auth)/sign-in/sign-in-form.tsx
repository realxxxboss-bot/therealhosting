"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const err = state.errors ?? {};
  return (
    <form action={action} className="mt-6 grid gap-4" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Email" htmlFor="email" error={err.email}>
        <Input id="email" name="email" type="email" autoComplete="username" defaultValue="owner@ukclient.example" required aria-invalid={Boolean(err.email)} />
      </Field>
      <Field label="Password" htmlFor="password" error={err.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(err.password)} />
      </Field>
      <div className="flex items-center justify-between text-sm">
        <span />
        <Link href="/reset-password" className="text-primary underline-offset-4 hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
