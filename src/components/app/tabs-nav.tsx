"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function TabsNav({ tabs, label }: { tabs: { href: string; label: string; exact?: boolean }[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-block px-3 py-2.5 text-[0.9375rem] transition-colors duration-150",
                  active ? "font-semibold text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {tab.label}
                {active ? <motion.span layoutId={`${label}-tab`} className="absolute inset-x-3 -bottom-px h-0.5 bg-primary dark:bg-accent" transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
