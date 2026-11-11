"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/forms";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "danger";

/**
 * A one-click action form (redeploy, restart, mark read …) that shows its result inline.
 * Hidden fields carry the ids; the server action re-checks permissions.
 */
export function ActionButton({
  action,
  fields,
  label,
  pendingLabel,
  variant = "secondary",
  size = "sm",
  confirm,
  className,
  icon,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  variant?: Variant;
  size?: "sm" | "md";
  confirm?: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  return (
    <form
      action={formAction}
      className={cn("inline-flex flex-col items-start gap-1", className)}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <Button type="submit" variant={variant} size={size} disabled={pending}>
        {icon}
        {pending ? (pendingLabel ?? "Working…") : label}
      </Button>
      {state.message ? (
        <p role="status" className={cn("text-xs", state.ok ? "text-success" : "text-danger")}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
