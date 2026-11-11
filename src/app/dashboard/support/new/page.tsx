import type { Metadata } from "next";
import { getViewer } from "@/lib/auth/viewer";
import { listSites } from "@/lib/data/client";
import { createTicket } from "@/app/actions/support";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TicketForm } from "./ticket-form";

export const metadata: Metadata = { title: "New ticket" };

const topicSubjects: Record<string, string> = {
  "new-site": "Please add a new site",
  upgrade: "Question about upgrading my plan",
  remove: "Please remove a site",
};

export default async function NewTicketPage({ searchParams }: PageProps<"/dashboard/support/new">) {
  const sp = await searchParams;
  const viewer = await getViewer();
  const sites = listSites(viewer).map((s) => ({ id: s.id, name: s.name }));
  const topic = typeof sp.topic === "string" ? sp.topic : "";
  const siteId = typeof sp.site === "string" ? sp.site : "";
  return (
    <>
      <PageHeader title="New ticket" description="Tell us what's happening. Screenshots help." />
      <Card>
        <CardContent className="p-6">
          <TicketForm sites={sites} defaultSiteId={sites.some((s) => s.id === siteId) ? siteId : ""} defaultSubject={topicSubjects[topic] ?? ""} action={createTicket} />
        </CardContent>
      </Card>
    </>
  );
}
