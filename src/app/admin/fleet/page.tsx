import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth/viewer";
import { loadAdminStore } from "@/lib/data/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";
import { FormShell } from "@/components/app/form-shell";
import { removeServer, saveServer } from "@/app/actions/admin";
import { adapterMode } from "@/lib/adapters";
import type { Server } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Servers" };

function Meter({ label, pct }: { label: string; pct: number }) {
  const tone = pct >= 85 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface-2" role="meter" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-2 rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ServerFields({ server }: { server?: Server }) {
  const k = server?.id ?? "new";
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {server ? <input type="hidden" name="serverId" value={server.id} /> : null}
      <Field label="Name" htmlFor={`name-${k}`} hint="e.g. zaffre-eu-1">
        <Input id={`name-${k}`} name="name" defaultValue={server?.name} autoComplete="off" />
      </Field>
      <Field label="Location" htmlFor={`region-${k}`} hint="City and country">
        <Input id={`region-${k}`} name="region" defaultValue={server?.region} />
      </Field>
      <Field label="Public IP" htmlFor={`ip-${k}`}>
        <Input id={`ip-${k}`} name="ip" defaultValue={server?.ip} className="font-mono" autoComplete="off" />
      </Field>
      <Field label="Kind" htmlFor={`provider-${k}`}>
        <Select id={`provider-${k}`} name="provider" defaultValue={server?.provider ?? "vps"}>
          <option value="vps">Rented server (VPS or dedicated)</option>
          <option value="proxmox">Own hardware (Proxmox)</option>
        </Select>
      </Field>
      <Field label="vCPU" htmlFor={`vcpu-${k}`}>
        <Input id={`vcpu-${k}`} name="vcpu" type="number" min={1} defaultValue={server?.vcpu} />
      </Field>
      <Field label="RAM (GB)" htmlFor={`ram-${k}`}>
        <Input id={`ram-${k}`} name="ramGb" type="number" min={1} defaultValue={server?.ramGb} />
      </Field>
      <Field label="Disk (GB)" htmlFor={`disk-${k}`}>
        <Input id={`disk-${k}`} name="diskGb" type="number" min={10} defaultValue={server?.diskGb} />
      </Field>
    </div>
  );
}

export default async function FleetPage() {
  await getAdmin();
  const store = await loadAdminStore();
  // Usage meters are demo numbers. In live mode we show nothing until real server metrics are connected.
  const demo = adapterMode() === "mock";
  return (
    <>
      <PageHeader title="Servers" description={demo ? "Your servers and the sites on each. Usage numbers are demo data." : "Your servers and the sites on each."} />
      {store.servers.length === 0 ? <p className="mb-6 text-muted">No servers yet. Add the first one below once it is set up (docs/RUNBOOK-SERVER.md).</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        {store.servers.map((s) => {
          const sites = store.sites.filter((x) => x.serverId === s.id);
          return (
            <Card key={s.id}>
              <CardHeader>
                <div>
                  <CardTitle className="font-mono">{s.name}</CardTitle>
                  <CardDescription>
                    {s.region}, {s.vcpu} vCPU, {s.ramGb} GB RAM, {s.diskGb} GB disk, {s.ip}
                  </CardDescription>
                </div>
                <StatusBadge tone={s.status === "healthy" ? "success" : s.status === "warning" ? "warning" : "danger"} label={s.status === "healthy" ? "Healthy" : s.status === "warning" ? "Needs a look" : "Down"} />
              </CardHeader>
              <CardContent className="grid gap-3">
                {demo ? (
                  <>
                    <Meter label="CPU" pct={s.cpuPct} />
                    <Meter label="Memory" pct={s.ramPct} />
                    <Meter label="Disk" pct={s.diskPct} />
                  </>
                ) : (
                  <p className="text-sm text-muted">Usage is not measured yet.</p>
                )}
                <p className="pt-2 text-sm text-muted">
                  {sites.length} sites: {sites.map((x) => x.name).join(", ") || "none"}
                </p>
                <details className="border-t border-border pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-primary">Edit {s.name}</summary>
                  <div className="mt-4 grid gap-4">
                    <FormShell action={saveServer} submitLabel="Save server" variant="secondary">
                      <ServerFields server={s} />
                    </FormShell>
                    {sites.length === 0 ? (
                      <FormShell action={removeServer} submitLabel={`Remove ${s.name}`} pendingLabel="Removing…" variant="danger">
                        <input type="hidden" name="serverId" value={s.id} />
                      </FormShell>
                    ) : (
                      <p className="text-sm text-muted">To remove this server, move its sites to another one first (Sites page).</p>
                    )}
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Add a server</CardTitle>
            <CardDescription>Add it here once it is running Coolify. Sites can then be created on it or moved to it.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <FormShell action={saveServer} submitLabel="Add server" pendingLabel="Adding…" resetOnSuccess>
            <ServerFields />
          </FormShell>
        </CardContent>
      </Card>
    </>
  );
}
