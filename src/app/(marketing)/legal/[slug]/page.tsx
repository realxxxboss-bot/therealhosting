import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legalDocs, getLegalDoc } from "@content/legal/docs";
import { PageHero } from "@/components/marketing/section";

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
      <PageHero eyebrow="Legal" title={doc.title} />
      <div className="prose-zaffre mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Body />
      </div>
    </>
  );
}
