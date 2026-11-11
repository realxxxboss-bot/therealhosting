"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function SettingsForm({
  siteId,
  name,
  primaryDomain,
  domains,
  action,
}: {
  siteId: string;
  name: string;
  primaryDomain: string;
  domains: string[];
  action: (p: FormState, f: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <input type="hidden" name="siteId" value={siteId} />
      <Field label="Site name" htmlFor="name" error={err.name}>
        <Input id="name" name="name" defaultValue={name} aria-invalid={Boolean(err.name)} />
      </Field>
      <Field label="Primary domain" htmlFor="primaryDomain" error={err.primaryDomain} hint="Used for links in the dashboard and alerts.">
        <Select id="primaryDomain" name="primaryDomain" defaultValue={primaryDomain}>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {state.message ? (
          <p role="status" className={cn("text-sm", state.ok ? "text-success" : "text-danger")}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
