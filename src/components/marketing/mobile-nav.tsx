"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, stagger } from "motion/react";
import { Menu, X } from "lucide-react";
import { hostingNav, mainNav } from "@/config/marketing";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } };
const links = [...hostingNav.map((l) => ({ href: l.href, label: l.label })), ...mainNav, { href: "/contact", label: "Contact" }];

/** Full-height menu for small screens: locks page scroll, traps focus and closes on Escape or navigation. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  const trigger = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const opener = trigger.current;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    sheet.current?.querySelector<HTMLElement>("button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !sheet.current) return;
      const focusable = sheet.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button ref={trigger} type="button" className="grid size-10 cursor-pointer place-items-center rounded-[4px] hover:bg-surface-2" aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
        <Menu className="size-5" aria-hidden />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={sheet}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
          >
            <div className="flex h-[4.5rem] shrink-0 items-center justify-between px-4 sm:px-6">
              <Link href="/" aria-label="Zaffre home">
                <Logo />
              </Link>
              <button type="button" className="grid size-10 cursor-pointer place-items-center rounded-[4px] hover:bg-surface-2" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <motion.nav aria-label="Mobile" className="flex-1 px-4 pt-4 sm:px-6" initial="hidden" animate="show" variants={{ show: { transition: { delayChildren: stagger(0.035, { startDelay: 0.05 }) } } }}>
              <ul className="border-t border-border">
                {links.map((link) => (
                  <motion.li key={link.href} variants={item} className="border-b border-border">
                    <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="flex items-center justify-between py-4 text-[1.375rem] font-semibold tracking-[-0.02em] aria-[current=page]:text-primary dark:aria-[current=page]:text-accent">
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
            <div className="grid grid-cols-2 gap-3 px-4 py-6 sm:px-6">
              <ButtonLink href="/sign-in" variant="secondary" size="lg">
                Sign in
              </ButtonLink>
              <ButtonLink href="/contact" size="lg">
                Talk to us
              </ButtonLink>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
