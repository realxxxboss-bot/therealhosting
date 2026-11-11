import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <header className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Zaffre home">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main id="main" className="relative mx-auto grid max-w-md gap-6 px-4 pt-8 pb-16">
        {children}
      </main>
    </div>
  );
}
