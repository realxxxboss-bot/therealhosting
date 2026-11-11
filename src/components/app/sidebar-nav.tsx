"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navIcons, type NavItem } from "./nav-icons";

export function SidebarNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="grid gap-0.5">
        {items.map((item) => {
          const Icon = navIcons[item.icon];
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors",
                  active ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none font-semibold text-primary-foreground">{item.badge}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
