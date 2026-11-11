"use client";

import { motion, useScroll } from "motion/react";
import { useRef } from "react";

export interface TimelineStep {
  title: string;
  body: string;
  /** Short note such as who does the step or how long it usually takes. */
  note?: string;
}

/** A numbered sequence. The connecting line fills in as the reader scrolls through it. */
export function Timeline({ steps }: { steps: readonly TimelineStep[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden className="absolute top-3 bottom-3 left-[1.1875rem] w-px bg-border" />
      <motion.span aria-hidden className="absolute top-3 bottom-3 left-[1.1875rem] w-px origin-top bg-primary dark:bg-accent" style={{ scaleY: scrollYProgress }} />
      {steps.map((step, i) => (
        <li key={step.title} className="relative grid grid-cols-[2.5rem_1fr] gap-x-6 pb-10 last:pb-0">
          <span className="grid size-10 place-items-center rounded-full border border-border bg-background text-[0.9375rem] font-semibold tabular-nums">{i + 1}</span>
          <div className="pt-1.5">
            <h3 className="text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
            <p className="mt-2 max-w-[60ch] leading-relaxed text-muted">{step.body}</p>
            {step.note ? <p className="mt-2 text-sm font-medium">{step.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
