import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { legalDocs, legalDraft, getLegalDoc } from "@content/legal/docs";
import { site } from "@/config/site";
import { Container } from "@/components/marketing/section";
import { TextLink } from "@/components/marketing/blocks";
import { HeroIntro } from "@/components/motion/hero-intro";
import { ArticleWithContents, ReadingProgress } from "@/components/motion/reading";
import { formatLongDate } from "@/lib/utils";

export function generateStaticParams() {
  return legalDocs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const doc = getLegalDoc((await params).slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description, alternates: { canonical: `/legal/${doc.slug}` } };
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const doc = getLegalDoc((await params).slug);
  if (!doc) notFound();
  const { Body } = doc;
  return (
    <>
      <ReadingProgress />
      <div className="border-b border-border">
        <Container className="py-14 sm:py-20">
          <HeroIntro lines={[doc.title]} headingClassName="text-title">
            <p className="mt-6 max-w-xl text-lg text-muted">{doc.description}</p>
            <p className="mt-4 text-small text-muted">
              Last updated <time dateTime={doc.updated}>{formatLongDate(doc.updated)}</time>
            </p>
          </HeroIntro>
        </Container>
      </div>
      <Container className="py-14 sm:py-20">
        <ArticleWithContents>
          <div className="max-w-[68ch]">
            {legalDraft ? (
              <p className="mb-6 rounded-[4px] bg-warning-soft px-4 py-3 text-small">
                {site.name} has not launched yet. This document is a draft that is being reviewed and may change before the service opens.
              </p>
            ) : null}
            <section aria-labelledby="in-short" className="border-y border-foreground py-6">
              <h2 id="in-short" className="text-xl font-semibold tracking-[-0.02em]">
                In short
              </h2>
              <ul className="mt-3 grid gap-2 leading-relaxed">
                {doc.summary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="mt-4 text-small text-muted">This summary is a reading aid. The full text below is what applies.</p>
            </section>
            <div className="prose-zaffre mt-10">
              <Body />
            </div>
            <p className="mt-12 border-t border-border pt-6 text-muted">
              Questions about this document? Write to <TextLink href={`mailto:${site.contact.email}`}>{site.contact.email}</TextLink>.
            </p>
          </div>
        </ArticleWithContents>
        <nav aria-label="Other documents" className="mt-16 border-t border-foreground pt-6">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {legalDocs
              .filter((d) => d.slug !== doc.slug)
              .map((d) => (
                <li key={d.slug}>
                  <Link href={`/legal/${d.slug}`} className="link font-medium">
                    {d.title}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
