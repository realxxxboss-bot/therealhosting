import type { SiteType } from "@/config/plans";
import { cn } from "@/lib/utils";

/**
 * What each kind of hosting looks like from the inside, drawn as plain text instead of a stock photo.
 * Static markup, readable by screen readers as a figure with a caption. The content mirrors what the
 * dashboard really shows; it is an illustration, so it uses example names, never a real client.
 */
export function ProductVisual({ type, className }: { type: SiteType; className?: string }) {
  const visual = visuals[type];
  return (
    <figure className={cn("overflow-hidden rounded-[8px] border border-zaffre-900 bg-zaffre-950 text-white", className)}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-white/25" aria-hidden />
        <span className="size-2.5 rounded-full bg-white/25" aria-hidden />
        <span className="size-2.5 rounded-full bg-white/25" aria-hidden />
        <span className="ml-2 font-mono text-xs text-white/60">{visual.title}</span>
      </div>
      <div className="px-5 py-5 font-mono text-[0.8125rem] leading-7 sm:px-6 sm:text-sm">{visual.body}</div>
      <figcaption className="sr-only">{visual.caption}</figcaption>
    </figure>
  );
}

const ok = "text-[#7ee2a8]";
const dim = "text-white/55";
const accent = "text-zaffre-300";

const visuals: Record<SiteType, { title: string; caption: string; body: React.ReactNode }> = {
  nextjs: {
    title: "deploy · example-shop",
    caption: "Illustration of a Next.js deploy: a git push, the build passing, and the new version going live.",
    body: (
      <ol className="grid">
        <li>
          <span className={dim}>$</span> git push origin main
        </li>
        <li className={dim}>→ Building with Node 22 · next build</li>
        <li className={dim}>→ Compiled 48 routes, 6 cached with ISR</li>
        <li>
          <span className={ok}>✓</span> Build passed <span className={dim}>· 1m 12s</span>
        </li>
        <li>
          <span className={ok}>✓</span> Health check passed
        </li>
        <li>
          <span className={ok}>●</span> Live on <span className={accent}>example-shop.com</span>
        </li>
        <li className={dim}>Previous version kept for rollback</li>
      </ol>
    ),
  },
  wordpress: {
    title: "updates · example-bakery.com",
    caption: "Illustration of a WordPress update log: a backup first, then core and plugin updates, each checked.",
    body: (
      <ol className="grid">
        <li>
          <span className={ok}>✓</span> Backup taken <span className={dim}>· 02:00</span>
        </li>
        <li>
          <span className={ok}>✓</span> WordPress core updated
        </li>
        <li>
          <span className={ok}>✓</span> WooCommerce updated
        </li>
        <li>
          <span className={ok}>✓</span> Contact form plugin updated
        </li>
        <li>
          <span className={ok}>✓</span> Pages checked: home, shop, checkout
        </li>
        <li className={dim}>Next check tomorrow at 02:00</li>
      </ol>
    ),
  },
  static: {
    title: "domain · example-studio.com",
    caption: "Illustration of the DNS records for a static site, with SSL issued and the site live.",
    body: (
      <div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className={dim}>
              <th scope="col" className="pr-4 font-normal">Type</th>
              <th scope="col" className="pr-4 font-normal">Name</th>
              <th scope="col" className="font-normal">Points to</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pr-4">CNAME</td>
              <td className="pr-4">www</td>
              <td className={accent}>edge.zaffrehost.com</td>
            </tr>
            <tr>
              <td className="pr-4">A</td>
              <td className="pr-4">@</td>
              <td className={accent}>edge address</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4">
          <span className={ok}>✓</span> DNS found
        </p>
        <p>
          <span className={ok}>✓</span> SSL certificate issued
        </p>
        <p>
          <span className={ok}>●</span> Live, served from the CDN
        </p>
      </div>
    ),
  },
};

/** A text-and-visual row, the same layout as PhotoRow but with a product visual instead of a photograph. */
export function VisualRow({ type, flip = false, children }: { type: SiteType; flip?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-16">
      <ProductVisual type={type} className={cn("lg:col-span-7", flip && "lg:order-2")} />
      <div className="lg:col-span-5">{children}</div>
    </div>
  );
}
