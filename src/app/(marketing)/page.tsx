import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { home, migration } from "@/config/marketing";
import { photos } from "@/config/photos";
import { includedInEveryPlan, plansByType, siteTypes, type SiteType } from "@/config/plans";
import { site, absoluteUrl, socialProfiles } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/marketing/section";
import { LineList, PhotoRow, RuledList, TextLink } from "@/components/marketing/blocks";
import { FaqSection } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { HeroIntro } from "@/components/motion/hero-intro";
import { Photo } from "@/components/motion/photo";
import { Reveal } from "@/components/motion/reveal";
import { formatUSD } from "@/lib/utils";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const typeOrder: SiteType[] = ["nextjs", "wordpress", "static"];

function fromPrice(type: SiteType): string {
  return formatUSD(Math.min(...plansByType(type).map((p) => p.monthly)));
}

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
          email: site.contact.email,
          sameAs: socialProfiles().map((p) => p.href),
        }}
      />

      <Container className="grid gap-10 pt-10 pb-16 sm:pt-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-24">
        <HeroIntro lines={home.hero.lines} className="lg:col-span-7">
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{home.hero.body}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={home.hero.primaryCta.href} size="lg">
              {home.hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={home.hero.secondaryCta.href} size="lg" variant="secondary">
              {home.hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </HeroIntro>
        <Photo photo={photos.heroHome} priority drift={16} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[3/2] lg:col-span-5 lg:aspect-[4/5]" />
      </Container>

      <Container>
        <ul className="grid border-t border-foreground sm:grid-cols-2 lg:grid-cols-4">
          {home.hero.facts.map((fact) => (
            <li key={fact.title} className="border-b border-border py-6 sm:pr-8 lg:border-b-0">
              <p className="font-semibold">{fact.title}</p>
              <p className="mt-1 text-[0.9375rem] text-muted">{fact.body}</p>
            </li>
          ))}
        </ul>
      </Container>

      <Section tone="band" className="mt-16 sm:mt-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="text-[2.25rem] leading-[1.04] font-semibold tracking-[-0.035em] sm:text-[3.25rem]">{home.why.title}</h2>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:pt-3" delay={0.08}>
            <p className="text-lg leading-relaxed text-white/85">{home.why.body}</p>
          </Reveal>
        </div>
        <dl className="mt-12 md:hidden">
          {home.why.rows.map((row) => (
            <div key={row.label} className="border-t border-white/30 py-6">
              <dt className="text-[0.9375rem] font-medium text-white/70">{row.label}</dt>
              {row.values.map((value, i) => (
                <dd key={value} className={i === 2 ? "mt-3 rounded-[4px] bg-white px-4 py-3 text-zaffre-700" : "mt-3"}>
                  <span className={i === 2 ? "block text-sm font-medium" : "block text-sm text-white/70"}>{home.why.columns[i]}</span>
                  <span className={i === 2 ? "mt-0.5 block text-lg leading-snug font-semibold" : "mt-0.5 block text-lg leading-snug text-white/90"}>{value}</span>
                </dd>
              ))}
            </div>
          ))}
        </dl>
        <div className="mt-20 hidden md:block">
          <table className="w-full text-left">
            <caption className="sr-only">How Zaffre compares with shared hosting and developer platforms</caption>
            <thead>
              <tr className="border-b border-white/30 text-[0.9375rem]">
                <td className="w-[16%] py-4" />
                {home.why.columns.map((col, i) => (
                  <th key={col} scope="col" className={i === 2 ? "w-[28%] py-4 pl-6 font-semibold" : "w-[28%] py-4 pr-6 font-medium text-white/70"}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {home.why.rows.map((row) => (
                <tr key={row.label} className="border-b border-white/30 align-top">
                  <th scope="row" className="py-6 pr-6 text-[0.9375rem] font-medium text-white/70">
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td key={value} className={i === 2 ? "bg-white py-6 pr-6 pl-6 text-lg leading-snug font-semibold text-zaffre-700" : "py-6 pr-6 text-lg leading-snug text-white/85"}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-[0.9375rem] text-white/75">
          The public list prices behind this are on the{" "}
          <Link href="/pricing#renewal" className="font-medium text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
            pricing page
          </Link>
          , with the date we checked them.
        </p>
      </Section>

      <Section>
        <SectionHeading title="Three kinds of site, each hosted properly." body="Most businesses end up with a mix. One account and one bill covers all of it." />
        <div className="mt-14 grid gap-20 sm:mt-20 lg:gap-28">
          {home.types.map((item, i) => (
            <PhotoRow key={item.type} photo={photos[item.photo]} flip={i % 2 === 1}>
              <h3 className="text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[2rem]">{item.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-muted">{item.body}</p>
              <LineList items={item.points} className="mt-7 text-[0.9375rem]" />
              <p className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="text-lg font-semibold">From {fromPrice(item.type)} a month</span>
                <TextLink href={`/hosting/${item.type}`}>More about {siteTypes[item.type].label}</TextLink>
              </p>
            </PhotoRow>
          ))}
        </div>
      </Section>

      <Section tone="sunk">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading title={home.managed.title} body={home.managed.body} />
            <Photo photo={photos.engineer} sizes="(min-width: 1024px) 40vw, 100vw" className="mt-10 aspect-[4/3]" />
          </div>
          <div className="grid gap-10 sm:grid-cols-5 lg:col-span-6 lg:col-start-7">
            <div className="sm:col-span-3">
              <h3 className="text-xl font-semibold tracking-[-0.02em]">We do</h3>
              <LineList items={home.managed.weDo} className="mt-4 border-foreground" />
            </div>
            <div className="sm:col-span-2">
              <h3 className="text-xl font-semibold tracking-[-0.02em]">You do</h3>
              <LineList items={home.managed.youDo} className="mt-4 border-foreground" />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading title="Switching takes one message." body="You tell us where your sites are. We do the move and you approve it." />
            <p className="mt-8">
              <ButtonLink href="/migration" variant="secondary" size="lg">
                How a move works
              </ButtonLink>
            </p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            {home.steps.map((step, i) => (
              <li key={step.title} className="border-t border-foreground pt-5">
                <span className="text-[2.5rem] leading-none font-semibold tracking-[-0.04em] text-primary dark:text-accent">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-16 grid gap-6 border-t border-border pt-8 lg:grid-cols-12 lg:gap-12">
          <p className="font-semibold lg:col-span-4">We move sites from</p>
          <ul className="grid gap-x-10 gap-y-2 text-muted sm:grid-cols-2 lg:col-span-8">
            {migration.from.map((from) => (
              <li key={from.title}>{from.title}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="sunk">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading title={home.dashboard.title} body={home.dashboard.body} />
            <p className="mt-8">
              <ButtonLink href="/sign-in" size="lg">
                Open the demo dashboard
              </ButtonLink>
            </p>
          </div>
          <RuledList items={home.dashboard.points} stacked className="lg:col-span-7" />
        </div>
        <Reveal className="mt-14 overflow-hidden rounded-[8px] border border-border bg-background">
          <Image src="/screens/dashboard-light.webp" alt="The Zaffre client dashboard showing a list of sites with their status, last deploy and last backup" width={2400} height={1500} unoptimized className="h-auto w-full dark:hidden" />
          <Image src="/screens/dashboard-dark.webp" alt="" width={2400} height={1500} unoptimized className="hidden h-auto w-full dark:block" />
        </Reveal>
        <p className="mt-3 text-sm text-muted">A screenshot of the demo account. The sites in it are sample data.</p>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading title={home.pricing.title} body={home.pricing.body} />
          </div>
          <div className="lg:col-span-7">
            <ul className="border-t border-foreground">
              {typeOrder.map((type) => {
                const starter = plansByType(type)[0];
                return (
                  <li key={type} className="border-b border-border">
                    <Link href={`/hosting/${type}#plans`} className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-6 transition-colors duration-200 hover:bg-surface-2 sm:px-4">
                      <span className="text-2xl font-semibold tracking-[-0.025em]">{siteTypes[type].label}</span>
                      <span className="text-2xl font-semibold tracking-[-0.025em]">from {fromPrice(type)}</span>
                      <span className="mt-1 text-muted">
                        {starter ? `Starter covers ${starter.sites} ${siteTypes[type].unit}${starter.sites > 1 ? "s" : ""}` : null}
                      </span>
                      <span className="mt-1 text-right text-muted">a month</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6">
              <ButtonLink href="/pricing" size="lg">
                Compare all plans
              </ButtonLink>
            </p>
          </div>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-12 lg:gap-12">
          <h3 className="text-xl font-semibold tracking-[-0.02em] lg:col-span-5">Included in every plan</h3>
          <LineList items={includedInEveryPlan} columns={2} className="text-[0.9375rem] lg:col-span-7" />
        </div>
      </Section>

      <Section tone="sunk">
        <PhotoRow photo={photos.support} flip>
          <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">{home.support.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{home.support.body}</p>
          <p className="mt-5 text-muted">{site.contact.supportHours}.</p>
          <p className="mt-8">
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Write to us
            </ButtonLink>
          </p>
        </PhotoRow>
      </Section>

      <FaqSection items={home.faq} body={<>Something else? <TextLink href="/contact">Ask us</TextLink> and a person will answer.</>} />

      <CtaBand />
    </>
  );
}
