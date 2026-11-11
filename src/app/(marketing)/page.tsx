import { Check, Sparkles } from "lucide-react";
import { home } from "@/config/marketing";
import { site, absoluteUrl } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Section, SectionHeading } from "@/components/marketing/section";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          logo: absoluteUrl("/brand/icon-512.png"),
          description: site.description,
          email: site.contact.supportEmail,
        }}
      />
      <div className="relative overflow-hidden">
        <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              <Sparkles className="size-3.5 text-accent" aria-hidden />
              {home.hero.eyebrow}
            </p>
            <h1 className="mt-6 text-[40px] leading-[1.05] font-extrabold sm:text-[56px]">{home.hero.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{home.hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={home.hero.primaryCta.href} size="lg">
                {home.hero.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={home.hero.secondaryCta.href} size="lg" variant="secondary">
                {home.hero.secondaryCta.label}
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {home.hero.points.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="size-4 text-success" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <DashboardPreview />
        </div>
      </div>

      <Section className="pt-4 sm:pt-8">
        <SectionHeading eyebrow="What you get" title={site.positioning} align="center" />
        <div className="mt-12">
          <FeatureGrid items={home.pillars} columns={4} />
        </div>
      </Section>

      <div className="border-y border-border bg-surface">
        <Section className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading eyebrow={home.nextjs.eyebrow} title={home.nextjs.title} body={home.nextjs.body} />
          <ul className="grid gap-3 sm:grid-cols-2">
            {home.nextjs.points.map((p) => (
              <li key={p} className="flex gap-3 rounded-[14px] border border-border bg-background p-4 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section>
        <SectionHeading eyebrow="How it works" title="Switching takes one message." align="center" />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {home.steps.map((step, i) => (
            <li key={step.title} className="rounded-[16px] border border-border bg-surface p-6">
              <span className="font-display text-sm font-bold text-primary">Step {i + 1}</span>
              <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <div className="border-y border-border bg-surface">
        <Section>
          <SectionHeading eyebrow="Pricing" title="One fair price. It stays that way." body="Pick a package for each type of site. Every plan includes migration, backups, updates and real support." />
          <div className="mt-10">
            <PricingCards />
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading eyebrow={home.dashboard.eyebrow} title={home.dashboard.title} body={home.dashboard.body} align="center" />
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/sign-in" variant="secondary">
            Try the demo dashboard
          </ButtonLink>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
