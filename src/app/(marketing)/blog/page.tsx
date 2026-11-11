import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@content/blog/posts";
import { PageHero, Section } from "@/components/marketing/section";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Plain-language guides on hosting, Next.js, WordPress and migrations from the Zaffre team.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <>
      <PageHero eyebrow="Blog" title="Guides in plain words." body="Practical notes on hosting, Next.js, WordPress and moving sites without drama." />
      <Section className="pt-10 sm:pt-12">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col rounded-[16px] border border-border bg-surface p-6 transition-colors hover:border-primary">
                <p className="text-xs text-muted">
                  <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
                </p>
                <h2 className="mt-3 text-lg font-bold group-hover:text-primary">{post.title}</h2>
                <p className="mt-2 text-sm text-muted">{post.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
