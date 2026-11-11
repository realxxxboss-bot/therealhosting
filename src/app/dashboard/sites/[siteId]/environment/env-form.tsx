"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function EnvForm({ siteId, action }: { siteId: string; action: (p: FormState, f: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto_auto] md:items-end">
      <input type="hidden" name="siteId" value={siteId} />
      <Field label="Key" htmlFor="env-key" error={err.key}>
        <Input id="env-key" name="key" placeholder="API_KEY" className="font-mono uppercase" autoComplete="off" aria-invalid={Boolean(err.key)} />
      </Field>
      <Field label="Value" htmlFor="env-value" error={err.value}>
        <Input id="env-value" name="value" type="password" className="font-mono" autoComplete="off" aria-invalid={Boolean(err.value)} />
      </Field>
      <Field label="Environment" htmlFor="env-target">
        <Select id="env-target" name="target" defaultValue="all">
          <option value="all">All</option>
          <option value="production">Production</option>
          <option value="preview">Preview</option>
        </Select>
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.message ? (
        <p role="status" className={cn("text-sm md:col-span-4", state.ok ? "text-success" : "text-danger")}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function MaskedValue({ value, label, reveal }: { value: string; label: string; reveal: boolean }) {
  const [shown, setShown] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <code className="font-mono text-xs">{shown ? value : "•".repeat(Math.min(16, Math.max(8, value.length)))}</code>
      {reveal ? (
        <button type="button" onClick={() => setShown((s) => !s)} className="grid size-7 place-items-center rounded-[4px] text-muted hover:bg-surface-2 hover:text-foreground" aria-label={shown ? `Hide ${label}` : `Show ${label}`}>
          {shown ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
        </button>
      ) : null}
    </span>
  );
}
