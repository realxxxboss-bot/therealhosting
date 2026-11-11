import type { Metadata } from "next";
import { about } from "@/config/marketing";
import { PageHero, Section } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "About",
  description: "Zaffre is a managed hosting company for businesses that want their websites to simply work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const [lead, ...rest] = about.paragraphs;
  return (
    <>
      <PageHero eyebrow="About" title={about.title} body={lead} />
      <Section className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-5 text-lg leading-relaxed text-foreground/90">
          {rest.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <ul className="grid content-start gap-4">
          {about.values.map((v) => (
            <li key={v.title} className="rounded-[16px] border border-border bg-surface p-6">
              <h2 className="text-lg font-bold">{v.title}</h2>
              <p className="mt-1 text-muted">{v.body}</p>
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand />
    </>
  );
}
