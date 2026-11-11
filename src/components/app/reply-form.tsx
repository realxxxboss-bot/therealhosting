"use client";

import { useActionState, useRef } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function ReplyForm({
  ticketId,
  action,
  placeholder,
  withAttachments = true,
  submitLabel = "Send reply",
}: {
  ticketId: string;
  action: (p: FormState, f: FormData) => Promise<FormState>;
  placeholder: string;
  withAttachments?: boolean;
  submitLabel?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    const result = await action(prev, fd);
    if (result.ok) formRef.current?.reset();
    return result;
  }, { ok: false });
  const error = state.errors?.body ?? state.errors?.attachments ?? (!state.ok ? state.message : undefined);
  return (
    <form ref={formRef} action={formAction} className="grid gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <label htmlFor="reply-body" className="text-sm font-medium">
        Reply
      </label>
      <Textarea id="reply-body" name="body" rows={4} placeholder={placeholder} aria-invalid={Boolean(error)} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {withAttachments ? (
          <div>
            <label htmlFor="reply-files" className="sr-only">
              Attachments
            </label>
            <Input id="reply-files" name="attachments" type="file" multiple accept="image/png,image/jpeg,image/webp,application/pdf" className="h-auto max-w-xs py-1.5 text-xs" />
          </div>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : submitLabel}
        </Button>
      </div>
      <p role="status" className={cn("text-sm", error ? "text-danger" : "text-success")}>
        {error ?? (state.ok ? state.message : "")}
      </p>
    </form>
  );
}
