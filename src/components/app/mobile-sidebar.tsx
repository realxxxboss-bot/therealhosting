"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

/** Off-canvas wrapper for the app sidebar on small screens. */
export function MobileSidebar({ children }: { children: ReactNode }) {
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
      <button type="button" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-[4px] hover:bg-surface-2" aria-label="Open navigation" aria-expanded={open}>
        <Menu className="size-5" aria-hidden />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="absolute inset-0 bg-zaffre-950/40" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-border bg-surface p-4">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-[4px] hover:bg-surface-2" aria-label="Close navigation">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
