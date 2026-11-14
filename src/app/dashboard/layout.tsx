import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AppShell, ShellSkeleton } from "@/components/app/app-shell";
import { UserMenu } from "@/components/app/user-menu";
import { DemoBanner, ImpersonationBanner } from "@/components/app/banners";
import type { NavItem } from "@/components/app/nav-icons";
import { getViewer } from "@/lib/auth/viewer";
import { switchAccount } from "@/app/actions/auth";
import { hasCapability, listNotifications, listTickets, getAnnouncement } from "@/lib/data/client";
import { adapterMode } from "@/lib/adapters";
import { roleLabels } from "@/lib/auth/permissions";
import { Alert } from "@/components/ui/alert";

export const instant = false;

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <DashboardFrame>{children}</DashboardFrame>
    </Suspense>
  );
}

async function DashboardFrame({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  const unread = (await listNotifications(viewer)).filter((n) => !n.read).length;
  const openTickets = (await listTickets(viewer)).filter((t) => t.status === "awaiting_client").length;
  const announcement = await getAnnouncement();

  const nav: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "overview", exact: true },
    ...(hasCapability(viewer, "sites:view") ? [{ href: "/dashboard/sites", label: "Sites", icon: "sites" } as const] : []),
    ...(hasCapability(viewer, "domains:manage") ? [{ href: "/dashboard/domains", label: "Domains", icon: "domains" } as const] : []),
    ...(hasCapability(viewer, "email:manage") ? [{ href: "/dashboard/email", label: "Email", icon: "email" } as const] : []),
    ...(hasCapability(viewer, "billing:view") ? [{ href: "/dashboard/billing", label: "Billing", icon: "billing" } as const] : []),
    { href: "/dashboard/support", label: "Support", icon: "support", badge: openTickets || undefined },
    ...(hasCapability(viewer, "team:manage") ? [{ href: "/dashboard/team", label: "Team", icon: "team" } as const] : []),
    { href: "/dashboard/notifications", label: "Notifications", icon: "notifications", badge: unread || undefined },
    { href: "/dashboard/account", label: "Account", icon: "account" },
  ];

  const accountSwitcher = (
    <div className="border-y border-border px-2 py-3">
      <p className="text-xs text-muted">Account</p>
      {viewer.accounts.length > 1 ? (
        <form action={switchAccount} className="mt-1 flex gap-2">
          <label htmlFor="accountId" className="sr-only">
            Switch account
          </label>
          <select id="accountId" name="accountId" defaultValue={viewer.account.id} className="min-w-0 flex-1 rounded-[4px] border border-border bg-surface px-2 py-1 text-sm">
            {viewer.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button type="submit" className="cursor-pointer rounded-[4px] border border-border px-3 py-1 text-sm font-medium hover:bg-surface-2">
            Switch
          </button>
        </form>
      ) : (
        <p className="mt-0.5 truncate text-sm font-semibold">{viewer.account.name}</p>
      )}
      <p className="mt-1 text-xs text-muted">Your role: {roleLabels[viewer.membership.role].label}</p>
    </div>
  );

  return (
    <AppShell
      nav={nav}
      navLabel="Dashboard"
      homeHref="/dashboard"
      sidebarTop={accountSwitcher}
      topbarRight={<UserMenu name={viewer.user.name} email={viewer.user.email} notificationsHref="/dashboard/notifications" unread={unread} />}
      banners={
        <>
          {viewer.impersonator ? <ImpersonationBanner adminName={viewer.impersonator.name} clientName={viewer.account.name} /> : null}
          {adapterMode() === "mock" ? <DemoBanner /> : null}
          {viewer.account.status === "suspended" ? (
            <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
              <Alert tone="warning">This account is suspended, so changes to sites, domains, mailboxes and team are paused. You can still pay invoices and open a support ticket, and we will restore it.</Alert>
            </div>
          ) : null}
          {announcement ? (
            <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
              <Alert tone={announcement.tone}>{announcement.message}</Alert>
            </div>
          ) : null}
        </>
      }
    >
      {children}
    </AppShell>
  );
}
