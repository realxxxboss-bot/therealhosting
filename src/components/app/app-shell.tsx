import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "./theme-toggle";
import { SidebarNav } from "./sidebar-nav";
import { MobileSidebar } from "./mobile-sidebar";
import type { NavItem } from "./nav-icons";

/** Shared frame for the client dashboard and the admin panel. */
export function AppShell({
  nav,
  navLabel,
  homeHref,
  sidebarTop,
  sidebarBottom,
  topbarRight,
  banners,
  children,
}: {
  nav: NavItem[];
  navLabel: string;
  homeHref: string;
  sidebarTop?: ReactNode;
  sidebarBottom?: ReactNode;
  topbarRight?: ReactNode;
  banners?: ReactNode;
  children: ReactNode;
}) {
  const sidebar = (
    <div className="flex h-full flex-col gap-5">
      {sidebarTop}
      <SidebarNav items={nav} label={navLabel} />
      <div className="mt-auto">{sidebarBottom}</div>
    </div>
  );
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-border bg-surface px-4 py-5 lg:block">
        <Link href={homeHref} className="mb-6 block px-2" aria-label="Dashboard home">
          <Logo />
        </Link>
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-lg sm:px-6">
          <MobileSidebar>{sidebar}</MobileSidebar>
          <Link href={homeHref} className="lg:hidden" aria-label="Dashboard home">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            {topbarRight}
          </div>
        </header>
        {banners}
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh" role="status" aria-busy="true" aria-label="Loading">
      <div className="hidden w-64 border-r border-border bg-surface lg:block" />
      <div className="flex-1 p-8">
        <div className="h-7 w-48 animate-pulse rounded-md bg-surface-2" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[16px] bg-surface-2" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-56 animate-pulse rounded-md bg-surface-2" />
      <div className="mt-2 h-4 w-80 animate-pulse rounded-md bg-surface-2" />
      <div className="mt-8 h-64 animate-pulse rounded-[16px] bg-surface-2" />
    </div>
  );
}
