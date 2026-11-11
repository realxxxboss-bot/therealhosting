import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 text-xs font-medium whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "bg-surface-2 text-muted",
      primary: "bg-primary-soft text-foreground",
      success: "bg-success-soft text-success",
      warning: "bg-warning-soft text-warning",
      danger: "bg-danger-soft text-danger",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export function Badge({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const dotColor: Record<BadgeTone, string> = {
  neutral: "bg-muted",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/**
 * Status as a coloured dot and a plain text label. Never colour alone, and no filled pill:
 * a table of statuses should read as text, with only the problems catching the eye.
 */
export function StatusBadge({ tone, label, pulse = false }: { tone: BadgeTone; label: string; pulse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap", tone === "neutral" && "text-muted", tone === "danger" && "text-danger")}>
      <span className="relative flex size-2">
        {pulse ? <span className={cn("absolute hidden size-full rounded-full opacity-60 motion-safe:inline-flex motion-safe:animate-ping", dotColor[tone])} /> : null}
        <span className={cn("relative inline-flex size-2 rounded-full", dotColor[tone])} />
      </span>
      {label}
    </span>
  );
}
