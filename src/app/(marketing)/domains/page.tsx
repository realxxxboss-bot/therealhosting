import type { Metadata } from "next";
import { domains } from "@/config/marketing";
import { Container, PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { Split } from "@/components/marketing/blocks";
import { FaqSection } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { Timeline } from "@/components/motion/timeline";
import { DomainSearch } from "./domain-search";

export const metadata: Metadata = {
  title: "Domain search",
  description: "Check if a domain name is available. Registration through Zaffre is coming soon; until then we connect domains you own anywhere.",
  alternates: { canonical: "/domains" },
};

const records = [
  { type: "A", name: "@", value: "The address we give you", note: "Points yourbusiness.com at your site" },
  { type: "CNAME", name: "www", value: "The hostname we give you", note: "Makes the www version work too" },
];

export default function DomainsPage() {
  return (
    <>
      <PageHero title="Domain search" lines={["Find your next", "domain name."]} body="Search now. Registration through Zaffre is coming soon. Until then, buy the name at any registrar and we connect it for you, with free SSL." />
      <Container className="py-12 sm:py-16">
        <DomainSearch />
      </Container>

      <Section tone="sunk">
        <Split heading={<SectionHeading title={domains.connect.title} body={domains.connect.body} />}>
          <Timeline steps={domains.connect.steps} />
        </Split>
      </Section>

      <Section>
        <Split heading={<SectionHeading title="The two records, in plain words" body="This is all a domain needs to point at a site. Your dashboard shows the exact values to copy." />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-y border-foreground text-small">
                  <th scope="col" className="py-3 pr-6 font-medium text-muted">Type</th>
                  <th scope="col" className="py-3 pr-6 font-medium text-muted">Name</th>
                  <th scope="col" className="py-3 pr-6 font-medium text-muted">Value</th>
                  <th scope="col" className="py-3 font-medium text-muted">What it does</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.type} className="border-b border-border">
                    <td className="py-4 pr-6 font-mono text-small font-medium">{r.type}</td>
                    <td className="py-4 pr-6 font-mono text-small">{r.name}</td>
                    <td className="py-4 pr-6">{r.value}</td>
                    <td className="py-4 text-muted">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-[62ch] text-muted">Your email records are separate and we do not touch them. Connecting a website does not change where your mail goes.</p>
        </Split>
      </Section>

      <FaqSection title="Domain questions" items={domains.faq} tone="sunk" />
      <CtaBand />
    </>
  );
}
