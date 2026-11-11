"use client";

import { useActionState, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/forms";
import { cn } from "@/lib/utils";

/**
 * Generic form wrapper for admin screens: runs a server action, shows field errors as a list
 * and the result message. Inputs are passed as children so pages stay server components.
 */
export function FormShell({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  resetOnSuccess = false,
  className,
  variant = "primary",
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    const result = await action(prev, fd);
    if (result.ok && resetOnSuccess) formRef.current?.reset();
    return result;
  }, { ok: false });
  const errors = state.errors ? Object.values(state.errors) : [];
  return (
    <form ref={formRef} action={formAction} className={cn("grid gap-4", className)} noValidate>
      {children}
      {errors.length > 0 ? (
        <ul role="alert" className="grid gap-1 rounded-[4px] bg-danger-soft px-3 py-2 text-sm text-danger">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant={variant} disabled={pending}>
          {pending ? pendingLabel : submitLabel}
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
