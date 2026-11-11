"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrefsForm({
  kinds,
  email,
  whatsapp,
  action,
}: {
  kinds: { key: string; label: string }[];
  email: Record<string, boolean>;
  whatsapp: Record<string, boolean>;
  action: (p: FormState, f: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  return (
    <form action={formAction}>
      <table className="w-full max-w-lg text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th scope="col" className="py-2 font-medium">Event</th>
            <th scope="col" className="py-2 text-center font-medium">Email</th>
            <th scope="col" className="py-2 text-center font-medium">WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {kinds.map((k) => (
            <tr key={k.key} className="border-t border-border">
              <th scope="row" className="py-2.5 text-left font-normal">{k.label}</th>
              <td className="text-center">
                <input type="checkbox" name={`email:${k.key}`} defaultChecked={email[k.key]} aria-label={`${k.label} by email`} className="size-4 accent-[var(--primary)]" />
              </td>
              <td className="text-center">
                <input type="checkbox" name={`whatsapp:${k.key}`} defaultChecked={whatsapp[k.key]} aria-label={`${k.label} by WhatsApp`} className="size-4 accent-[var(--primary)]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
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
