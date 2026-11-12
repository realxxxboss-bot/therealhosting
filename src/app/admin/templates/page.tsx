import type { Metadata } from "next";
import { requestTime } from "@/lib/request";
import { getAdmin } from "@/lib/auth/viewer";
import { loadAdminStore } from "@/lib/data/admin";
import { outbox } from "@/lib/adapters/mock/messages";
import { saveEmailTemplate } from "@/app/actions/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
import { FormShell } from "@/components/app/form-shell";
import { formatDateTime, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Email templates" };

export default async function TemplatesPage() {
  const now = await requestTime();
  await getAdmin();
  const templates = (await loadAdminStore()).emailTemplates;
  return (
    <>
      <PageHeader title="Email templates" description="Words used in automatic emails. Use {{placeholders}} like {{user.name}} or {{invoice.number}}." />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid content-start gap-6">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <div>
                  <CardTitle>{t.name}</CardTitle>
                  <CardDescription>Last changed {formatDateTime(t.updatedAt)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <FormShell action={saveEmailTemplate} submitLabel="Save template">
                  <input type="hidden" name="templateId" value={t.id} />
                  <Field label="Subject" htmlFor={`${t.id}-subject`}>
                    <Input id={`${t.id}-subject`} name="subject" defaultValue={t.subject} />
                  </Field>
                  <Field label="Body" htmlFor={`${t.id}-body`}>
                    <Textarea id={`${t.id}-body`} name="body" rows={6} defaultValue={t.body} />
                  </Field>
                </FormShell>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="self-start">
          <CardHeader>
            <div>
              <CardTitle>Outbox</CardTitle>
              <CardDescription>In demo mode, emails and WhatsApp messages are recorded here instead of being sent.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {outbox.length === 0 ? (
              <p className="text-sm text-muted">Nothing sent since the server started.</p>
            ) : (
              <ol className="grid gap-3">
                {outbox.map((m) => (
                  <li key={m.id} className="rounded-[8px] border border-border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge tone="primary" label={m.channel === "email" ? "Email" : "WhatsApp"} />
                      <span className="text-xs text-muted">{formatRelative(m.at, now)}</span>
                    </div>
                    <p className="mt-2 truncate font-medium">{m.subject ?? m.body.slice(0, 60)}</p>
                    <p className="truncate text-xs text-muted">To {m.to}</p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
