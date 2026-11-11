"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function AddDomainForm({ siteId, action }: { siteId: string; action: Action }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const error = state.errors?.hostname ?? state.errors?.form ?? (!state.ok ? state.message : undefined);
  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="siteId" value={siteId} />
      <label htmlFor="hostname" className="text-sm font-medium">
        Domain name
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input id="hostname" name="hostname" placeholder="www.yourdomain.com" className="font-mono" aria-invalid={Boolean(error)} aria-describedby="hostname-msg" autoComplete="off" />
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add domain"}
        </Button>
      </div>
      <p id="hostname-msg" role="status" className={cn("text-sm", error ? "text-danger" : "text-success")}>
        {error ?? (state.ok ? state.message : "")}
      </p>
    </form>
  );
}

export function RedirectForm({ siteId, domainId, options, current, action }: { siteId: string; domainId: string; options: string[]; current: string; action: Action }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const id = `redirect-${domainId}`;
  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="domainId" value={domainId} />
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm text-muted">
          Redirect to
        </label>
        <Select id={id} name="redirectTo" defaultValue={current} className="h-8 w-auto text-xs">
          <option value="">No redirect</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          Save
        </Button>
      </div>
      {state.message ? (
        <p role="status" className={cn("text-xs", state.ok ? "text-success" : "text-danger")}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
