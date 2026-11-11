import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import { PageHero, Section } from "@/components/marketing/section";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Zaffre about hosting, migration or support. Email or WhatsApp, answered by people.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const wa = whatsappLink("Hi Zaffre, I'd like to talk about hosting.");
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to a person." body="Tell us about your sites and what you need. We reply by email, usually within one business day." />
      <Section className="grid gap-10 pt-10 sm:pt-12 lg:grid-cols-[1.5fr_1fr]">
        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
        <aside className="grid content-start gap-4">
          <div className="rounded-[16px] border border-border bg-surface p-6">
            <Mail className="size-5 text-primary" aria-hidden />
            <h2 className="mt-3 font-bold">Email</h2>
            <p className="mt-1 text-sm text-muted">Sales and general questions</p>
            <a className="mt-2 inline-block text-primary underline-offset-4 hover:underline" href={`mailto:${site.contact.salesEmail}`}>
              {site.contact.salesEmail}
            </a>
            <p className="mt-3 text-sm text-muted">Existing clients</p>
            <a className="mt-1 inline-block text-primary underline-offset-4 hover:underline" href={`mailto:${site.contact.supportEmail}`}>
              {site.contact.supportEmail}
            </a>
          </div>
          <div className="rounded-[16px] border border-border bg-surface p-6">
            <MessageCircle className="size-5 text-success" aria-hidden />
            <h2 className="mt-3 font-bold">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted">Quick questions and urgent help for clients.</p>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#1f7a4d] px-4 text-sm font-medium text-white hover:opacity-90">
                <MessageCircle className="size-4" aria-hidden /> Chat on WhatsApp
              </a>
            ) : (
              <p className="mt-4 rounded-[10px] bg-surface-2 px-3 py-2 text-sm text-muted">WhatsApp number coming soon.</p>
            )}
          </div>
          <p className="px-1 text-sm text-muted">{site.contact.supportHours}.</p>
        </aside>
      </Section>
    </>
  );
}
