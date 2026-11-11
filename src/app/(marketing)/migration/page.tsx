import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { migration } from "@/config/marketing";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Free website migration",
  description: "We move your Next.js, WordPress and static sites to Zaffre for free, with a private test link and a zero-downtime DNS switch.",
  alternates: { canonical: "/migration" },
};

export default function MigrationPage() {
  return (
    <>
      <PageHero eyebrow="Free migration" title={migration.title} body={migration.intro}>
        <div className="mt-8">
          <ButtonLink href="/contact?topic=migration" size="lg">
            Start my migration <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
      </PageHero>
      <Section>
        <SectionHeading title="How a move works" />
        <ol className="mt-10 grid gap-4">
          {migration.steps.map((step, i) => (
            <li key={step.title} className="flex gap-5 rounded-[16px] border border-border bg-surface p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground">{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-1 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <div className="border-y border-border bg-surface">
        <Section>
          <SectionHeading title="We move sites from" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {migration.from.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm text-muted">
            Your domains stay registered in your name. We only change the DNS records that point to your site, and we keep your old host running until the new one is confirmed.
          </p>
        </Section>
      </div>
      <CtaBand />
    </>
  );
}
