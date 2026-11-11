import { cn } from "@/lib/utils";

/** Brand mark. Same geometry as public/brand/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8", className)} aria-hidden focusable="false">
      <defs>
        <linearGradient id="zf-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2A3BF0" />
          <stop offset="0.55" stopColor="#0014A8" />
          <stop offset="1" stopColor="#0A0F5C" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#zf-mark)" />
      <path d="M17 16.5h30v7.2L29.4 40.3H47v7.2H17v-7.2l17.6-16.6H17z" fill="#fff" />
      <rect x="40.5" y="40.3" width="6.5" height="7.2" rx="1.2" fill="#38D6F5" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-xl font-extrabold tracking-[-0.04em]">zaffre</span>
    </span>
  );
}
