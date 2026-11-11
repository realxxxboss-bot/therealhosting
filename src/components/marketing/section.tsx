import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, body, align = "left" }: { eyebrow?: string; title: string; body?: string; align?: "left" | "center" }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="text-sm font-semibold tracking-wide text-primary">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
      {body ? <p className="mt-4 text-lg text-muted">{body}</p> : null}
    </div>
  );
}

export function PageHero({ eyebrow, title, body, children }: { eyebrow?: string; title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        {eyebrow ? <p className="text-sm font-semibold tracking-wide text-primary">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {body ? <p className="mt-5 max-w-2xl text-lg text-muted">{body}</p> : null}
        {children}
      </div>
    </div>
  );
}
