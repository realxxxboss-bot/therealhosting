import type { Metadata } from "next";
import { about } from "@/config/marketing";
import { photos } from "@/config/photos";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { PhotoRow, RuledList, Split } from "@/components/marketing/blocks";
import { CtaBand } from "@/components/marketing/cta-band";
import { Photo } from "@/components/motion/photo";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "About",
  description: "Zaffre is a managed hosting company for businesses that want their websites to simply work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero title={about.title} lines={about.lines} body={about.intro} photo={photos.about} />

      <Section>
        <Split heading={<SectionHeading title="Why we started" />}>
          <div className="grid max-w-[62ch] gap-6 text-lg leading-relaxed">
            {about.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Split>
      </Section>

      <Section tone="band">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <Reveal className="lg:col-span-6">
            <h2 className="text-[2.25rem] leading-[1.04] font-semibold tracking-[-0.035em] sm:text-[3rem]">{about.name.title}</h2>
            <div className="mt-6 grid gap-5 text-lg leading-relaxed text-white/90">
              {about.name.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Photo photo={photos.tiles} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] lg:col-span-6" />
        </div>
      </Section>

      <Section>
        <Split heading={<SectionHeading title="How we work" />}>
          <RuledList items={about.values} />
        </Split>
      </Section>

      <Section tone="sunk">
        <PhotoRow photo={photos.cobalt} flip>
          <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">{about.paid.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{about.paid.body}</p>
        </PhotoRow>
      </Section>

      <CtaBand />
    </>
  );
}
