import type { MetadataRoute } from "next";
import { posts } from "@content/blog/posts";
import { legalDocs } from "@content/legal/docs";
import { absoluteUrl } from "@/config/site";

const staticPaths = ["/", "/pricing", "/features", "/hosting/nextjs", "/hosting/wordpress", "/hosting/static", "/migration", "/domains", "/status", "/blog", "/contact", "/about", "/security", "/credits"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((p) => ({ url: absoluteUrl(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...legalDocs.map((d) => ({ url: absoluteUrl(`/legal/${d.slug}`), lastModified: d.updated, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
