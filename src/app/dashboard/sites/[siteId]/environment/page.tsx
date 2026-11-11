import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getSite, hasCapability, listEnvVars } from "@/lib/data/client";
import { deleteEnvVar, upsertEnvVar } from "@/app/actions/sites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { ActionButton } from "@/components/app/action-button";
import { formatDateTime } from "@/lib/utils";
import { EnvForm, MaskedValue } from "./env-form";

export default async function EnvironmentPage({ params }: PageProps<"/dashboard/sites/[siteId]/environment">) {
  const { siteId } = await params;
  const viewer = await getViewer();
  const site = getSite(viewer, siteId);
  if (!site || site.type !== "nextjs") notFound();
  const vars = listEnvVars(viewer, site.id);
  const canManage = hasCapability(viewer, "sites:manage");
  return (
    <div className="grid gap-6">
      {canManage ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Add or update a variable</CardTitle>
              <CardDescription>Values are encrypted at rest, masked here and never printed in logs. Redeploy after changes.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <EnvForm siteId={site.id} action={upsertEnvVar} />
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <Table>
          <caption className="sr-only">Environment variables for {site.name}</caption>
          <THead>
            <tr>
              <TH>Key</TH>
              <TH>Value</TH>
              <TH>Environment</TH>
              <TH>Updated</TH>
              {canManage ? <TH className="text-right">Actions</TH> : null}
            </tr>
          </THead>
          <tbody>
            {vars.map((v) => (
              <TR key={v.id}>
                <TD className="font-mono text-xs font-semibold">{v.key}</TD>
                <TD>
                  <MaskedValue value={v.value} label={v.key} reveal={canManage} />
                </TD>
                <TD className="capitalize text-muted">{v.target === "all" ? "All" : v.target}</TD>
                <TD className="text-muted">{formatDateTime(v.updatedAt)}</TD>
                {canManage ? (
                  <TD className="text-right">
                    <ActionButton action={deleteEnvVar} fields={{ siteId: site.id, envId: v.id }} label="Delete" variant="ghost" confirm={`Delete ${v.key}?`} />
                  </TD>
                ) : null}
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
