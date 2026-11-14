"use client";

import { ErrorPanel } from "@/components/app/error-panel";

export default function SectionError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorPanel error={error} retry={retry} homeHref="/admin" />;
}
