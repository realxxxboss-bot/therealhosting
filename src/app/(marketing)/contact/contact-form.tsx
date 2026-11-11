"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { submitContact } from "@/app/actions/public";
import { initialFormState } from "@/lib/forms";
import { getPlan } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

const topics = [
  { value: "sales", label: "New hosting" },
  { value: "migration", label: "Free migration" },
  { value: "support", label: "Help with my site" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialFormState);
  const params = useSearchParams();
  const plan = getPlan(params.get("plan") ?? "");
  const cycle = params.get("cycle") === "yearly" ? "yearly" : "monthly";
  const topicParam = params.get("topic");
  const defaultTopic = topics.some((t) => t.value === topicParam) ? (topicParam ?? "sales") : "sales";
  const defaultMessage = plan ? `I'm interested in ${plan.name} (${cycle}).` : "";

  if (state.ok) {
    return (
      <div role="status" className="border-y border-foreground py-10">
        <p className="text-[2rem] leading-tight font-semibold tracking-[-0.03em]">Message sent.</p>
        <p className="mt-3 max-w-md text-lg text-muted">{state.message}</p>
      </div>
    );
  }

  const err = state.errors ?? {};
  return (
    <form action={action} className="grid gap-6" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" error={err.name}>
          <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(err.name)} />
        </Field>
        <Field label="Email" htmlFor="email" error={err.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(err.email)} />
        </Field>
        <Field label="Company (optional)" htmlFor="company">
          <Input id="company" name="company" autoComplete="organization" />
        </Field>
        <Field label="Topic" htmlFor="topic">
          <Select id="topic" name="topic" defaultValue={defaultTopic}>
            {topics.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Your sites (optional)" htmlFor="sites" hint="Domains and where they are hosted today, for example: example.com on a Next.js platform.">
        <Input id="sites" name="sites" />
      </Field>
      <Field label="Message" htmlFor="message" error={err.message}>
        <Textarea id="message" name="message" defaultValue={defaultMessage} required aria-invalid={Boolean(err.message)} />
      </Field>
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
