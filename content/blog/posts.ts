import type { ComponentType } from "react";
import RenewalPrices from "./renewal-prices-explained.mdx";
import NextjsMigration from "./nextjs-migration-checklist.mdx";
import ManagedWordpress from "./managed-wordpress-checklist.mdx";

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  Body: ComponentType;
}

/** Blog registry. Add a new .mdx file next to this one and list it here. */
export const posts: Post[] = [
  {
    slug: "renewal-prices-explained",
    title: "Why your hosting bill jumps at renewal (and how to avoid it)",
    description: "Intro prices, long prepay terms and renewal rates: how typical hosting pricing works, and what to check before you buy.",
    date: "2026-11-11",
    readingMinutes: 4,
    Body: RenewalPrices,
  },
  {
    slug: "nextjs-migration-checklist",
    title: "Moving a Next.js app to a new host: a practical checklist",
    description: "Environment variables, cron jobs, ISR cache, images and DNS: what to collect before moving a Next.js app, and how to switch with no downtime.",
    date: "2026-11-04",
    readingMinutes: 6,
    Body: NextjsMigration,
  },
  {
    slug: "managed-wordpress-checklist",
    title: "What managed WordPress hosting should actually include",
    description: "Updates, backups, security and support: a plain-language checklist for comparing managed WordPress hosts.",
    date: "2026-10-28",
    readingMinutes: 5,
    Body: ManagedWordpress,
  },
].sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
