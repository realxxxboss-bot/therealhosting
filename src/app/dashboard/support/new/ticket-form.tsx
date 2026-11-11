"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export function TicketForm({
  sites,
  defaultSiteId,
  defaultSubject,
  action,
}: {
  sites: { id: string; name: string }[];
  defaultSiteId: string;
  defaultSubject: string;
  action: (p: FormState, f: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="grid max-w-2xl gap-4">
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Subject" htmlFor="subject" error={err.subject}>
        <Input id="subject" name="subject" defaultValue={defaultSubject} aria-invalid={Boolean(err.subject)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Site" htmlFor="siteId">
          <Select id="siteId" name="siteId" defaultValue={defaultSiteId}>
            <option value="">General / not about one site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority" htmlFor="priority" hint="Urgent = site down or data at risk.">
          <Select id="priority" name="priority" defaultValue="normal">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
      </div>
      <Field label="Message" htmlFor="body" error={err.body}>
        <Textarea id="body" name="body" rows={7} aria-invalid={Boolean(err.body)} />
      </Field>
      <Field label="Attachments (optional)" htmlFor="attachments" error={err.attachments} hint="Up to 3 files: PNG, JPG, WebP or PDF, 5 MB each.">
        <Input id="attachments" name="attachments" type="file" multiple accept="image/png,image/jpeg,image/webp,application/pdf" className="h-auto py-2" />
      </Field>
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Open ticket"}
        </Button>
      </div>
    </form>
  );
}
