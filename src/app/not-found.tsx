import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

const places = [
  { href: "/pricing", label: "Pricing" },
  { href: "/hosting/nextjs", label: "Next.js hosting" },
  { href: "/hosting/wordpress", label: "WordPress hosting" },
  { href: "/migration", label: "Free migration" },
  { href: "/status", label: "System status" },
  { href: "/sign-in", label: "Client sign in" },
];

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-[1200px] flex-col px-4 sm:px-6 lg:px-8">
      <div className="flex h-[4.5rem] items-center">
        <Link href="/" aria-label="Zaffre home">
          <Logo />
        </Link>
      </div>
      <div className="grid flex-1 content-center gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-small font-medium text-muted">Error 404</p>
          <h1 className="mt-4 text-title font-semibold">That page is not here.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">The link may be old, or the page has moved. Nothing is broken on your side.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/" size="lg">
              Go to the home page
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Tell us what you were looking for
            </ButtonLink>
          </div>
        </div>
        <nav aria-label="Useful pages" className="lg:col-span-4 lg:col-start-9">
          <p className="font-semibold">Places people usually want</p>
          <ul className="mt-4 border-t border-foreground">
            {places.map((place) => (
              <li key={place.href} className="border-b border-border">
                <Link href={place.href} className="block py-3.5 transition-colors duration-200 hover:text-primary dark:hover:text-accent">
                  {place.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
