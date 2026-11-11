import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hostingPages } from "@/config/marketing";
import { siteTypes, type SiteType } from "@/config/plans";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { ButtonLink } from "@/components/ui/button";

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
      <PageHero eyebrow={siteTypes[type].label} title={page.title} body={page.intro}>
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
        <FeatureGrid items={page.features} />
      </Section>
      <div id="plans" className="scroll-mt-16 border-y border-border bg-surface">
        <Section>
          <SectionHeading title={`${siteTypes[type].short} plans`} body="Same price on renewal. Yearly billing saves two months." />
          <div className="mt-8">
            <PricingCards initialType={type} showTypeSwitch={false} />
          </div>
          <div className="mt-10">
            <ComparisonTable type={type} />
          </div>
        </Section>
      </div>
      <Section>
        <SectionHeading title="Questions" />
        <div className="mt-8 max-w-3xl">
          <Faq items={page.faq} />
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
