"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function RestoreForm({ siteId, backupId, action }: { siteId: string; backupId: string; action: (p: FormState, f: FormData) => Promise<FormState> }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, { ok: false });
  if (state.ok) return <p className="text-xs text-success" role="status">{state.message}</p>;
  if (!open)
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Request restore
      </Button>
    );
  return (
    <form action={formAction} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="backupId" value={backupId} />
      <label htmlFor={`note-${backupId}`} className="sr-only">
        Note for our team
      </label>
      <Input id={`note-${backupId}`} name="note" placeholder="Anything we should know? (optional)" className="h-8 w-56 text-xs" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Sending…" : "Confirm"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {state.message ? <p className="w-full text-xs text-danger">{state.message}</p> : null}
    </form>
  );
}
