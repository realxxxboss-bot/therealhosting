import type { Metadata } from "next";
import { Check } from "lucide-react";
import { includedInEveryPlan, competitorBenchmark, siteTypes, type SiteType } from "@/config/plans";
import { pricingFaq } from "@/config/marketing";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Managed hosting plans for Next.js, WordPress and static sites in USD. Same price on renewal, yearly billing saves 17%, free migration included.",
  alternates: { canonical: "/pricing" },
};

const types: SiteType[] = ["nextjs", "wordpress", "static"];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Pricing" title="Fair prices that don't jump at renewal." body="Choose a package for each type of site. A package covers several sites. Pay monthly, or yearly and get two months free.">
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {["Prices in USD", "Free migration", "No setup fees", "Cancel any time"].map((p) => (
            <li key={p} className="flex items-center gap-2">
              <Check className="size-4 text-success" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </PageHero>

      <Section className="pt-12 sm:pt-16">
        <PricingCards />
      </Section>

      <div className="border-y border-border bg-surface">
        <Section>
          <SectionHeading title="Included in every plan" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {includedInEveryPlan.map((item) => (
              <li key={item} className="flex gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section>
        <SectionHeading title="Compare plans" body="Resources are reserved for your package, not shared with a crowd." />
        <div className="mt-8 grid gap-10">
          {types.map((t) => (
            <div key={t}>
              <h3 className="mb-3 text-lg font-bold">{siteTypes[t].label}</h3>
              <ComparisonTable type={t} />
            </div>
          ))}
        </div>
      </Section>

      <div className="border-y border-border bg-surface">
        <Section>
          <SectionHeading
            title="Why our price looks the way it does"
            body={`Many hosts advertise a low first-term price and renew at several times that. Here is what typical alternatives cost after the promotion ends (public list prices, checked ${competitorBenchmark.checkedOn}).`}
          />
          <div className="mt-8 overflow-x-auto rounded-[16px] border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium text-muted">Typical alternative</th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted">Intro price</th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted">Renewal price</th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted">Catch</th>
                </tr>
              </thead>
              <tbody>
                {competitorBenchmark.rows.map((r) => (
                  <tr key={r.product} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 text-left font-medium">{r.product}</th>
                    <td className="px-4 py-3">{r.intro}</td>
                    <td className="px-4 py-3 font-semibold">{r.renewal}</td>
                    <td className="px-4 py-3 text-muted">{r.note}</td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-primary-soft">
                  <th scope="row" className="px-4 py-3 text-left font-semibold">Zaffre</th>
                  <td className="px-4 py-3">From $7/mo, monthly</td>
                  <td className="px-4 py-3 font-semibold">Same as intro</td>
                  <td className="px-4 py-3">Fully managed, no seat fees, no usage meter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading title="Pricing questions" />
        <div className="mt-8 max-w-3xl">
          <Faq items={pricingFaq} />
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
