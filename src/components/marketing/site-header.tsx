import Link from "next/link";
import { mainNav } from "@/config/marketing";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="Zaffre home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-[8px] px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/sign-in" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="/contact" size="sm" className="hidden sm:inline-flex">
            Talk to us
          </ButtonLink>
          <MobileNav items={mainNav} />
        </div>
      </div>
    </header>
  );
}
