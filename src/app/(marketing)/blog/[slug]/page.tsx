import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { posts, getPost } from "@content/blog/posts";
import { site, absoluteUrl } from "@/config/site";
import { JsonLd } from "@/components/marketing/json-ld";
import { CtaBand } from "@/components/marketing/cta-band";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.date, title: post.title, description: post.description },
  };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { Body } = post;
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            url: absoluteUrl(`/blog/${post.slug}`),
            publisher: { "@type": "Organization", name: site.name, logo: absoluteUrl("/brand/icon-512.png") },
          }}
        />
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> All posts
        </Link>
        <p className="mt-8 text-sm text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
        </p>
        <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg text-muted">{post.description}</p>
        <div className="prose-zaffre mt-10">
          <Body />
        </div>
      </article>
      <CtaBand />
    </>
  );
}
