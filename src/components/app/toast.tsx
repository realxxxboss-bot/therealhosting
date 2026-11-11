"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "danger";
}

const ToastContext = createContext<(toast: Omit<Toast, "id">) => void>(() => {});

/** Shows a short confirmation in the corner after an action, so the page layout never jumps. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { ...toast, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), toast.tone === "danger" ? 7000 : 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.p
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn("pointer-events-auto flex max-w-sm items-start gap-3 rounded-[4px] bg-ink px-4 py-3 text-sm text-white shadow-[var(--shadow-pop)] dark:bg-surface-2 dark:text-foreground")}
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", toast.tone === "success" ? "bg-success" : "bg-danger")} aria-hidden />
              {toast.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
