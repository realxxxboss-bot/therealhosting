import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: { box: "border-zaffre-200 bg-primary-soft text-foreground dark:border-zaffre-800", icon: Info, iconClass: "text-primary" },
  success: { box: "border-success/30 bg-success-soft", icon: CheckCircle2, iconClass: "text-success" },
  warning: { box: "border-warning/30 bg-warning-soft", icon: AlertTriangle, iconClass: "text-warning" },
  danger: { box: "border-danger/30 bg-danger-soft", icon: XCircle, iconClass: "text-danger" },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-[12px] border p-4 text-sm", t.box, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", t.iconClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn("text-foreground/85", title && "mt-0.5")}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}
