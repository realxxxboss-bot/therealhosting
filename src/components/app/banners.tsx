import { stopImpersonating } from "@/app/actions/auth";

export function DemoBanner() {
  return (
    <div className="border-b border-border bg-surface-2 px-4 py-1.5 text-center text-xs text-muted sm:px-6">
      Demo mode: you&apos;re looking at sample data. Changes are kept until the server restarts.
    </div>
  );
}

export function ImpersonationBanner({ adminName, clientName }: { adminName: string; clientName: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-warning px-4 py-2 text-sm font-medium text-white dark:text-background">
      <span>
        {adminName}, you are signed in as {clientName}. Every action is recorded in the audit log.
      </span>
      <form action={stopImpersonating}>
        <button type="submit" className="rounded-[8px] bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30">
          Return to admin
        </button>
      </form>
    </div>
  );
}
