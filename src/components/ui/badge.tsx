import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      neutral: "bg-surface-2 text-muted",
      primary: "bg-primary-soft text-primary",
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

/** Status with a coloured dot and a text label. Never colour alone. */
export function StatusBadge({ tone, label, pulse = false }: { tone: BadgeTone; label: string; pulse?: boolean }) {
  return (
    <Badge tone={tone}>
      <span className="relative flex size-2">
        {pulse ? <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", dotColor[tone])} /> : null}
        <span className={cn("relative inline-flex size-2 rounded-full", dotColor[tone])} />
      </span>
      {label}
    </Badge>
  );
}
