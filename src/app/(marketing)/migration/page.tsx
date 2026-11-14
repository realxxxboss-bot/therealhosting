import type { Metadata } from "next";
import { migration } from "@/config/marketing";
import { photos } from "@/config/photos";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { LineList, RuledList, Split } from "@/components/marketing/blocks";
import { ButtonLink } from "@/components/ui/button";
import { FaqSection } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { Timeline } from "@/components/motion/timeline";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Free website migration",
  description: "We move your Next.js, WordPress and static sites to Zaffre for free, with a private test link and a zero-downtime DNS switch.",
  alternates: { canonical: "/migration" },
};

export default function MigrationPage() {
  return (
    <>
      <PageHero title={migration.title} lines={migration.lines} body={migration.intro} photo={photos.migration}>
        <div className="mt-8">
          <ButtonLink href="/contact?topic=migration" size="lg">
            Start my migration
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <Split heading={<SectionHeading title="How a move works" body="Five steps. You are needed for two of them." />}>
          <Timeline steps={migration.steps} />
        </Split>
      </Section>

      <Section tone="sunk">
        <Split heading={<SectionHeading title="Where we move sites from" />}>
          <RuledList items={migration.from} />
        </Split>
      </Section>

      <Section>
        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="text-h3 font-semibold">{migration.need.title}</h2>
            <LineList items={migration.need.items} className="mt-6 border-foreground" />
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-h3 font-semibold">{migration.same.title}</h2>
            <LineList items={migration.same.items} className="mt-6 border-foreground" />
          </Reveal>
        </div>
      </Section>

      <Section tone="band">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <h2 className="text-h2-lg font-semibold">{migration.rollback.title}</h2>
          </Reveal>
          <Reveal className="lg:col-span-7 lg:pt-2" delay={0.08}>
            <p className="text-xl leading-relaxed text-white/90">{migration.rollback.body}</p>
          </Reveal>
        </div>
      </Section>

      <FaqSection title="Questions about moving" items={migration.faq} />
      <CtaBand title="Tell us where your sites are today." body="Send us the addresses and we will reply with a plan for the move. It costs nothing to ask." />
    </>
  );
}
