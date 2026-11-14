import type { Metadata } from "next";
import Link from "next/link";
import { posts, type Post } from "@content/blog/posts";
import { photos } from "@/config/photos";
import { Container, PageHero } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";
import { Photo } from "@/components/motion/photo";
import { formatLongDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Plain-language guides on hosting, Next.js, WordPress and migrations from the Zaffre team.",
  alternates: { canonical: "/blog" },
};

function Meta({ post }: { post: Post }) {
  return (
    <p className="text-small text-muted">
      <span className="font-medium text-foreground">{post.topic}</span>
      <span className="mx-3 inline-block h-3 w-px bg-border align-middle" aria-hidden />
      <time dateTime={post.date}>{formatLongDate(post.date)}</time>
      <span className="mx-3 inline-block h-3 w-px bg-border align-middle" aria-hidden />
      {post.readingMinutes} minute read
    </p>
  );
}

export default function BlogIndex() {
  const [featured, ...rest] = posts;
  return (
    <>
      <PageHero title="Blog" lines={["Guides in", "plain words."]} body="Practical notes on hosting, Next.js, WordPress and moving sites without drama. Written by the people who do the work." />
      <Container className="py-14 sm:py-20">
        {featured ? (
          <Link href={`/blog/${featured.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            <Photo photo={photos[featured.cover]} priority sizes="(min-width: 1024px) 58vw, 100vw" className="aspect-[16/10] lg:col-span-7 [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-[var(--ease-out)] group-hover:[&_img]:scale-[1.03]" />
            <div className="lg:col-span-5">
              <Meta post={featured} />
              <h2 className="mt-4 text-h2 font-semibold underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors duration-200 group-hover:decoration-current">{featured.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">{featured.description}</p>
            </div>
          </Link>
        ) : null}
        <ul className="mt-16 border-t border-foreground">
          {rest.map((post) => (
            <li key={post.slug} className="border-b border-border">
              <Link href={`/blog/${post.slug}`} className="group grid gap-6 py-8 sm:grid-cols-12 sm:items-center sm:gap-10">
                <Photo photo={photos[post.cover]} drift={8} sizes="(min-width: 640px) 25vw, 100vw" className="aspect-[16/10] sm:col-span-3 [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-[var(--ease-out)] group-hover:[&_img]:scale-[1.03]" />
                <div className="sm:col-span-9">
                  <Meta post={post} />
                  <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.025em] underline decoration-transparent decoration-2 underline-offset-[5px] transition-colors duration-200 group-hover:decoration-current">{post.title}</h2>
                  <p className="mt-2 max-w-[62ch] text-muted">{post.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
      <CtaBand />
    </>
  );
}
