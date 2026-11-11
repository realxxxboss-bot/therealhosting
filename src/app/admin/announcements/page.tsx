import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth/viewer";
import { db } from "@/lib/data/store";
import { saveAnnouncement } from "@/app/actions/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Field, Select, Textarea } from "@/components/ui/field";
import { FormShell } from "@/components/app/form-shell";

export const metadata: Metadata = { title: "Announcement" };

export default async function AnnouncementPage() {
  await getAdmin();
  const a = db().announcement;
  return (
    <>
      <PageHeader title="Announcement" description="A banner at the top of every client dashboard. Use it for planned maintenance or important news." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <FormShell action={saveAnnouncement} submitLabel="Save">
              <Field label="Message" htmlFor="message">
                <Textarea id="message" name="message" rows={3} defaultValue={a.message} maxLength={300} />
              </Field>
              <Field label="Tone" htmlFor="tone">
                <Select id="tone" name="tone" defaultValue={a.tone}>
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="enabled" defaultChecked={a.enabled} className="size-4 accent-[var(--primary)]" /> Show to clients now
              </label>
            </FormShell>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Preview</CardTitle>
              <CardDescription>{a.enabled ? "Live now." : "Hidden from clients."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Alert tone={a.tone}>{a.message}</Alert>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
