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

export function PasswordForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  return (
    <form action={formAction} className="grid gap-4" key={state.ok ? "done" : "form"}>
      <Field label="Current password" htmlFor="pw-current" error={state.errors?.current}>
        <Input id="pw-current" name="current" type="password" autoComplete="current-password" required aria-invalid={Boolean(state.errors?.current)} />
      </Field>
      <Field label="New password" htmlFor="pw-new" hint="At least 10 characters. A few random words work well." error={state.errors?.password}>
        <Input id="pw-new" name="password" type="password" autoComplete="new-password" minLength={10} required aria-invalid={Boolean(state.errors?.password)} />
      </Field>
      <Field label="New password again" htmlFor="pw-confirm" error={state.errors?.confirm}>
        <Input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" required aria-invalid={Boolean(state.errors?.confirm)} />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </Button>
        <Status state={state} />
      </div>
    </form>
  );
}

type SetupState = FormState & { secret?: string; uri?: string };

export function TwoFactorToggle({ enabled, action, startSetup, sampleHint }: { enabled: boolean; action: Action; startSetup: () => Promise<SetupState>; sampleHint?: string }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const [setup, startAction, starting] = useActionState<SetupState>(async () => startSetup(), { ok: false });
  const [open, setOpen] = useState(false);

  if (enabled) {
    return (
      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="enable" value="false" />
        <Field label="6-digit code" htmlFor="totp-off" hint={sampleHint ?? "Enter a current code from your app to turn two-factor off."} error={state.errors?.code}>
          <Input id="totp-off" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} className="max-w-40 font-mono tracking-widest" aria-invalid={Boolean(state.errors?.code)} />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="secondary" disabled={pending}>
            Turn off 2FA
          </Button>
          <Status state={state} />
        </div>
      </form>
    );
  }
  if (!open || !setup.secret) {
    return (
      <form action={startAction} onSubmit={() => setOpen(true)} className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={starting}>
          {starting ? "Preparing…" : "Set up 2FA"}
        </Button>
        <Status state={setup.ok ? state : setup} />
      </form>
    );
  }
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="enable" value="true" />
      <ol className="grid gap-2 text-sm text-muted">
        <li>1. Open an authenticator app (for example 1Password, Google Authenticator or Authy).</li>
        <li>
          2. Add an account and type in this setup key:
          <code className="mt-1.5 block w-fit rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-[0.9375rem] text-foreground select-all">{setup.secret}</code>
          {setup.uri ? (
            <a href={setup.uri} className="link mt-1.5 inline-block">
              Or open it in an app on this device
            </a>
          ) : null}
        </li>
        <li>3. Enter the 6-digit code the app shows.</li>
      </ol>
      <Field label="6-digit code" htmlFor="totp-code" error={state.errors?.code}>
        <Input id="totp-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} className="max-w-40 font-mono tracking-widest" aria-invalid={Boolean(state.errors?.code)} />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pending}>
          Turn on
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Status state={state} />
      </div>
    </form>
  );
}
