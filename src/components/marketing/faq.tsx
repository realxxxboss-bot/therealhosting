import { ChevronDown } from "lucide-react";
import { JsonLd } from "./json-ld";

export function Faq({ items, withSchema = true }: { items: { q: string; a: string }[]; withSchema?: boolean }) {
  return (
    <div className="divide-y divide-border rounded-[16px] border border-border bg-surface">
      {items.map((item) => (
        <details key={item.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
            {item.q}
            <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
      {withSchema ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          }}
        />
      ) : null}
    </div>
  );
}
