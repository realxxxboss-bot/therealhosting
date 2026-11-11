import Link from "next/link";
import { photos } from "@/config/photos";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Photo } from "@/components/motion/photo";

/** Sign-in screens: the form sits on the page (no floating card), with a photograph beside it on wide screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex min-h-dvh flex-col px-4 sm:px-8 lg:px-12">
        <header className="flex h-[4.5rem] shrink-0 items-center justify-between">
          <Link href="/" aria-label="Zaffre home">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>
        <main id="main" className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-10">
          {children}
        </main>
        <p className="py-6 text-sm text-muted">
          Need help signing in?{" "}
          <Link href="/contact" className="link">
            Write to us
          </Link>
        </p>
      </div>
      <div className="hidden p-3 lg:block">
        <Photo photo={photos.signIn} priority drift={0} sizes="50vw" className="h-full min-h-[40rem]" />
      </div>
    </div>
  );
}
