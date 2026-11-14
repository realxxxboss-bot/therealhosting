"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ChevronDown } from "lucide-react";
import { hostingNav, mainNav } from "@/config/marketing";
import { plansByType } from "@/config/plans";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { cn, formatUSD } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";

const ease = [0.22, 1, 0.36, 1] as const;
const linkClass = "relative flex h-[4.5rem] items-center px-3 text-small font-medium text-foreground/70 transition-colors duration-200 hover:text-foreground";

function ActiveRule() {
  return <motion.span layoutId="nav-rule" className="absolute inset-x-3 bottom-0 h-0.5 bg-primary dark:bg-accent" transition={{ duration: 0.3, ease }} />;
}

function HostingMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Return focus to the button so keyboard users don't lose their place.
      ref.current?.querySelector("button")?.focus();
    };
    // Close when keyboard focus moves out of the menu.
    const onFocus = (e: FocusEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("focusin", onFocus);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <li ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="true" aria-controls="hosting-menu" onClick={() => setOpen((v) => !v)} className={cn(linkClass, "cursor-pointer gap-1.5", (active || open) && "text-foreground")}>
        Hosting
        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} aria-hidden />
        {active ? <ActiveRule /> : null}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id="hosting-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease }}
            className="absolute top-full -left-3 w-[34rem] rounded-[8px] border border-border bg-surface p-2 shadow-[var(--shadow-pop)]"
          >
            <ul>
              {hostingNav.map((item) => {
                const from = Math.min(...plansByType(item.type).map((p) => p.monthly));
                return (
                  <li key={item.href}>
                    <Link href={item.href} className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 rounded-[4px] px-4 py-3.5 transition-colors duration-200 hover:bg-surface-2">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-sm text-muted">from {formatUSD(from)} a month</span>
                      <span className="col-span-2 mt-1 text-sm text-muted">{item.body}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-background transition-colors duration-200", scrolled ? "border-border" : "border-transparent")}>
      <div className="mx-auto flex h-[4.5rem] max-w-[1200px] items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Zaffre home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center">
            <HostingMenu active={pathname.startsWith("/hosting")} />
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className={cn(linkClass, active && "text-foreground")}>
                    {item.label}
                    {active ? <ActiveRule /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <ButtonLink href="/sign-in" variant="ghost" size="md" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="/contact" size="md">
            Talk to us
          </ButtonLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
