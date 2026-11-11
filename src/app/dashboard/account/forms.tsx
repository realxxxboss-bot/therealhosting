"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Action = (p: FormState, f: FormData) => Promise<FormState>;

function Status({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={cn("text-sm", state.ok ? "text-success" : "text-danger")}>
      {state.message}
    </p>
  );
}

export function ProfileForm({ name, email, action }: { name: string; email: string; action: Action }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Full name" htmlFor="profile-name" error={state.errors?.name}>
        <Input id="profile-name" name="name" defaultValue={name} autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="profile-email" hint="To change your sign-in email, contact support.">
        <Input id="profile-email" value={email} readOnly disabled />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function TwoFactorToggle({ enabled, action }: { enabled: boolean; action: Action }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const [setup, setSetup] = useState(false);
  if (enabled) {
    return (
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="enable" value="false" />
        <Button type="submit" variant="secondary" disabled={pending}>
          Turn off 2FA
        </Button>
        <Status state={state} />
      </form>
    );
  }
  if (!setup) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setSetup(true)}>Set up 2FA</Button>
        <Status state={state} />
      </div>
    );
  }
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="enable" value="true" />
      <ol className="grid gap-1 text-sm text-muted">
        <li>1. Open an authenticator app (for example 1Password, Google Authenticator or Authy).</li>
        <li>2. Add an account with this setup key: <code className="font-mono text-foreground">DEMO-ZAFF-RE2F-A000</code></li>
        <li>3. Enter the 6-digit code it shows.</li>
      </ol>
      <Field label="6-digit code" htmlFor="totp-code" error={state.errors?.code}>
        <Input id="totp-code" name="code" inputMode="numeric" autoComplete="one-time-code" className="max-w-40 font-mono tracking-widest" />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Turn on
        </Button>
        <Button variant="ghost" onClick={() => setSetup(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
