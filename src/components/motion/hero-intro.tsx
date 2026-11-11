"use client";

import { motion, stagger } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/**
 * The one orchestrated page-load moment: headline lines rise in sequence,
 * then the supporting content. Server-rendered text stays in the HTML.
 */
export function HeroIntro({ lines, children, className, headingClassName }: { lines: string[]; children?: ReactNode; className?: string; headingClassName?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ show: { transition: { delayChildren: stagger(0.09) } } }}>
      <h1 className={cn("text-display font-semibold text-balance", headingClassName)}>
        {lines.map((line) => (
          <motion.span key={line} variants={item} className="block">
            {line}
          </motion.span>
        ))}
      </h1>
      {children ? <motion.div variants={item}>{children}</motion.div> : null}
    </motion.div>
  );
}
