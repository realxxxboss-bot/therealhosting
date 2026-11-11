import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Mail } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { hasCapability, listDomains, listMailboxes } from "@/lib/data/client";
import { getAdapters } from "@/lib/adapters";
import { createMailbox, resetMailboxPassword } from "@/app/actions/account";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { ActionButton } from "@/components/app/action-button";
import { DnsRecordsTable } from "@/components/app/dns-records";
import { StatusBadge } from "@/components/ui/badge";
import { MailboxForm } from "./mailbox-form";

export const metadata: Metadata = { title: "Email" };

export default async function EmailPage() {
  const viewer = await getViewer();
  if (!hasCapability(viewer, "email:manage")) notFound();
  const mailboxes = listMailboxes(viewer);
  const adapters = getAdapters();
  const mailDomains = [...new Set(mailboxes.map((m) => m.domain))];
  const domainOptions = listDomains(viewer)
    .filter((d) => d.status === "active" && !d.redirectTo)
    .map((d) => d.hostname);
  const dnsByDomain = await Promise.all(mailDomains.map(async (d) => ({ domain: d, checks: await adapters.mailboxes.dnsStatus(d) })));

  return (
    <>
      <PageHeader
        title="Email"
        description="Professional mailboxes on your own domains."
        actions={
          <a href={adapters.mailboxes.webmailUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-2">
            Open webmail <ExternalLink className="size-4" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        }
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Create a mailbox</CardTitle>
              <CardDescription>We&apos;ll email you a secure link to set the password. We never send passwords by email.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MailboxForm domains={domainOptions} action={createMailbox} />
          </CardContent>
        </Card>
        <Card>
          {mailboxes.length === 0 ? (
            <EmptyState icon={Mail} title="No mailboxes yet" body="Create your first mailbox above." />
          ) : (
            <Table>
              <caption className="sr-only">Mailboxes</caption>
              <THead>
                <tr>
                  <TH>Address</TH>
                  <TH>Storage</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </THead>
              <tbody>
                {mailboxes.map((m) => (
                  <TR key={m.id}>
                    <TD className="font-mono text-xs font-semibold">{m.address}</TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuemin={0} aria-valuemax={m.quotaGb} aria-valuenow={m.usedGb} aria-label={`${m.address} storage used`}>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (m.usedGb / m.quotaGb) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-muted">
                          {m.usedGb} / {m.quotaGb} GB
                        </span>
                      </div>
                    </TD>
                    <TD className="text-right">
                      <ActionButton action={resetMailboxPassword} fields={{ mailboxId: m.id }} label="Reset password" variant="ghost" className="items-end" />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        {dnsByDomain.map(({ domain, checks }) => (
          <Card key={domain}>
            <CardHeader>
              <div>
                <CardTitle className="font-mono text-[15px]">{domain}</CardTitle>
                <CardDescription>Email DNS records. All must be found for reliable delivery.</CardDescription>
              </div>
              {checks.every((c) => c.ok) ? <StatusBadge tone="success" label="All records found" /> : <StatusBadge tone="warning" label="Action needed" />}
            </CardHeader>
            <CardContent>
              <DnsRecordsTable records={checks.map((c) => c.record)} status={checks.map((c) => c.ok)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
