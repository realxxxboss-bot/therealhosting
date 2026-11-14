import type { Metadata } from "next";
import Link from "next/link";
import { about } from "@/config/marketing";
import { includedInEveryPlan } from "@/config/plans";
import { site } from "@/config/site";
import { SocialLinks } from "@/components/marketing/social-links";
import { photos } from "@/config/photos";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { RuledList, Split } from "@/components/marketing/blocks";
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
        <Split heading={<SectionHeading title={about.included.title} />}>
          <p className="max-w-[62ch] text-lg leading-relaxed text-muted">{about.included.body}</p>
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {includedInEveryPlan.map((item) => (
              <li key={item} className="border-t border-border py-3.5 text-lg">
                {item}
              </li>
            ))}
          </ul>
        </Split>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <SectionHeading title={about.where.title} />
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">{about.where.body}</p>
            <dl className="mt-8 border-t border-foreground">
              <div className="border-b border-border py-4">
                <dt className="text-[0.9375rem] text-muted">Client websites and databases, from launch</dt>
                <dd className="mt-1 text-lg">{site.dataRegions.join("; ")}</dd>
              </div>
              <div className="border-b border-border py-4">
                <dt className="text-[0.9375rem] text-muted">Daily off-site backups</dt>
                <dd className="mt-1 text-lg">{site.backupRegions.join("; ")}</dd>
              </div>
            </dl>
            <p className="mt-5">
              <Link href="/legal/privacy" className="link">
                Read the privacy policy
              </Link>
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionHeading title={about.talk.title} />
            <p className="mt-5 text-lg leading-relaxed text-muted">{about.talk.body}</p>
            <p className="mt-8 text-[1.5rem] font-semibold tracking-[-0.02em]">
              <a href={`mailto:${site.contact.email}`} className="underline decoration-border underline-offset-[6px] hover:decoration-foreground">
                {site.contact.email}
              </a>
            </p>
            <p className="mt-6 text-[0.9375rem] text-muted">Social media: @{site.social.handle}</p>
            <SocialLinks className="mt-2" />
          </div>
        </div>
      </Section>

      <Section tone="sunk">
        <div className="max-w-3xl">
          <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">{about.paid.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{about.paid.body}</p>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
