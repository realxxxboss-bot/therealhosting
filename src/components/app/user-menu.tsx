import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { initials } from "@/lib/utils";

export function UserMenu({ name, email, notificationsHref, unread }: { name: string; email: string; notificationsHref?: string; unread?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {notificationsHref ? (
        <Link href={notificationsHref} className="relative grid size-9 place-items-center rounded-[10px] text-muted hover:bg-surface-2 hover:text-foreground" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
          <Bell className="size-[18px]" aria-hidden />
          {unread ? <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" aria-hidden /> : null}
        </Link>
      ) : null}
      <div className="ml-1 hidden items-center gap-2 sm:flex">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground" aria-hidden>
          {initials(name)}
        </span>
        <span className="hidden flex-col leading-tight md:flex">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted">{email}</span>
        </span>
      </div>
      <form action={signOut}>
        <button type="submit" className="grid size-9 place-items-center rounded-[10px] text-muted hover:bg-surface-2 hover:text-foreground" aria-label="Sign out">
          <LogOut className="size-[18px]" aria-hidden />
        </button>
      </form>
    </div>
  );
}
