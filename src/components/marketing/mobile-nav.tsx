"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileNav({ items }: { items: readonly { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="grid size-9 place-items-center rounded-[10px] hover:bg-surface-2"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open ? (
        <nav id="mobile-menu" aria-label="Mobile" className="absolute inset-x-0 top-16 border-b border-border bg-surface px-4 pt-2 pb-6 shadow-[var(--shadow-soft)]">
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block rounded-[10px] px-3 py-3 text-base hover:bg-surface-2">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/sign-in" className="rounded-[10px] border border-border px-4 py-3 text-center text-sm font-medium">
              Sign in
            </Link>
            <Link href="/contact" className="rounded-[10px] bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground">
              Talk to us
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
