import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/auth/viewer";
import { loadAdminStore } from "@/lib/data/admin";
import { createSite, linkSite, moveSite } from "@/app/actions/admin";
import { getPlan } from "@/config/plans";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { FormShell } from "@/components/app/form-shell";
import { SiteStatusBadge } from "@/components/app/status";
import { siteTypeLabel } from "@/components/app/site-type";

export const metadata: Metadata = { title: "Sites" };

export default async function AdminSitesPage() {
  await getAdmin();
  const store = await loadAdminStore();
  const accounts = new Map(store.accounts.map((a) => [a.id, a]));

  return (
    <>
      <PageHeader title="Sites" description="Every hosted site across all clients." />
      <Card>
        <CardContent className="px-0 py-0">
          <Table>
            <caption className="sr-only">All sites</caption>
            <THead>
              <tr>
                <TH>Site</TH>
                <TH>Client</TH>
                <TH>Type</TH>
                <TH>Package</TH>
                <TH>Status</TH>
                <TH>Server</TH>
                <TH>Server app</TH>
              </tr>
            </THead>
            <tbody>
              {store.sites.map((s) => {
                const sub = store.subscriptions.find((x) => x.id === s.subscriptionId);
                return (
                  <TR key={s.id}>
                    <TD>
                      <span className="font-medium">{s.name}</span>
                      <span className="block font-mono text-xs text-muted">{s.primaryDomain}</span>
                    </TD>
                    <TD>
                      <Link href={`/admin/clients/${s.accountId}`} className="text-primary hover:underline">
                        {accounts.get(s.accountId)?.name}
                      </Link>
                    </TD>
                    <TD className="text-muted">{siteTypeLabel(s.type)}</TD>
                    <TD className="text-muted">{sub ? getPlan(sub.planId)?.name : "—"}</TD>
                    <TD>
                      <SiteStatusBadge status={s.status} />
                    </TD>
                    <TD>
                      <FormShell action={moveSite} submitLabel="Move" variant="secondary" className="flex flex-nowrap items-center gap-2">
                        <input type="hidden" name="siteId" value={s.id} />
                        <label htmlFor={`srv-${s.id}`} className="sr-only">
                          Server for {s.name}
                        </label>
                        <select id={`srv-${s.id}`} name="serverId" defaultValue={s.serverId} className="rounded-[8px] border border-border bg-surface px-2 py-1 text-sm">
                          {store.servers.map((srv) => (
                            <option key={srv.id} value={srv.id}>
                              {srv.name}
                            </option>
                          ))}
                        </select>
                      </FormShell>
                    </TD>
                    <TD>
                      <FormShell action={linkSite} submitLabel="Link" variant="secondary" className="flex flex-nowrap items-center gap-2">
                        <input type="hidden" name="siteId" value={s.id} />
                        <label htmlFor={`app-${s.id}`} className="sr-only">
                          Coolify application uuid for {s.name}
                        </label>
                        <input
                          id={`app-${s.id}`}
                          name="deployRef"
                          defaultValue={s.deployRef ?? ""}
                          placeholder="Coolify app uuid"
                          className="w-40 rounded-[8px] border border-border bg-surface px-2 py-1 font-mono text-xs"
                        />
                      </FormShell>
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Create a site</CardTitle>
            <CardDescription>The site must fit in one of the client&apos;s packages. Its first deploy starts straight away.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <FormShell action={createSite} submitLabel="Create site" pendingLabel="Creating…" resetOnSuccess>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Client" htmlFor="accountId">
                <Select id="accountId" name="accountId">
                  {store.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Package" htmlFor="subscriptionId" hint="Grouped by client.">
                <Select id="subscriptionId" name="subscriptionId">
                  {store.accounts.map((a) => (
                    <optgroup key={a.id} label={a.name}>
                      {store.subscriptions
                        .filter((s) => s.accountId === a.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {getPlan(s.planId)?.name} ({store.sites.filter((x) => x.subscriptionId === s.id).length}/{getPlan(s.planId)?.sites})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </Select>
              </Field>
              <Field label="Type" htmlFor="type">
                <Select id="type" name="type">
                  <option value="nextjs">Next.js</option>
                  <option value="wordpress">WordPress</option>
                  <option value="static">Static</option>
                </Select>
              </Field>
              <Field label="Site name" htmlFor="site-name">
                <Input id="site-name" name="name" />
              </Field>
              <Field label="Primary domain" htmlFor="primaryDomain">
                <Input id="primaryDomain" name="primaryDomain" placeholder="example.com" />
              </Field>
              <Field label="Server" htmlFor="serverId">
                <Select id="serverId" name="serverId">
                  {store.servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.region})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Git repository (optional)" htmlFor="repo" hint="owner/name">
                <Input id="repo" name="repo" />
              </Field>
            </div>
          </FormShell>
        </CardContent>
      </Card>
    </>
  );
}
