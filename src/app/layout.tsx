import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/app/theme-provider";
import { site } from "@/config/site";
import "./globals.css";

const inter = localFont({ src: "../fonts/inter.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
const jakarta = localFont({
  src: "../fonts/plus-jakarta-sans.woff2",
  variable: "--font-jakarta",
  display: "swap",
  weight: "200 800",
});
const jetbrains = localFont({
  src: "../fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  display: "swap",
  weight: "100 800",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en", url: site.url },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#070a1f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
