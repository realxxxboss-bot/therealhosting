import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Static Content Security Policy. A per-request nonce would force every page to render
 * dynamically and lose the static marketing pages, so inline scripts (Next's own bootstrap,
 * the theme script and JSON-LD) are allowed, and everything else is locked to our origin.
 * Photos come from Unsplash's CDN. See DECISIONS D-018.
 */
const isDev = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
  experimental: {
    // Payment proofs and ticket attachments may be up to 5 MB (src/lib/uploads.ts), plus multipart overhead.
    serverActions: { bodySizeLimit: "6mb" },
  },
  // The in-process sample database ships WebAssembly files that must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // SQL migrations and the sample database's data files are read from disk at run time.
  outputFileTracingIncludes: { "/**": ["./drizzle/**/*", "./node_modules/@electric-sql/pglite/dist/**/*"] },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const withMDX = createMDX({ options: { remarkPlugins: ["remark-gfm"], rehypePlugins: ["rehype-slug"] } });

export default withMDX(nextConfig);
