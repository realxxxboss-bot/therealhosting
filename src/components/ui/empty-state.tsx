import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-[14px] bg-primary-soft text-primary">
        <Icon className="size-6" aria-hidden />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
