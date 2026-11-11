import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{label}</p>
        {Icon ? <Icon className="size-4 text-muted" aria-hidden /> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}
