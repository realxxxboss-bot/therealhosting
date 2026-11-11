import type { ReactNode } from "react";
import type { Photo as PhotoData } from "@/config/photos";
import { Photo } from "@/components/motion/photo";
import { HeroIntro } from "@/components/motion/hero-intro";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Page container. Width and rhythm are shared; backgrounds are set by the caller. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Section({ children, className, id, tone = "plain" }: { children: ReactNode; className?: string; id?: string; tone?: "plain" | "sunk" | "band" | "ink" }) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-24 lg:py-28",
        tone === "sunk" && "bg-surface-2",
        tone === "band" && "bg-band text-band-foreground",
        tone === "ink" && "bg-ink text-white",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** Section heading. Left-aligned; the optional kicker is plain text, not an all-caps label. */
export function SectionHeading({ kicker, title, body, className, invert = false }: { kicker?: string; title: string; body?: ReactNode; className?: string; invert?: boolean }) {
  return (
    <Reveal className={cn("max-w-2xl", className)}>
      {kicker ? <p className={cn("text-[0.9375rem] font-medium", invert ? "text-white/70" : "text-primary dark:text-accent")}>{kicker}</p> : null}
      <h2 className={cn("text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-[2.5rem]", kicker && "mt-3")}>{title}</h2>
      {body ? <div className={cn("mt-5 text-lg leading-relaxed", invert ? "text-white/80" : "text-muted")}>{body}</div> : null}
    </Reveal>
  );
}

/**
 * Inner-page hero. With a photo it becomes a 5/7 split; without one it is a plain,
 * left-aligned title block. No background decoration.
 */
export function PageHero({
  title,
  lines,
  body,
  children,
  photo,
  photoPosition,
}: {
  title: string;
  lines?: string[];
  body?: ReactNode;
  children?: ReactNode;
  photo?: PhotoData;
  photoPosition?: string;
}) {
  const heading = lines ?? [title];
  return (
    <div className="border-b border-border">
      <Container className={cn("grid gap-10 py-14 sm:py-20", photo && "lg:grid-cols-12 lg:items-end lg:gap-12")}>
        <HeroIntro lines={heading} className={cn(photo ? "lg:col-span-6 lg:pb-4" : "max-w-4xl")} headingClassName="text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.02] tracking-[-0.035em]">
          {body ? <div className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{body}</div> : null}
          {children}
        </HeroIntro>
        {photo ? <Photo photo={photo} priority sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] lg:col-span-6 lg:aspect-[5/4]" position={photoPosition} /> : null}
      </Container>
    </div>
  );
}
