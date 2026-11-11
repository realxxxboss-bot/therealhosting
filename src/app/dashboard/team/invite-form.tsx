"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function InviteForm({
  sites,
  roles,
  action,
}: {
  sites: { id: string; name: string }[];
  roles: { value: string; label: string; description: string }[];
  action: (p: FormState, f: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const [role, setRole] = useState("developer");
  const [scope, setScope] = useState<"all" | "selected">("selected");
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="grid gap-5">
      <Field label="Email" htmlFor="invite-email" error={err.email} className="max-w-md">
        <Input id="invite-email" name="email" type="email" placeholder="developer@example.com" aria-invalid={Boolean(err.email)} />
      </Field>
      <fieldset>
        <legend className="text-sm font-medium">Role</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {roles.map((r) => (
            <label key={r.value} className={cn("cursor-pointer rounded-[8px] border p-3 text-sm transition-colors", role === r.value ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-2")}>
              <span className="flex items-center gap-2 font-medium">
                <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="accent-[var(--primary)]" />
                {r.label}
              </span>
              <span className="mt-1 block text-xs text-muted">{r.description}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {role === "developer" ? (
        <fieldset>
          <legend className="text-sm font-medium">Site access</legend>
          <div className="mt-2 flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="scope" value="selected" checked={scope === "selected"} onChange={() => setScope("selected")} /> Only selected sites
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="scope" value="all" checked={scope === "all"} onChange={() => setScope("all")} /> All sites
            </label>
          </div>
          {scope === "selected" ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((s) => (
                <label key={s.id} className="flex items-center gap-2 rounded-[4px] border border-border px-3 py-2 text-sm">
                  <input type="checkbox" name="siteIds" value={s.id} /> {s.name}
                </label>
              ))}
            </div>
          ) : null}
          {err.siteIds ? <p className="mt-2 text-sm text-danger">{err.siteIds}</p> : null}
        </fieldset>
      ) : (
        <input type="hidden" name="scope" value="all" />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send invite"}
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
