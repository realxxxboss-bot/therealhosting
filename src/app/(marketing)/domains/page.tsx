import type { Metadata } from "next";
import { PageHero, Section } from "@/components/marketing/section";
import { DomainSearch } from "./domain-search";

export const metadata: Metadata = {
  title: "Domain search",
  description: "Check if a domain name is available. Registration through Zaffre is coming soon; until then we connect domains you own anywhere.",
  alternates: { canonical: "/domains" },
};

export default function DomainsPage() {
  return (
    <>
      <PageHero eyebrow="Domains" title="Find your next domain name." body="Search now. Registration through Zaffre is coming soon. Until then, buy it at any registrar and we'll connect it for you, with free SSL." />
      <Section className="pt-10 sm:pt-12">
        <DomainSearch />
      </Section>
    </>
  );
}
