import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "./json-ld";
import { Section } from "./section";

export interface FaqItem {
  q: string;
  a: string;
}

/** Questions as a ruled list. Answers open with a height transition (see `.faq` in globals.css). */
export function Faq({ items, withSchema = true }: { items: FaqItem[]; withSchema?: boolean }) {
  return (
    <div className="border-t border-foreground">
      {items.map((item) => (
        <details key={item.q} className="faq group border-b border-border [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-lg font-medium transition-colors duration-200 hover:text-primary dark:hover:text-accent">
            {item.q}
            <Plus className="mt-1 size-5 shrink-0 transition-transform duration-300 ease-[var(--ease-out)] group-open:rotate-45" aria-hidden />
          </summary>
          <p className="max-w-[62ch] pb-6 leading-relaxed text-muted">{item.a}</p>
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

/** FAQ block: heading on the left, questions on the right. */
export function FaqSection({ title = "Questions people ask us", body, items, tone = "plain" }: { title?: string; body?: ReactNode; items: FaqItem[]; tone?: "plain" | "sunk" }) {
  return (
    <Section tone={tone}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-4">
          <h2 className="text-h2 font-semibold">{title}</h2>
          {body ? <div className="mt-5 text-lg leading-relaxed text-muted">{body}</div> : null}
        </Reveal>
        <div className="lg:col-span-8">
          <Faq items={items} />
        </div>
      </div>
    </Section>
  );
}
