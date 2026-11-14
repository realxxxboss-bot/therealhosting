"use client";

import "./globals.css";
import { ErrorPanel } from "@/components/app/error-panel";

/** Replaces the root layout when it fails, so it brings its own document and styles. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground">
        <title>Something went wrong | Zaffre</title>
        <main id="main">
          <ErrorPanel error={error} retry={retry} />
        </main>
      </body>
    </html>
  );
}
