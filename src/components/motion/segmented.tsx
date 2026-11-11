"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** A radio group drawn as a segmented control. The selected marker slides between options. */
export function Segmented<T extends string>({ label, options, value, onChange, className }: { label: string; options: readonly { value: T; label: string }[]; value: T; onChange: (value: T) => void; className?: string }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex max-w-full rounded-[4px] border border-foreground/20 p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn("relative cursor-pointer rounded-[2px] px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200", selected ? "text-background" : "text-muted hover:text-foreground")}
          >
            {selected ? <motion.span layoutId={`${id}-marker`} className="absolute inset-0 rounded-[2px] bg-foreground" transition={{ type: "spring", stiffness: 500, damping: 40 }} /> : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
