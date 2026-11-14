import Link from "next/link";
import { footerNav } from "@/config/marketing";
import { operatorStatement, site } from "@/config/site";
import { Logo } from "@/components/ui/logo";
import { SocialLinks } from "./social-links";

/** Ink block. Always dark, in both themes. */
export function SiteFooter() {
  const operator = operatorStatement();
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" aria-label={`${site.name} home`} className="inline-block text-white">
              <Logo />
            </Link>
            <p className="mt-5 max-w-xs text-small leading-relaxed text-white/70">
              Managed hosting for Next.js, WordPress and static sites. Servers in Germany (EU). A real person answers, every day.
            </p>
            <p className="mt-6 text-small">
              <a className="font-medium underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:decoration-white" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
            </p>
            <SocialLinks tone="dark" className="mt-3" />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={`${group.title} links`}>
                <p className="text-sm font-medium text-white/55">{group.title}</p>
                <ul className="mt-4 grid gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-small text-white/90 underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-white/70">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-3 border-t border-white/15 py-6 text-sm text-white/60 sm:mt-20 md:flex md:items-center md:justify-between">
          <p>
            © {site.copyrightYear} {site.name}
            {operator ? <span className="block text-white/50 md:inline md:before:content-['_·_']">{operator}</span> : null}
          </p>
          <p className="flex flex-wrap gap-x-2">
            <span>Prices in USD</span>
            <span aria-hidden>·</span>
            <span>Data stored in {site.dataRegionShort}</span>
            <span aria-hidden>·</span>
            <Link href="/credits" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
              Photo credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
