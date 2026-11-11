"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "danger";

/**
 * A one-click action form (redeploy, restart, mark read …). The result appears as a toast,
 * so the button row never changes size.
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
  const toast = useToast();
  useEffect(() => {
    if (state.message) toast({ message: state.message, tone: state.ok ? "success" : "danger" });
  }, [state, toast]);
  return (
    <form
      action={formAction}
      className={cn("inline-flex", className)}
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
    </form>
  );
}
