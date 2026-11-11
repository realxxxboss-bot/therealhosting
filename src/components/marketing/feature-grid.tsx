import type { Feature } from "@/config/marketing";
import { FeatureIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function FeatureGrid({ items, columns = 3 }: { items: Feature[]; columns?: 2 | 3 | 4 }) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3", columns === 4 && "lg:grid-cols-4")}>
      {items.map((f) => (
        <li key={f.title} className="rounded-[16px] border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
          <FeatureIcon name={f.icon} />
          <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
        </li>
      ))}
    </ul>
  );
}
