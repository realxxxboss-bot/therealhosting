import type { Metadata } from "next";
import { Suspense } from "react";
import { contact } from "@/config/marketing";
import { photos } from "@/config/photos";
import { site, whatsappLink } from "@/config/site";
import { SocialLinks } from "@/components/marketing/social-links";
import { Container, PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { LineList, TextLink } from "@/components/marketing/blocks";
import { Photo } from "@/components/motion/photo";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Zaffre about hosting, migration or support. Answered by people.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const wa = whatsappLink("Hi Zaffre, I'd like to talk about hosting.");
  return (
    <>
      <PageHero title="Contact" lines={["Talk to", "a person."]} body="Tell us about your sites and what you need. We reply by email, usually within one business day." />
      <Container className="grid gap-14 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <Photo photo={photos.contact} sizes="(min-width: 1024px) 33vw, 100vw" className="aspect-[4/3]" />
          <dl className="mt-8 border-t border-foreground">
            <div className="border-b border-border py-4">
              <dt className="text-[0.9375rem] text-muted">Email, for new sites and existing clients</dt>
              <dd className="mt-1 text-lg">
                <TextLink href={`mailto:${site.contact.email}`}>{site.contact.email}</TextLink>
              </dd>
            </div>
            <div className="border-b border-border py-4">
              <dt className="text-[0.9375rem] text-muted">Follow us, @{site.social.handle}</dt>
              <dd className="mt-2">
                <SocialLinks />
              </dd>
            </div>
            {wa ? (
              <div className="border-b border-border py-4">
                <dt className="text-[0.9375rem] text-muted">WhatsApp</dt>
                <dd className="mt-1 text-lg">
                  <TextLink href={wa}>Message us on WhatsApp</TextLink>
                </dd>
              </div>
            ) : null}
            <div className="border-b border-border py-4">
              <dt className="text-[0.9375rem] text-muted">Hours</dt>
              <dd className="mt-1">{site.contact.supportHours}.</dd>
            </div>
          </dl>
        </aside>
      </Container>

      <Section tone="sunk">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionHeading title="What happens next" />
            <ol className="mt-10 grid gap-8 sm:grid-cols-3">
              {contact.next.map((step, i) => (
                <li key={step.title} className="border-t border-foreground pt-5">
                  <span className="text-[2.5rem] leading-none font-semibold tracking-[-0.04em] text-primary dark:text-accent">{i + 1}</span>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">Helpful to include</h2>
            <LineList items={contact.helpful} className="mt-4 border-foreground" />
          </div>
        </div>
      </Section>
    </>
  );
}
