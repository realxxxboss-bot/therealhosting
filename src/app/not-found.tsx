import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative max-w-md text-center">
        <Link href="/" aria-label="Zaffre home" className="inline-block">
          <Logo />
        </Link>
        <p className="mt-10 font-display text-7xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">We couldn&apos;t find that page.</h1>
        <p className="mt-2 text-muted">The link may be old, or the page has moved. Everything else is running fine.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact support
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
