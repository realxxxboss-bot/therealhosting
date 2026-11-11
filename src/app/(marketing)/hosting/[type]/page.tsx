import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hostingPages } from "@/config/marketing";
import { photos } from "@/config/photos";
import { siteTypes, type SiteType } from "@/config/plans";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { LineList, RuledList, Split } from "@/components/marketing/blocks";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqSection } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { ButtonLink } from "@/components/ui/button";
import { Timeline } from "@/components/motion/timeline";

const types = Object.keys(hostingPages) as SiteType[];

function isType(value: string): value is SiteType {
  return (types as string[]).includes(value);
}

export function generateStaticParams() {
  return types.map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps<"/hosting/[type]">): Promise<Metadata> {
  const { type } = await params;
  if (!isType(type)) return {};
  const page = hostingPages[type];
  return { title: page.metaTitle, description: page.metaDescription, alternates: { canonical: `/hosting/${type}` } };
}

export default async function HostingPage({ params }: PageProps<"/hosting/[type]">) {
  const { type } = await params;
  if (!isType(type)) notFound();
  const page = hostingPages[type];
  return (
    <>
      <PageHero title={page.title} lines={page.lines} body={page.intro} photo={photos[page.photo]}>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#plans" size="lg">
            See {siteTypes[type].short} plans
          </ButtonLink>
          <ButtonLink href="/migration" size="lg" variant="secondary">
            Free migration
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <Split heading={<SectionHeading title="What you get" body={`Everything below is part of every ${siteTypes[type].short} plan.`} />}>
          <RuledList items={page.features} />
        </Split>
      </Section>

      {page.sections.map((section, i) => (
        <Section key={section.title} tone={i % 2 === 0 ? "sunk" : "plain"}>
          <Split heading={<SectionHeading title={section.title} />}>
            <p className="max-w-[62ch] text-lg leading-relaxed">{section.body}</p>
            {section.steps ? (
              <div className="mt-10">
                <Timeline steps={section.steps} />
              </div>
            ) : null}
            {section.lines ? <LineList items={section.lines} className="mt-8 border-foreground" columns={section.lines.length > 4 ? 2 : 1} /> : null}
          </Split>
        </Section>
      ))}

      <Section id="plans" className="scroll-mt-20" tone={page.sections.length % 2 === 0 ? "sunk" : "plain"}>
        <SectionHeading title={`${siteTypes[type].short} plans`} body="The same price when you renew. Pay yearly and get two months free." />
        <div className="mt-12">
          <PricingCards initialType={type} showTypeSwitch={false} showCompare />
        </div>
      </Section>

      <FaqSection items={page.faq} tone={page.sections.length % 2 === 0 ? "plain" : "sunk"} />
      <CtaBand />
    </>
  );
}
