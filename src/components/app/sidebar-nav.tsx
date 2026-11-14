"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { navIcons, type NavItem } from "./nav-icons";

export function SidebarNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="grid gap-0.5">
        {items.map((item, i) => {
          const Icon = navIcons[item.icon];
          const heading = item.group && item.group !== items[i - 1]?.group ? item.group : null;
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              {heading ? <p className={cn("px-3 pb-1 text-xs font-medium text-muted", i > 0 && "mt-4")}>{heading}</p> : null}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-[4px] px-3 py-2 text-[0.9375rem] transition-colors duration-150",
                  active ? "bg-surface-2 font-semibold text-foreground" : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {active ? <motion.span layoutId={`${label}-marker`} className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary dark:bg-accent" transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} /> : null}
                <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="min-w-5 rounded-full bg-foreground px-1.5 py-0.5 text-center text-[0.6875rem] leading-none font-semibold text-background tabular-nums">{item.badge}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
