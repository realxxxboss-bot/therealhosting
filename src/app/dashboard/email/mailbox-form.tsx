"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function MailboxForm({ domains, action }: { domains: string[]; action: (p: FormState, f: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const error = state.errors?.local ?? state.errors?.domain ?? (!state.ok ? state.message : undefined);
  return (
    <form action={formAction} className="grid gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="local" className="sr-only">
          Mailbox name
        </label>
        <Input id="local" name="local" placeholder="info" className="font-mono sm:max-w-48" aria-invalid={Boolean(error)} autoComplete="off" />
        <span className="hidden text-muted sm:inline" aria-hidden>
          @
        </span>
        <label htmlFor="domain" className="sr-only">
          Domain
        </label>
        <Select id="domain" name="domain" className="font-mono sm:max-w-72">
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create mailbox"}
        </Button>
      </div>
      <p role="status" className={cn("text-sm", error ? "text-danger" : "text-success")}>
        {error ?? (state.ok ? state.message : "")}
      </p>
    </form>
  );
}
