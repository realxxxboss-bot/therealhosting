import Link from "next/link";
import { footerNav } from "@/config/marketing";
import { site } from "@/config/site";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-muted">{site.positioning}</p>
          <p className="mt-4 text-sm text-muted">
            <a className="hover:text-foreground" href={`mailto:${site.contact.supportEmail}`}>
              {site.contact.supportEmail}
            </a>
          </p>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-semibold">{group.title}</h2>
            <ul className="mt-3 grid gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted sm:px-6">
          <p>
            © {site.copyrightYear} {site.name}. All prices in USD.
          </p>
          <p>Data stored in: {site.dataRegions.join(", ")}</p>
        </div>
      </div>
    </footer>
  );
}
