import type { ReactNode } from "react";
import Link from "next/link";
import type { Photo as PhotoData } from "@/config/photos";
import { Photo } from "@/components/motion/photo";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** A photograph beside a text column, 7/5. `flip` puts the photo on the right. */
export function PhotoRow({
  photo,
  children,
  flip = false,
  aspect = "aspect-[4/3]",
  position,
  className,
}: {
  photo: PhotoData;
  children: ReactNode;
  flip?: boolean;
  aspect?: string;
  position?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid items-center gap-8 lg:grid-cols-12 lg:gap-16", className)}>
      <Photo photo={photo} sizes="(min-width: 1024px) 58vw, 100vw" position={position} className={cn(aspect, "lg:col-span-7", flip && "lg:order-2")} />
      <Reveal className="lg:col-span-5">{children}</Reveal>
    </div>
  );
}

/** Title and body pairs as ruled rows. The typographic alternative to a grid of icon cards. */
export function RuledList({ items, className, invert = false, stacked = false }: { items: readonly { title: string; body: ReactNode }[]; className?: string; invert?: boolean; stacked?: boolean }) {
  return (
    <ul className={cn("border-t", invert ? "border-white/25" : "border-foreground", className)}>
      {items.map((item) => (
        <li key={item.title} className={cn("grid gap-x-10 gap-y-2 border-b py-6", !stacked && "md:grid-cols-12", invert ? "border-white/25" : "border-border")}>
          <h3 className={cn("text-xl font-semibold tracking-[-0.02em]", !stacked && "md:col-span-5")}>{item.title}</h3>
          <div className={cn("max-w-[62ch] leading-relaxed", !stacked && "md:col-span-7", invert ? "text-white/80" : "text-muted")}>{item.body}</div>
        </li>
      ))}
    </ul>
  );
}

/** Short plain lines separated by rules. For "what you get" lists. */
export function LineList({ items, className, columns = 1 }: { items: readonly string[]; className?: string; columns?: 1 | 2 }) {
  return (
    <ul className={cn("border-t border-border", columns === 2 && "sm:grid sm:grid-cols-2 sm:gap-x-10", className)}>
      {items.map((item) => (
        <li key={item} className="border-b border-border py-3.5">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Text link with an underline that thickens on hover. */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  if (external) {
    return (
      <a href={href} className={cn("link font-medium", className)} {...(href.startsWith("http") ? { rel: "noopener noreferrer", target: "_blank" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn("link font-medium", className)}>
      {children}
    </Link>
  );
}

/** A plain two-column split: narrow heading column, wide content column. */
export function Split({ heading, children, className }: { heading: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-10 lg:grid-cols-12 lg:gap-12", className)}>
      <div className="lg:col-span-4">{heading}</div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </div>
  );
}
