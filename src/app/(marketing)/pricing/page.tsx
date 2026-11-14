import type { Metadata } from "next";
import Link from "next/link";
import { competitorBenchmark, includedInEveryPlan, plansByType, YEARLY_MONTHS_CHARGED } from "@/config/plans";
import { pricing, pricingFaq } from "@/config/marketing";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { LineList, Split, TextLink } from "@/components/marketing/blocks";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqSection } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { Timeline } from "@/components/motion/timeline";
import { formatDate, formatUSD } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Managed hosting plans for Next.js, WordPress and static sites in USD. Same price on renewal, yearly billing saves 17%, free migration included.",
  alternates: { canonical: "/pricing" },
};

const heroFacts = ["Prices in US dollars", "Free migration on every plan", "No setup fee", "Cancel any time"];
const lowest = Math.min(...plansByType("static").map((p) => p.monthly));

export default function PricingPage() {
  const example = pricing.billing.example;
  const total = example.lines.reduce((sum, line) => sum + line.amount, 0);
  return (
    <>
      <PageHero title="Pricing" lines={["Fair prices that", "do not jump", "at renewal."]} body="Choose a package for each kind of site. A package covers several sites. Pay monthly, or yearly and get two months free.">
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-small font-medium">
          {heroFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </PageHero>

      <Section className="py-12 sm:py-16 lg:py-20">
        <PricingCards showCompare />
        <p className="mt-8 max-w-[70ch] text-small text-muted">
          Prices are in US dollars and exclude taxes. If you are a consumer and VAT applies to you, we show the total including VAT before you order. Consumers in the UK and EU can cancel a new package within 14 days. See our <Link href="/legal/refund" className="link">Refund Policy</Link>.
        </p>
      </Section>

      <Section tone="sunk">
        <Split heading={<SectionHeading title="Included in every plan" body="These are not add-ons. They are the service." />}>
          <LineList items={includedInEveryPlan} columns={2} className="border-foreground" />
        </Split>
      </Section>

      <Section>
        <Split heading={<SectionHeading title={pricing.billing.title} body={pricing.billing.body} />}>
          <div className="max-w-xl">
            <h3 className="text-xl font-semibold tracking-[-0.02em]">{example.title}</h3>
            <dl className="mt-4 border-t border-foreground">
              {example.lines.map((line) => (
                <div key={line.label} className="flex items-baseline justify-between gap-6 border-b border-border py-4">
                  <dt>{line.label}</dt>
                  <dd className="font-medium tabular-nums">{formatUSD(line.amount)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-6 border-b border-foreground py-4 text-lg font-semibold">
                <dt>One invoice each month</dt>
                <dd className="tabular-nums">{formatUSD(total)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 py-4 text-muted">
                <dt>Or once a year</dt>
                <dd className="tabular-nums">{formatUSD(total * YEARLY_MONTHS_CHARGED)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-muted">{example.note} Next year the invoice shows the same numbers.</p>
          </div>
        </Split>
      </Section>

      <Section tone="sunk">
        <Split heading={<SectionHeading title={pricing.after.title} body="No checkout page and no card form. A person handles your request." />}>
          <Timeline steps={pricing.after.steps} />
        </Split>
      </Section>

      <Section id="renewal" className="scroll-mt-20">
        <SectionHeading
          title="What the alternatives cost after year one"
          body={`Many hosts advertise a low first-term price and renew at several times that. These are public list prices, checked on ${formatDate(competitorBenchmark.checkedOn)}.`}
        />
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-y border-foreground text-small">
                <th scope="col" className="w-[30%] py-3 pr-6 font-medium text-muted">Typical alternative</th>
                <th scope="col" className="py-3 pr-6 font-medium text-muted">Intro price</th>
                <th scope="col" className="py-3 pr-6 font-medium text-muted">Renewal price</th>
                <th scope="col" className="w-[32%] py-3 font-medium text-muted">The catch</th>
              </tr>
            </thead>
            <tbody>
              {competitorBenchmark.rows.map((row) => (
                <tr key={row.product} className="border-b border-border align-top">
                  <th scope="row" className="py-5 pr-6 font-medium">{row.product}</th>
                  <td className="py-5 pr-6">{row.intro}</td>
                  <td className="py-5 pr-6 text-lg font-semibold">{row.renewal}</td>
                  <td className="py-5 text-muted">{row.note}</td>
                </tr>
              ))}
              <tr className="bg-band align-top text-band-foreground">
                <th scope="row" className="py-5 pr-6 pl-5 text-lg font-semibold">Zaffre</th>
                <td className="py-5 pr-6">From {formatUSD(lowest)} a month, billed monthly</td>
                <td className="py-5 pr-6 text-lg font-semibold">The same price</td>
                <td className="py-5 pr-5">Fully managed. No seat fees and no usage meter.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="sunk">
        <Split heading={<SectionHeading title={pricing.outgrow.title} />}>
          <p className="max-w-[62ch] text-lg leading-relaxed">{pricing.outgrow.body}</p>
          <p className="mt-6 text-muted">
            Not sure which plan fits? <TextLink href="/contact">Tell us about your sites</TextLink> and we will suggest one. If a smaller plan is enough, we say so.
          </p>
        </Split>
      </Section>

      <FaqSection title="Pricing questions" items={pricingFaq} body={<>The full terms are in the <TextLink href="/legal/refund">Refund Policy</TextLink> and the <TextLink href="/legal/terms">Terms of Service</TextLink>.</>} />
      <CtaBand />
    </>
  );
}
