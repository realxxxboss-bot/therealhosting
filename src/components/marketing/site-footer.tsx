import Link from "next/link";
import { footerNav } from "@/config/marketing";
import { site } from "@/config/site";
import { LogoMark } from "@/components/ui/logo";

/** Ink block. Always dark, in both themes. */
export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-sm text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.025em]">Hosting that someone actually looks after.</p>
            <p className="mt-6 max-w-sm text-white/65">Write to us and a person replies. No ticket robots, no sales script.</p>
            <ul className="mt-6 grid gap-1.5 text-[0.9375rem]">
              <li>
                <a className="underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:decoration-white" href={`mailto:${site.contact.salesEmail}`}>
                  {site.contact.salesEmail}
                </a>
                <span className="text-white/55"> for new sites and questions</span>
              </li>
              <li>
                <a className="underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:decoration-white" href={`mailto:${site.contact.supportEmail}`}>
                  {site.contact.supportEmail}
                </a>
                <span className="text-white/55"> for existing clients</span>
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-7">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-sm font-medium tracking-normal text-white/55">{group.title}</h2>
                <ul className="mt-4 grid gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[0.9375rem] text-white/90 underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-white/70">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-white/15 py-6 text-sm text-white/60 sm:mt-24">
          <p className="flex items-center gap-3">
            <LogoMark className="size-6" />
            <span>
              © {site.copyrightYear} {site.name}
            </span>
          </p>
          <p>All prices in US dollars. The price you start on is the price you renew at.</p>
          <p>Client data is stored in {site.dataRegionShort}.</p>
        </div>
      </div>
    </footer>
  );
}
