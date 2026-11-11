import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost } from "@content/blog/posts";
import { photos, photographerUrl } from "@/config/photos";
import { site, absoluteUrl } from "@/config/site";
import { Container } from "@/components/marketing/section";
import { JsonLd } from "@/components/marketing/json-ld";
import { CtaBand } from "@/components/marketing/cta-band";
import { HeroIntro } from "@/components/motion/hero-intro";
import { Photo } from "@/components/motion/photo";
import { ArticleWithContents, ReadingProgress } from "@/components/motion/reading";
import { formatLongDate } from "@/lib/utils";

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
  const cover = photos[post.cover];
  const others = posts.filter((p) => p.slug !== post.slug);
  return (
    <>
      <ReadingProgress />
      <article>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            url: absoluteUrl(`/blog/${post.slug}`),
            author: { "@type": "Organization", name: site.name },
            publisher: { "@type": "Organization", name: site.name, logo: absoluteUrl("/brand/icon-512.png") },
          }}
        />
        <Container className="pt-10 sm:pt-14">
          <p className="text-[0.9375rem]">
            <Link href="/blog" className="link font-medium">
              All posts
            </Link>
          </p>
          <HeroIntro lines={[post.title]} className="mt-8 max-w-4xl" headingClassName="text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-[1.04] tracking-[-0.035em]">
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">{post.description}</p>
            <p className="mt-6 text-[0.9375rem] text-muted">
              <span className="font-medium text-foreground">The {site.name} team</span>
              <span className="mx-3 inline-block h-3 w-px bg-border align-middle" aria-hidden />
              <time dateTime={post.date}>{formatLongDate(post.date)}</time>
              <span className="mx-3 inline-block h-3 w-px bg-border align-middle" aria-hidden />
              {post.readingMinutes} minute read
            </p>
          </HeroIntro>
          <figure className="mt-12">
            <Photo photo={cover} priority sizes="(min-width: 1200px) 1136px, 100vw" className="aspect-[16/9] sm:aspect-[21/9]" />
            <figcaption className="mt-3 text-sm text-muted">
              Photo by{" "}
              <a href={photographerUrl(cover)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {cover.author}
              </a>{" "}
              on Unsplash
            </figcaption>
          </figure>
        </Container>
        <Container className="py-14 sm:py-20">
          <ArticleWithContents>
            <div className="prose-zaffre max-w-[68ch]">
              <Body />
            </div>
          </ArticleWithContents>
        </Container>
      </article>
      <Container className="pb-20 sm:pb-28">
        <h2 className="text-2xl font-semibold tracking-[-0.025em]">Keep reading</h2>
        <ul className="mt-6 grid border-t border-foreground sm:grid-cols-2 sm:gap-x-12">
          {others.map((p) => (
            <li key={p.slug} className="border-b border-border">
              <Link href={`/blog/${p.slug}`} className="group block py-6">
                <p className="text-[0.9375rem] text-muted">{p.topic}</p>
                <p className="mt-2 text-xl leading-snug font-semibold tracking-[-0.02em] underline decoration-transparent decoration-2 underline-offset-4 transition-colors duration-200 group-hover:decoration-current">{p.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
      <CtaBand />
    </>
  );
}
