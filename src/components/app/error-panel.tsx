"use client";

import { useEffect } from "react";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";

/** Shared body of every error.tsx: plain words, a retry, and a reference to quote to support. */
export function ErrorPanel({ error, retry, homeHref = "/" }: { error: unknown; retry: () => void; homeHref?: string }) {
  const digest = error instanceof Error && "digest" in error ? String((error as Error & { digest?: string }).digest ?? "") : "";
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <p className="text-[0.9375rem] font-medium text-muted">Something went wrong</p>
      <h1 className="mt-3 text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em]">This page didn&apos;t load.</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        It is usually a short problem on our side. Try again in a moment. If it keeps happening, email{" "}
        <a className="link" href={`mailto:${site.contact.email}`}>
          {site.contact.email}
        </a>
        {digest ? (
          <>
            {" "}
            and quote reference <code className="font-mono text-base">{digest}</code>
          </>
        ) : null}
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <a href={homeHref} className="inline-flex items-center px-3 text-[0.9375rem] underline underline-offset-4">
          Go back to the start
        </a>
      </div>
    </div>
  );
}
