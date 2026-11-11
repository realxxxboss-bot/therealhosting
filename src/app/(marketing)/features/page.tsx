import type { Metadata } from "next";
import { features } from "@/config/marketing";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Why Zaffre",
  description: features.intro,
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero eyebrow="Why Zaffre" title="Hosting where someone actually looks after your sites." body={features.intro} />
      {features.groups.map((group) => (
        <Section key={group.title} className="py-12 sm:py-16">
          <SectionHeading title={group.title} />
          <div className="mt-8">
            <FeatureGrid items={group.items} columns={4} />
          </div>
        </Section>
      ))}
      <CtaBand />
    </>
  );
}
