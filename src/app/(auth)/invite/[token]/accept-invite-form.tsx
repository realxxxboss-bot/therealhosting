"use client";

import Link from "next/link";
import { useActionState } from "react";
import { acceptInvite } from "@/app/actions/team";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { initialFormState } from "@/lib/forms";

export function AcceptInviteForm({ token, hasAccount }: { token: string; hasAccount: boolean }) {
  const [state, action, pending] = useActionState(acceptInvite, initialFormState);
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <input type="hidden" name="token" value={token} />
      {hasAccount ? (
        <p className="text-[0.9375rem] text-muted">You already have a Zaffre sign-in with this email. Accept, then sign in as usual.</p>
      ) : (
        <>
          <Field label="Your name" htmlFor="name" error={state.errors?.name}>
            <Input id="name" name="name" autoComplete="name" className="h-12 text-base" required aria-invalid={Boolean(state.errors?.name)} />
          </Field>
          <Field label="Choose a password" htmlFor="password" hint="At least 10 characters. A few random words work well." error={state.errors?.password}>
            <Input id="password" name="password" type="password" autoComplete="new-password" className="h-12 text-base" minLength={10} required aria-invalid={Boolean(state.errors?.password)} />
          </Field>
        </>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Joining…" : "Accept invite"}
      </Button>
      <p className="text-sm text-muted">
        By accepting, you agree to our{" "}
        <Link href="/legal/terms" className="underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and confirm you have read our{" "}
        <Link href="/legal/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
