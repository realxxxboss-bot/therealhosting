import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AppShell, ShellSkeleton } from "@/components/app/app-shell";
import { UserMenu } from "@/components/app/user-menu";
import { DemoBanner } from "@/components/app/banners";
import type { NavItem } from "@/components/app/nav-icons";
import { getAdminSession } from "@/lib/auth/viewer";
import { adminNeedsTwoFactor } from "@/lib/auth/session";
import { loadAdminStore } from "@/lib/data/admin";
import { adapterMode } from "@/lib/adapters";

export const instant = false;

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}

async function AdminFrame({ children }: { children: ReactNode }) {
  const admin = await getAdminSession();
  // Until two-factor is on, the only page available is the account page that sets it up.
  if (adminNeedsTwoFactor(admin)) {
    return (
      <AppShell nav={[{ href: "/admin/account", label: "Your account", icon: "account" }]} navLabel="Admin" homeHref="/admin/account" topbarRight={<UserMenu name={admin.name} email={admin.email} />}>
        {children}
      </AppShell>
    );
  }
  const store = await loadAdminStore();
  const pendingPayments = store.payments.filter((p) => p.status === "pending_verification").length;
  const openTickets = store.tickets.filter((t) => t.status === "open").length;
  const restores = store.restoreRequests.filter((r) => r.status !== "done").length;

  const nav: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "overview", exact: true, group: "Work" },
    { href: "/admin/tickets", label: "Tickets", icon: "support", badge: openTickets || undefined, group: "Work" },
    { href: "/admin/payments", label: "Payment checks", icon: "payments", badge: pendingPayments || undefined, group: "Work" },
    { href: "/admin/backups", label: "Backups", icon: "backups", badge: restores || undefined, group: "Work" },
    { href: "/admin/clients", label: "Clients", icon: "clients", group: "Clients" },
    { href: "/admin/sites", label: "Sites", icon: "sites", group: "Clients" },
    { href: "/admin/invoices", label: "Invoices", icon: "invoices", group: "Clients" },
    { href: "/admin/fleet", label: "Servers", icon: "fleet", group: "Platform" },
    { href: "/admin/plans", label: "Plans", icon: "plans", group: "Platform" },
    { href: "/admin/payment-methods", label: "Payment methods", icon: "methods", group: "Platform" },
    { href: "/admin/templates", label: "Email templates", icon: "templates", group: "Platform" },
    { href: "/admin/announcements", label: "Announcement", icon: "announcements", group: "Platform" },
    { href: "/admin/audit", label: "Audit log", icon: "audit", group: "Platform" },
    { href: "/admin/account", label: "Your account", icon: "account", group: "Platform" },
  ];


  return (
    <AppShell
      nav={nav}
      navLabel="Admin"
      homeHref="/admin"
      sidebarTop={
        <div className="border-y border-border px-2 py-3">
          <p className="text-xs text-muted">Workspace</p>
          <p className="mt-0.5 text-sm font-semibold">Zaffre admin</p>
          <p className="mt-1 text-xs text-muted">Staff only. Every action is logged.</p>
        </div>
      }
      topbarRight={<UserMenu name={admin.name} email={admin.email} />}
      banners={adapterMode() === "mock" ? <DemoBanner /> : null}
    >
      {children}
    </AppShell>
  );
}
