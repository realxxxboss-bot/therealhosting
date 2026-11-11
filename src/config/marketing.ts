/**
 * Marketing copy. Kept out of components so it can be edited without touching layout code.
 * Voice: docs/BRAND.md. Never add invented numbers, reviews, logos or team members here.
 */
import type { SiteType } from "./plans";

export type IconName =
  | "rocket"
  | "shield"
  | "gauge"
  | "lifebuoy"
  | "tag"
  | "refresh"
  | "database"
  | "globe"
  | "lock"
  | "users"
  | "server"
  | "clock"
  | "zap"
  | "layers"
  | "mail"
  | "git"
  | "chart"
  | "check";

export interface Feature {
  icon: IconName;
  title: string;
  body: string;
}

export const mainNav = [
  { href: "/hosting/nextjs", label: "Next.js" },
  { href: "/hosting/wordpress", label: "WordPress" },
  { href: "/hosting/static", label: "Static" },
  { href: "/pricing", label: "Pricing" },
  { href: "/migration", label: "Free migration" },
  { href: "/features", label: "Why Zaffre" },
] as const;

export const footerNav = [
  {
    title: "Hosting",
    links: [
      { href: "/hosting/nextjs", label: "Next.js hosting" },
      { href: "/hosting/wordpress", label: "WordPress hosting" },
      { href: "/hosting/static", label: "Static hosting" },
      { href: "/pricing", label: "Pricing" },
      { href: "/domains", label: "Domain search" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/features", label: "Why Zaffre" },
      { href: "/migration", label: "Free migration" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/status", label: "System status" },
      { href: "/sign-in", label: "Client sign in" },
      { href: "/legal/sla", label: "Service levels" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/refund", label: "Refund Policy" },
      { href: "/legal/acceptable-use", label: "Acceptable Use" },
    ],
  },
] as const;

export const home = {
  hero: {
    eyebrow: "Managed hosting for Next.js, WordPress and static sites",
    title: "Your websites, hosted and looked after by real people.",
    body: "We deploy, update, back up and fix your sites on reserved cloud resources. One fixed price, no renewal jump, and a human who answers.",
    primaryCta: { href: "/pricing", label: "See plans" },
    secondaryCta: { href: "/migration", label: "Move my sites for free" },
    points: ["Free migration", "Same price on renewal", "Cancel any time"],
  },
  pillars: [
    { icon: "lifebuoy", title: "Fully managed", body: "We deploy, update, back up and fix. You get on with your business." },
    { icon: "server", title: "Reserved resources", body: "Your package gets its own CPU and memory allowance, so a noisy neighbour can't slow you down." },
    { icon: "tag", title: "Fixed pricing", body: "The price you sign up at is the price you renew at. No 4× renewal surprise." },
    { icon: "users", title: "Real people", body: "Talk to the engineers who run your sites, by ticket or WhatsApp." },
  ] satisfies Feature[],
  nextjs: {
    eyebrow: "First-class Next.js",
    title: "Next.js the way it was meant to run.",
    body: "Cheap shared hosts struggle with server rendering, API routes and background jobs. We run Next.js as a real Node.js app with a cache that understands it.",
    points: [
      "App Router, Server Actions and API routes",
      "ISR and on-demand revalidation with a persistent cache",
      "Scheduled cron jobs",
      "Image optimisation built in",
      "Git push to deploy, with instant rollbacks",
      "Environment variables per site, masked by default",
    ],
  },
  dashboard: {
    eyebrow: "Your dashboard",
    title: "Everything in one calm place.",
    body: "See every site, deploy, backup, invoice and ticket at a glance. Invite your developer with the right access, and remove it with one click.",
  },
  steps: [
    { title: "Tell us about your sites", body: "Send us your domains and where they are hosted today. That's all we need to start." },
    { title: "We move everything", body: "We copy your sites, test them on a private link, and switch DNS when you're happy. No downtime." },
    { title: "We look after it", body: "Updates, backups, SSL and monitoring run in the background. You get a short report, not a to-do list." },
  ],
  cta: {
    title: "Ready to stop worrying about hosting?",
    body: "Tell us about your sites. We'll suggest the right package and move everything for free.",
  },
};

export const features: { title: string; intro: string; groups: { title: string; items: Feature[] }[] } = {
  title: "Why Zaffre",
  intro:
    "Big hosts sell cheap first-year prices and leave the work to you. We do the opposite: a fair price that stays fair, and we do the work.",
  groups: [
    {
      title: "Managed for you",
      items: [
        { icon: "rocket", title: "Deploys handled", body: "Connect your Git repository or send us files. We set up builds, previews and rollbacks." },
        { icon: "refresh", title: "Updates and patches", body: "WordPress core, plugins, Node.js versions and server packages kept current and tested." },
        { icon: "database", title: "Daily off-site backups", body: "Backups are stored away from the server that runs your site. Ask us to restore any day in your plan." },
        { icon: "shield", title: "Security watch", body: "Firewall, rate limiting, malware scans for WordPress, and quick action if something looks wrong." },
      ],
    },
    {
      title: "Built for performance",
      items: [
        { icon: "server", title: "Reserved CPU and memory", body: "Each package has its own resource allowance on modern NVMe servers." },
        { icon: "globe", title: "Global CDN and free SSL", body: "Static files are cached close to your visitors. Certificates are issued and renewed automatically." },
        { icon: "zap", title: "Next.js-aware caching", body: "ISR, image optimisation and the data cache use persistent storage, not a temporary disk." },
        { icon: "chart", title: "Monitoring from outside", body: "We check your sites from outside our own network, so we hear about problems even if a server is down." },
      ],
    },
    {
      title: "Fair and transparent",
      items: [
        { icon: "tag", title: "No renewal jump", body: "Your price on day one is your price on renewal." },
        { icon: "users", title: "Free team seats", body: "Invite developers and your accountant with their own roles. No per-seat fees." },
        { icon: "lock", title: "Honest about data", body: "We tell you which region your data lives in. You own your content and can take it with you." },
        { icon: "lifebuoy", title: "People, not bots", body: "Support is handled by the people who run the servers." },
      ],
    },
  ],
};

export interface HostingPage {
  type: SiteType;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  features: Feature[];
  faq: { q: string; a: string }[];
}

export const hostingPages: Record<SiteType, HostingPage> = {
  nextjs: {
    type: "nextjs",
    title: "Managed Next.js hosting",
    metaTitle: "Managed Next.js hosting with ISR, cron and caching",
    metaDescription:
      "Run Next.js with API routes, ISR, cron and image optimisation on reserved resources. Fixed price, free migration from other platforms, real people on support.",
    intro:
      "Your Next.js apps run as full Node.js servers with a persistent cache, background jobs and preview deployments. We handle the platform so your developers can ship.",
    features: [
      { icon: "git", title: "Git push to deploy", body: "Connect GitHub, GitLab or Bitbucket. Every push builds; every branch can get a preview." },
      { icon: "zap", title: "ISR and revalidation", body: "Incremental Static Regeneration and on-demand revalidation with a cache that survives restarts." },
      { icon: "clock", title: "Cron jobs", body: "Schedule route handlers like you would on other platforms. We call them on time and log the result." },
      { icon: "layers", title: "Image optimisation", body: "next/image works out of the box, with caching so images are only processed once." },
      { icon: "lock", title: "Environment variables", body: "Per-site secrets, masked in the dashboard and never shown in logs." },
      { icon: "refresh", title: "Instant rollback", body: "Every deploy is kept. Roll back to any recent version in seconds." },
    ],
    faq: [
      { q: "Can you move my app from another Next.js platform?", a: "Yes, for free. We copy your environment variables, cron schedules and domains, test on a private link, then switch DNS with no downtime." },
      { q: "Which Next.js versions do you support?", a: "Current and previous major versions. We tell you before a version reaches end of life and can help you upgrade." },
      { q: "Is there a usage meter?", a: "No. Your plan has fair resource limits and a bandwidth allowance. If you outgrow it, we talk to you first. No surprise bills." },
      { q: "Do you support middleware/proxy and edge features?", a: "Proxy (middleware), route handlers, streaming and server actions all run on the Node.js runtime." },
    ],
  },
  wordpress: {
    type: "wordpress",
    title: "Managed WordPress hosting",
    metaTitle: "Managed WordPress hosting with updates and daily backups",
    metaDescription:
      "Fast, secure WordPress on reserved resources. We handle updates, backups, SSL and security. Fixed price with no renewal jump and free migration.",
    intro:
      "We keep WordPress fast and safe: server-level caching, tested updates, daily backups and a firewall. You keep full admin access.",
    features: [
      { icon: "refresh", title: "Safe updates", body: "Core, theme and plugin updates are applied and checked. If something breaks, we roll back." },
      { icon: "zap", title: "Server caching", body: "Page and object caching tuned for WordPress and WooCommerce." },
      { icon: "database", title: "Daily backups", body: "Files and database, stored off-site. Restores on request." },
      { icon: "shield", title: "Firewall and malware scans", body: "Bad bots and brute-force logins are blocked before they reach WordPress." },
      { icon: "layers", title: "Staging copy", body: "Ask for a staging site to test changes before they go live." },
      { icon: "mail", title: "Email that works", body: "Professional mailboxes on your domain and reliable sending for contact forms." },
    ],
    faq: [
      { q: "Do I keep full WordPress admin access?", a: "Yes. It's your site. We manage the server and updates around you." },
      { q: "Can I install any plugin?", a: "Almost all. A few plugins that duplicate our caching or backups are not needed; we'll tell you if one causes problems." },
      { q: "Do you support WooCommerce?", a: "Yes. Business and Pro plans have the room WooCommerce needs." },
    ],
  },
  static: {
    type: "static",
    title: "Static site hosting",
    metaTitle: "Static and HTML site hosting with global CDN and free SSL",
    metaDescription:
      "Host HTML, CSS and JavaScript sites on a global CDN with free SSL, form handling help and daily backups. Fixed price, free migration.",
    intro:
      "Simple sites deserve simple, fast hosting. Upload files or connect Git, and your site is served from a global CDN with SSL.",
    features: [
      { icon: "globe", title: "Global CDN", body: "Files are cached close to your visitors for fast first loads." },
      { icon: "lock", title: "Free SSL", body: "Certificates issued and renewed for every domain." },
      { icon: "git", title: "Git or upload", body: "Deploy from a repository or send us a zip. Both work." },
      { icon: "refresh", title: "Redirects and headers", body: "www to apex, old URLs to new ones, security headers: we set them up." },
    ],
    faq: [
      { q: "Do you support static site generators?", a: "Yes: Astro, Hugo, Eleventy, Jekyll and others. We run the build for you." },
      { q: "What about contact forms?", a: "We can wire your form to email or a form service. Ask support and we'll set it up." },
    ],
  },
};

export const pricingFaq: { q: string; a: string }[] = [
  { q: "Will my price go up when I renew?", a: "No. The price you sign up at is the price you renew at. If we ever change list prices, existing packages keep their price." },
  { q: "What does \"package\" mean?", a: "A package covers several sites of one type. For example, Next.js Business covers up to 5 Next.js apps. You can hold more than one package, for example one for Next.js and one for WordPress, on one bill." },
  { q: "Is migration really free?", a: "Yes, for every plan. We move your sites, test them on a private link and switch DNS when you approve." },
  { q: "How do I pay?", a: "Today we accept bank transfer and Wise. You upload proof of payment in the dashboard and we confirm it. Card payments are coming." },
  { q: "Can I cancel?", a: "Yes, any time. Monthly packages stop at the end of the month. See the Refund Policy for yearly packages." },
  { q: "What if I go over my limits?", a: "We contact you first. There are no automatic overage charges." },
  { q: "Do my developers need their own paid seats?", a: "No. Team access is free. Invite developers with access to only the sites they work on." },
  { q: "Do you register domains?", a: "Domain search is available now and registration is coming soon. Until then you keep your domain where it is and we connect it." },
];

export const migration = {
  title: "We move your sites for free",
  intro:
    "Moving hosts feels risky. We make it boring: we copy everything, test it on a private link, and switch over only when you say yes. Your old host keeps running until we're done.",
  steps: [
    { title: "Share access", body: "Tell us which sites to move and give temporary access to your current host, or invite us to your Git repository." },
    { title: "We copy and test", body: "We build each site on Zaffre, copy databases and files, and send you a private preview link." },
    { title: "You approve", body: "Click through your site. If anything looks different, we fix it before going live." },
    { title: "Zero-downtime switch", body: "We lower DNS TTLs in advance, switch records, and watch traffic until the old host is idle." },
    { title: "Clean up", body: "We confirm everything works, remove temporary access, and you cancel your old host." },
  ],
  from: ["Next.js platforms (Vercel, Netlify and others)", "Shared hosts with cPanel or hPanel", "WordPress-only hosts", "Static hosts and object storage"],
};

export const about = {
  title: "About Zaffre",
  paragraphs: [
    "Zaffre is a managed hosting company for businesses that want their websites to simply work.",
    "We started Zaffre because hosting had split into two bad choices: cheap shared plans that double in price at renewal and leave the work to you, or developer platforms that bill by the request and charge for every seat.",
    "We think there is a better middle: reserved cloud resources, a fair price that stays fair, and engineers who actually look after your sites. We deploy, update, back up and fix. When something needs your attention, a person tells you in plain words.",
    "The name comes from zaffre, a deep cobalt-blue pigment used for centuries to colour glass and ceramics that were made to last. That's the standard we hold ourselves to.",
  ],
  values: [
    { title: "Honest by default", body: "No fake urgency, no invented numbers, no hidden renewal prices." },
    { title: "Done for you", body: "If it's hosting work, it's our work." },
    { title: "Plain words", body: "We explain what happened and what's next, without jargon." },
  ],
};
