import type { Metadata } from "next";
import { features } from "@/config/marketing";
import { photos } from "@/config/photos";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { RuledList, Split } from "@/components/marketing/blocks";
import { CtaBand } from "@/components/marketing/cta-band";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Why Zaffre",
  description: "Fully managed hosting on reserved resources, at a fixed price with no renewal jump, supported by the people who run the servers.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero title={features.title} lines={features.lines} body={features.intro} photo={photos.support} />

      {features.groups.map((group, i) => (
        <Section key={group.id} id={group.id} tone={i % 2 === 1 ? "sunk" : "plain"} className="scroll-mt-20">
          <Split heading={<SectionHeading title={group.title} body={group.body} />}>
            <RuledList items={group.items} />
          </Split>
        </Section>
      ))}

      <Section tone="sunk">
        <SectionHeading title={features.split.title} body={features.split.body} />
        <Reveal className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-y border-foreground text-[0.9375rem]">
                <th scope="col" className="py-3 pr-6 font-medium text-muted">The job</th>
                <th scope="col" className="w-28 py-3 pr-6 font-medium text-muted">Who</th>
                <th scope="col" className="py-3 font-medium text-muted">Note</th>
              </tr>
            </thead>
            <tbody>
              {features.split.rows.map((row) => (
                <tr key={row.task} className="border-b border-border">
                  <th scope="row" className="py-4 pr-6 text-lg font-medium">{row.task}</th>
                  <td className="py-4 pr-6">
                    <span className={cn("font-semibold", row.who === "Zaffre" && "text-primary dark:text-accent")}>{row.who}</span>
                  </td>
                  <td className="py-4 text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Section>

      <Section tone="band">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <h2 className="text-[2.25rem] leading-[1.04] font-semibold tracking-[-0.035em] sm:text-[3rem]">{features.never.title}</h2>
          </Reveal>
          <div className="lg:col-span-8">
            <RuledList items={features.never.items} invert />
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
