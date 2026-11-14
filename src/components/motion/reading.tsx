"use client";

import { motion, useScroll } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A thin bar under the header that fills as the reader moves through a long article. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div aria-hidden className="fixed inset-x-0 top-[4.5rem] z-30 h-0.5 origin-left bg-primary dark:bg-accent" style={{ scaleX: scrollYProgress }} />;
}

interface Heading {
  id: string;
  text: string;
}

/**
 * Wraps long-form content and lists its second-level headings beside it.
 * Heading ids come from the MDX pipeline (rehype-slug), so the links also work without JavaScript once rendered.
 */
export function ArticleWithContents({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const nodes = Array.from(ref.current?.querySelectorAll<HTMLHeadingElement>("h2[id]") ?? []);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );
    for (const node of nodes) observer.observe(node);
    const frame = requestAnimationFrame(() => setHeadings(nodes.map((n) => ({ id: n.id, text: n.textContent ?? "" }))));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-28">
          <p className="text-sm font-medium text-muted">On this page</p>
          <ul className="mt-4 grid gap-0.5 border-l border-border">
            {headings.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} aria-current={active === h.id ? "location" : undefined} className={cn("-ml-px block border-l py-1.5 pl-4 text-small transition-colors duration-200", active === h.id ? "border-primary font-medium text-foreground dark:border-accent" : "border-transparent text-muted hover:text-foreground")}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div ref={ref} className={cn("min-w-0 lg:col-span-8 lg:col-start-5", className)}>
        {children}
      </div>
    </div>
  );
}
