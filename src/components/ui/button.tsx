import Link from "next/link";
import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[4px] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-[var(--ease-out)] active:translate-y-px active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "border border-foreground/20 bg-transparent text-foreground hover:border-foreground hover:bg-foreground/[0.03]",
        ghost: "text-foreground hover:bg-surface-2",
        soft: "bg-primary-soft text-foreground hover:bg-zaffre-200/60 dark:hover:bg-zaffre-900",
        danger: "bg-danger text-white hover:opacity-90 dark:text-background",
        link: "h-auto px-0 text-primary underline decoration-1 underline-offset-4 hover:decoration-2",
        inverse: "bg-white text-zaffre-700 hover:bg-zaffre-50",
        "inverse-outline": "border border-white/40 text-white hover:border-white hover:bg-white/10",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
