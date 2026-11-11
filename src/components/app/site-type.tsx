import { siteTypes, type SiteType } from "@/config/plans";
import { cn } from "@/lib/utils";

const styles: Record<SiteType, string> = {
  nextjs: "bg-foreground text-background",
  wordpress: "bg-zaffre-100 text-zaffre-900 dark:bg-zaffre-900 dark:text-zaffre-100",
  static: "bg-surface-2 text-foreground border border-border",
};
const glyph: Record<SiteType, string> = { nextjs: "N", wordpress: "W", static: "</>" };

export function SiteTypeIcon({ type, className }: { type: SiteType; className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px] font-mono text-xs font-bold", styles[type], className)} aria-hidden>
      {glyph[type]}
    </span>
  );
}

export function siteTypeLabel(type: SiteType): string {
  return siteTypes[type].short;
}
