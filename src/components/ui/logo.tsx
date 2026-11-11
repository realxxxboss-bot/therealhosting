import { cn } from "@/lib/utils";

/** Brand mark: a flat zaffre tile with a white Z. Same geometry as public/brand/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8", className)} aria-hidden focusable="false">
      <rect width="64" height="64" rx="8" fill="#0014A8" />
      <path d="M17 16.5h30v7.2L29.4 40.3H47v7.2H17v-7.2l17.6-16.6H17z" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-7" />
      <span className="font-display text-[1.375rem] leading-none font-bold tracking-[-0.045em]">zaffre</span>
    </span>
  );
}
