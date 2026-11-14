import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/app/theme-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { site } from "@/config/site";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../fonts/schibsted-grotesk.woff2", style: "normal", weight: "400 900" },
    { path: "../fonts/schibsted-grotesk-italic.woff2", style: "italic", weight: "400 900" },
  ],
  variable: "--font-brand",
  display: "swap",
});
const mono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-400.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-mono-500.woff2", weight: "500" },
  ],
  variable: "--font-code",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  // No og:url here: every page would inherit the home page's address. Pages set a canonical instead.
  openGraph: { type: "website", siteName: site.name, locale: "en" },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1018" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-50 rounded-[4px] bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
