/**
 * Marketing copy. Kept out of components so it can be edited without touching layout code.
 * Voice: docs/BRAND.md. Never add invented numbers, reviews, logos or team members here.
 */
import type { SiteType } from "./plans";
import type { PhotoKey } from "./photos";

export interface Feature {
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const hostingNav = [
  { href: "/hosting/nextjs", type: "nextjs", label: "Next.js hosting", body: "Server rendering, API routes, ISR and cron jobs, run as a real Node.js app." },
  { href: "/hosting/wordpress", type: "wordpress", label: "WordPress hosting", body: "Updates, backups, caching and security checks done for you." },
  { href: "/hosting/static", type: "static", label: "Static hosting", body: "HTML and generator-built sites on a global CDN with free SSL." },
] as const;

export const mainNav = [
  { href: "/pricing", label: "Pricing" },
  { href: "/migration", label: "Free migration" },
  { href: "/features", label: "Why Zaffre" },
  { href: "/domains", label: "Domains" },
  { href: "/blog", label: "Blog" },
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
      { href: "/credits", label: "Photo credits" },
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
    lines: ["Your websites,", "looked after", "by real people."],
    title: "Your websites, looked after by real people.",
    body: "Zaffre hosts Next.js, WordPress and static sites and does the hosting work for you: deploys, updates, backups and fixes. One fixed price that does not jump when you renew.",
    primaryCta: { href: "/pricing", label: "See plans" },
    secondaryCta: { href: "/migration", label: "Move my sites for free" },
    facts: [
      { title: "Free migration", body: "We move every site and test it before the switch." },
      { title: "Same price on renewal", body: "The price you start on is the price you keep." },
      { title: "No seat fees", body: "Invite your developers and your accountant at no cost." },
      { title: "Cancel any time", body: "Monthly packages stop at the end of the month." },
    ],
  },
  why: {
    title: "Hosting split into two bad choices. We built the one in between.",
    body: "Cheap shared plans look good for a year, then renew at several times the price and leave the work to you. Developer platforms are excellent, but they bill for every seat and every spike. Most businesses want neither. They want the site to work, a bill they can predict, and someone to call.",
    columns: ["Cheap shared hosting", "Developer platforms", "Zaffre"],
    rows: [
      { label: "The price", values: ["Low for the first term, several times higher at renewal", "Per developer seat, with usage billed on top", "One fixed price, the same at renewal"] },
      { label: "The work", values: ["Yours: updates, fixes and moving in", "Yours, and you need a developer to do it", "Ours: deploys, updates, backups and fixes"] },
      { label: "Your team", values: ["One login that everyone shares", "Every extra seat is paid", "Free seats, each with their own role"] },
    ],
  },
  types: [
    {
      type: "nextjs",
      photo: "nextjs",
      title: "Next.js, run as a real server",
      body: "Cheap shared hosts struggle with server rendering, API routes and background jobs. We run each Next.js app as a full Node.js server with a cache that understands it.",
      points: ["App Router, Server Actions and API routes", "ISR and on-demand revalidation with a cache that survives restarts", "Scheduled cron jobs, called on time and logged", "Git push to deploy, with a rollback to any recent version"],
    },
    {
      type: "wordpress",
      photo: "wordpress",
      title: "WordPress, kept fast and patched",
      body: "The shop, the booking site, the blog that brings in the enquiries. We keep WordPress quick and safe in the background, and you keep full admin access.",
      points: ["Core, theme and plugin updates applied and checked", "A backup every day, stored away from the server", "A firewall and malware scans in front of your login page", "Room for WooCommerce on Business and Pro"],
    },
    {
      type: "static",
      photo: "static",
      title: "Static sites, simply served",
      body: "Portfolios, landing pages and brochure sites should be the easy part. Send us the files or connect a repository and they are served from a global CDN.",
      points: ["Global CDN and free SSL on every domain", "Deploy from Git, or send us a zip", "We run the build for Astro, Hugo, Eleventy and Jekyll", "Redirects and security headers set up for you"],
    },
  ] satisfies { type: SiteType; photo: PhotoKey; title: string; body: string; points: string[] }[],
  managed: {
    title: "What \"managed\" means here",
    body: "A lot of hosts use the word. This is the actual split of work between us.",
    weDo: [
      "Move your sites in, for free",
      "Set up builds, deploys and rollbacks",
      "Apply updates and security patches",
      "Take a backup every day and store it off-site",
      "Issue and renew SSL certificates",
      "Watch your sites from outside our own network",
      "Fix it when something breaks",
      "Tell you in plain words what happened",
    ],
    youDo: ["Run your business", "Tell us what you want changed", "Approve the things only you can decide"],
  },
  steps: [
    { title: "Tell us about your sites", body: "Send us your domains and where they are hosted today. That is all we need to start." },
    { title: "We move everything", body: "We copy your sites, test them on a private link, and switch DNS when you are happy. Your old host keeps running until then." },
    { title: "We look after it", body: "Updates, backups, SSL and monitoring run in the background. You hear from us when something needs your decision." },
  ],
  dashboard: {
    title: "Everything in one calm place.",
    body: "One dashboard for every site, deploy, backup, invoice and support ticket. This is the real thing, not a drawing. You can open the demo and click around.",
    points: [
      { title: "Every site at a glance", body: "Status, last deploy and last backup for each site, with anything that needs you at the top." },
      { title: "Access for your people", body: "Invite a developer to only the sites they work on, and your accountant to billing only. Remove access with one click." },
      { title: "Bills you can read", body: "Each invoice lists your packages and their fixed prices. Upload proof of payment and we confirm it." },
    ],
  },
  pricing: {
    title: "One fair price. It stays that way.",
    body: "Pick a package for each kind of site you have. A package covers several sites, and you can hold more than one on a single bill.",
  },
  support: {
    title: "When you write, a person answers.",
    body: "Support is handled by the people who run the servers, so you never explain the problem twice. Open a ticket from your dashboard or send us an email. We say what happened, what we did, and whether you need to do anything.",
  },
  faq: [
    { q: "Will my price go up when I renew?", a: "No. The price you sign up at is the price you renew at. If we ever change list prices, existing packages keep their price." },
    { q: "I am not technical. Can I still use Zaffre?", a: "Yes. That is who it is for. You tell us what you need in normal words and we do the hosting work. If you have a developer, they get their own free login." },
    { q: "Is the migration really free?", a: "Yes, on every plan. We copy your sites, test them on a private link and switch DNS only when you approve. Your old host keeps running until the new one is confirmed." },
    { q: "What does \"package\" mean?", a: "A package covers several sites of one type. For example, Next.js Business covers up to 5 Next.js apps. You can hold more than one package, for example one for Next.js and one for WordPress, on one bill." },
    { q: "How do I pay?", a: "Today we accept bank transfer and Wise. You upload proof of payment in the dashboard and we confirm it. Card payments are coming." },
    { q: "Where is my data stored?", a: "Client sites and their backups are stored in the EU. The Privacy Policy names the exact region, and we tell you before that ever changes." },
    { q: "What if I go over my plan's limits?", a: "We contact you first. There are no automatic overage charges and no usage meter running in the background." },
    { q: "Can I leave?", a: "Yes, any time. Your content is yours, and we give you a copy of your files and database when you go." },
  ] satisfies FaqItem[],
  cta: {
    title: "Ready to stop worrying about hosting?",
    body: "Tell us about your sites. We will suggest the right package and move everything for free.",
  },
};

export const features = {
  title: "Why Zaffre",
  lines: ["A fair price.", "And we do the work."],
  intro: "Big hosts sell cheap first-year prices and leave the work to you. We do the opposite: a fair price that stays fair, and people who look after your sites.",
  groups: [
    {
      id: "managed",
      title: "Managed for you",
      body: "If it is hosting work, it is our work. You should not need to log in to a server, ever.",
      items: [
        { title: "Deploys handled", body: "Connect your Git repository or send us files. We set up the build, the preview links and the rollbacks, and we are there when a build fails." },
        { title: "Updates and patches", body: "WordPress core and plugins, Node.js versions and server packages are kept current. We check the site after each update and roll back if something breaks." },
        { title: "Daily off-site backups", body: "Backups are stored away from the server that runs your site, so one failure cannot take both. Ask us to restore any day inside your plan's history." },
        { title: "Security watch", body: "A firewall, rate limiting, and malware scans for WordPress. If something looks wrong, we act first and tell you straight after." },
      ],
    },
    {
      id: "performance",
      title: "Built to stay fast",
      body: "Speed comes from having room, not from tricks. Every package has its own allowance.",
      items: [
        { title: "Reserved CPU and memory", body: "Each package has its own resource allowance on modern NVMe servers, so a busy neighbour cannot slow your site down." },
        { title: "Global CDN and free SSL", body: "Static files are cached close to your visitors. Certificates are issued and renewed automatically for every domain." },
        { title: "Caching that understands Next.js", body: "ISR, image optimisation and the data cache use persistent storage, so a restart does not throw your cache away." },
        { title: "Monitoring from outside", body: "We check your sites from outside our own network. If a server has a problem, we hear about it even when that server cannot tell us." },
      ],
    },
    {
      id: "fair",
      title: "Fair and plain",
      body: "No tricks in the pricing, no tricks in the contract.",
      items: [
        { title: "No renewal jump", body: "Your price on day one is your price at renewal. You do not need to prepay years ahead to get it." },
        { title: "Free team seats", body: "Invite developers and your accountant with their own roles. No per-seat fees, and you can limit a developer to the sites they work on." },
        { title: "Honest about your data", body: "We tell you which region your data lives in. You own your content and can take a full copy with you at any time." },
        { title: "People, not scripts", body: "Support is handled by the people who run the servers. You get an answer in plain words." },
      ],
    },
  ],
  split: {
    title: "Who does what",
    body: "The same list we work from.",
    rows: [
      { task: "Moving your sites in", who: "Zaffre", note: "Free on every plan" },
      { task: "Builds, deploys and rollbacks", who: "Zaffre", note: "Git push, or send us files" },
      { task: "Core, plugin and server updates", who: "Zaffre", note: "Checked after each update" },
      { task: "Daily backups and restores", who: "Zaffre", note: "Restores on request" },
      { task: "SSL certificates", who: "Zaffre", note: "Issued and renewed automatically" },
      { task: "Uptime monitoring and first response", who: "Zaffre", note: "Checked from outside our network" },
      { task: "Your content, design and code", who: "You", note: "It stays yours" },
      { task: "Your domain registration", who: "You", note: "Stays in your name; we connect it" },
    ],
  },
  never: {
    title: "Things we will not do",
    items: [
      { title: "Raise your price at renewal", body: "Existing packages keep the price they started on." },
      { title: "Bill you for a traffic spike", body: "There is no usage meter. If you outgrow a plan, we talk to you first." },
      { title: "Charge per team member", body: "Seats are free." },
      { title: "Hold your site hostage", body: "You can leave at any time with a full copy of your files and database." },
      { title: "Invent numbers", body: "You will not find made-up reviews, client logos or uptime figures on this site." },
    ],
  },
};

export interface HostingSection {
  title: string;
  body: string;
  items?: Feature[];
  steps?: Feature[];
  lines?: string[];
}

export interface HostingPage {
  type: SiteType;
  photo: PhotoKey;
  title: string;
  lines: string[];
  metaTitle: string;
  metaDescription: string;
  intro: string;
  features: Feature[];
  sections: HostingSection[];
  faq: FaqItem[];
}

export const hostingPages: Record<SiteType, HostingPage> = {
  nextjs: {
    type: "nextjs",
    photo: "nextjs",
    title: "Managed Next.js hosting",
    lines: ["Next.js hosting,", "without the meter."],
    metaTitle: "Managed Next.js hosting with ISR, cron and caching",
    metaDescription:
      "Run Next.js with API routes, ISR, cron and image optimisation on reserved resources. Fixed price, free migration from other platforms, real people on support.",
    intro:
      "Your Next.js apps run as full Node.js servers with a persistent cache, background jobs and preview deployments. We handle the platform so your developers can ship.",
    features: [
      { title: "Git push to deploy", body: "Connect GitHub, GitLab or Bitbucket. Every push builds, and every branch can get its own preview link." },
      { title: "ISR and revalidation", body: "Incremental Static Regeneration and on-demand revalidation, with a cache that survives restarts and deploys." },
      { title: "Cron jobs", body: "Schedule route handlers the way you would on other platforms. We call them on time and log the result." },
      { title: "Image optimisation", body: "next/image works out of the box, with caching so each image is only processed once." },
      { title: "Environment variables", body: "Per-site secrets, masked in the dashboard and never written to logs." },
      { title: "Instant rollback", body: "Every deploy is kept. Go back to any recent version in seconds." },
    ],
    sections: [
      {
        title: "What a deploy looks like",
        body: "The same flow your developers already know, on servers we look after.",
        steps: [
          { title: "Push", body: "A commit lands on your branch. We pick it up straight away." },
          { title: "Build", body: "We install, build and run your checks. If the build fails, the live site is not touched." },
          { title: "Preview", body: "Branches get a private link so you can look before anyone else does." },
          { title: "Go live", body: "The new version takes traffic with no downtime. The old one is kept." },
          { title: "Roll back", body: "If something is wrong, one click returns to the previous version." },
        ],
      },
      {
        title: "Moving from another Next.js platform",
        body: "We work through the same checklist every time, so nothing gets left behind.",
        lines: [
          "We copy your environment variables and keep them masked",
          "We recreate your cron schedules and check that each one fires",
          "We test ISR, image optimisation and API routes on a private link",
          "We move your domains with no downtime, and keep the old platform running until you approve",
        ],
      },
      {
        title: "A fixed price instead of seats and usage",
        body: "Developer platforms usually charge for each person who deploys and then bill usage on top. Our price covers the package. Everyone on your team gets a free login, and there is no usage meter. If you outgrow the plan, we talk to you before anything changes.",
      },
    ],
    faq: [
      { q: "Can you move my app from another Next.js platform?", a: "Yes, for free. We copy your environment variables, cron schedules and domains, test on a private link, then switch DNS with no downtime." },
      { q: "Which Next.js versions do you support?", a: "Current and previous major versions. We tell you before a version reaches end of life and can help you upgrade." },
      { q: "Is there a usage meter?", a: "No. Your plan has fair resource limits and a bandwidth allowance. If you outgrow it, we talk to you first. No surprise bills." },
      { q: "Do you support middleware and streaming?", a: "Yes. Proxy (middleware), route handlers, streaming and Server Actions all run on the Node.js runtime." },
      { q: "Where does my database live?", a: "Most apps connect to a database they already have, and that keeps working. If you need one beside your app, tell us and we will plan it with you." },
      { q: "Can I see build and runtime logs?", a: "Yes. Each site has build, runtime and cron logs in the dashboard." },
      { q: "Do my developers need paid seats?", a: "No. Team access is free. You can give a developer access to only the sites they work on." },
    ],
  },
  wordpress: {
    type: "wordpress",
    photo: "wordpress",
    title: "Managed WordPress hosting",
    lines: ["WordPress hosting", "you never have", "to think about."],
    metaTitle: "Managed WordPress hosting with updates and daily backups",
    metaDescription:
      "Fast, secure WordPress on reserved resources. We handle updates, backups, SSL and security. Fixed price with no renewal jump and free migration.",
    intro:
      "We keep WordPress fast and safe: server-level caching, tested updates, daily backups and a firewall. You keep full admin access and get on with the business.",
    features: [
      { title: "Safe updates", body: "Core, theme and plugin updates are applied and the site is checked afterwards. If something breaks, we roll back." },
      { title: "Server caching", body: "Page and object caching tuned for WordPress and WooCommerce, set up on the server so you do not need a caching plugin." },
      { title: "Daily backups", body: "Files and database, stored off-site. Ask for a restore of any day inside your plan's history." },
      { title: "Firewall and malware scans", body: "Bad bots and brute-force logins are blocked before they reach WordPress." },
      { title: "Staging copy", body: "On Business and Pro, ask for a staging copy to test changes before they go live." },
      { title: "Forms that arrive", body: "Contact-form and order emails are sent through an authenticated sending service, so they reach the inbox." },
    ],
    sections: [
      {
        title: "How we handle updates",
        body: "Updates are where most WordPress sites break. So they get a routine.",
        steps: [
          { title: "Back up first", body: "A fresh backup is taken before anything changes." },
          { title: "Update", body: "Core, plugins and themes are brought up to date." },
          { title: "Check", body: "We load the key pages and look for errors." },
          { title: "Roll back if needed", body: "If a plugin update breaks the site, we restore it and tell you which one." },
        ],
      },
      {
        title: "Moving from cPanel or a WordPress-only host",
        body: "You give us temporary access. We do the rest.",
        lines: [
          "We copy your files and database, including uploads",
          "We test the site on a private link, checkout and forms included",
          "We switch DNS when you approve, with no downtime",
          "Your domain stays registered in your name, where it is today",
        ],
      },
      {
        title: "What about email?",
        body: "Hosting plans cover your website. Mailboxes on your domain are a separate service that we can set up for you; ask us and we will quote it plainly. If your email already works somewhere else, we leave it exactly where it is and only move the website.",
      },
    ],
    faq: [
      { q: "Do I keep full WordPress admin access?", a: "Yes. It is your site. We manage the server and the updates around you." },
      { q: "Can I install any plugin?", a: "Almost all. A few plugins that duplicate our caching or backups are not needed; we tell you if one causes problems." },
      { q: "Do you support WooCommerce?", a: "Yes. Business and Pro plans have the room WooCommerce needs." },
      { q: "My site was hacked. Can you clean it?", a: "Tell us before we move it. We look at the site first and tell you honestly what a clean-up involves." },
      { q: "Will moving affect my search rankings?", a: "A careful move keeps the same addresses and content, so search engines see the same site. We check redirects and SSL before the switch." },
      { q: "Is email included?", a: "Hosting plans cover the website. Mailboxes on your domain are a separate service we can set up on request. Your existing email is not touched by a website move." },
    ],
  },
  static: {
    type: "static",
    photo: "static",
    title: "Static site hosting",
    lines: ["Simple sites,", "served properly."],
    metaTitle: "Static and HTML site hosting with global CDN and free SSL",
    metaDescription:
      "Host HTML, CSS and JavaScript sites on a global CDN with free SSL, form handling help and daily backups. Fixed price, free migration.",
    intro:
      "Simple sites deserve simple, fast hosting. Upload files or connect Git, and your site is served from a global CDN with SSL on every domain.",
    features: [
      { title: "Global CDN", body: "Files are cached close to your visitors, so the first load is quick wherever they are." },
      { title: "Free SSL", body: "Certificates are issued and renewed for every domain. Nothing to buy, nothing to remember." },
      { title: "Git or upload", body: "Deploy from a repository or send us a zip. Both work, and you can switch later." },
      { title: "Redirects and headers", body: "www to apex, old addresses to new ones, security headers. Tell us what you need and we set it up." },
    ],
    sections: [
      {
        title: "Built with a generator? We run the build",
        body: "You do not need a build server of your own.",
        lines: ["Astro", "Hugo", "Eleventy", "Jekyll", "Plain HTML, CSS and JavaScript", "Anything else that builds to a folder of files"],
      },
      {
        title: "Contact forms on a static site",
        body: "A static site has no server to send an email. Tell us where the form should go and we wire it to email or to a form service, then test that the message arrives.",
      },
      {
        title: "When a site outgrows static",
        body: "If you later need logins, a shop or a content editor, we can move the site to WordPress or Next.js on the same account, with the same people and the same bill.",
      },
    ],
    faq: [
      { q: "Do you support static site generators?", a: "Yes: Astro, Hugo, Eleventy, Jekyll and others. We run the build for you." },
      { q: "What about contact forms?", a: "We can wire your form to email or a form service. Ask support and we set it up." },
      { q: "Can I just send you the files?", a: "Yes. Send a zip and we publish it. You do not need to learn Git." },
      { q: "How many sites can I host?", a: "Static Starter covers 3 sites, Business covers 10 and Pro covers 25." },
      { q: "Can I use my own domain?", a: "Yes. Your domain stays registered where it is. We give you the records to add, or add them for you if you give us access." },
    ],
  },
};

export const pricingFaq: FaqItem[] = [
  { q: "Will my price go up when I renew?", a: "No. The price you sign up at is the price you renew at. If we ever change list prices, existing packages keep their price." },
  { q: "What does \"package\" mean?", a: "A package covers several sites of one type. For example, Next.js Business covers up to 5 Next.js apps. You can hold more than one package, for example one for Next.js and one for WordPress, on one bill." },
  { q: "What counts as a site?", a: "One website with its own main domain. Extra domains that point to the same site, such as the www version, do not count again." },
  { q: "Is migration really free?", a: "Yes, for every plan. We move your sites, test them on a private link and switch DNS when you approve." },
  { q: "How do I pay?", a: "Today we accept bank transfer and Wise. You upload proof of payment in the dashboard and we confirm it. Card payments are coming." },
  { q: "Can I get an invoice for my company?", a: "Yes. Every payment has an invoice in your dashboard that you can print or save as a PDF." },
  { q: "Can I cancel?", a: "Yes, any time. Monthly packages stop at the end of the month. See the Refund Policy for yearly packages." },
  { q: "What if I go over my limits?", a: "We contact you first. There are no automatic overage charges." },
  { q: "Can I change plan later?", a: "Yes. Tell us and we move you up or down. Your sites stay online while we do it." },
  { q: "Do my developers need their own paid seats?", a: "No. Team access is free. Invite developers with access to only the sites they work on." },
  { q: "Do you register domains?", a: "Domain search is available now and registration is coming soon. Until then you keep your domain where it is and we connect it." },
];

export const pricing = {
  billing: {
    title: "How billing works",
    body: "One invoice, in US dollars, for everything you hold with us.",
    example: {
      title: "A worked example",
      lines: [
        { label: "Next.js Business, up to 5 apps", amount: 39 },
        { label: "WordPress Starter, 1 site", amount: 19 },
      ],
      note: "Pay yearly and you pay for 10 months instead of 12.",
    },
  },
  after: {
    title: "What happens after you choose",
    steps: [
      { title: "You send a request", body: "Pick a plan and tell us which sites you have. No card and no commitment." },
      { title: "We reply with a plan", body: "A person reads it, confirms the package fits, and sends you an invoice." },
      { title: "You pay by bank transfer or Wise", body: "Upload the receipt in your dashboard. We check it and confirm by email." },
      { title: "We move your sites", body: "We copy and test everything on a private link, then switch when you approve." },
    ],
  },
  outgrow: {
    title: "If you outgrow a plan",
    body: "Nothing happens automatically. We do not throttle your site and we do not add charges to your bill. We write to you, show you the numbers, and suggest the next step. You decide.",
  },
};

export const migration = {
  title: "We move your sites for free",
  lines: ["We move your", "sites for free."],
  intro:
    "Moving hosts feels risky. We make it boring: we copy everything, test it on a private link, and switch over only when you say yes. Your old host keeps running until we are done.",
  steps: [
    { title: "Share access", body: "Tell us which sites to move and give temporary access to your current host, or invite us to your Git repository.", note: "You, about ten minutes" },
    { title: "We copy and test", body: "We build each site on Zaffre, copy databases and files, and send you a private preview link.", note: "Us" },
    { title: "You approve", body: "Click through your site on the preview link. If anything looks different, we fix it before going live.", note: "You, whenever you are ready" },
    { title: "The switch, with no downtime", body: "We lower DNS TTLs in advance, switch the records, and watch traffic until the old host is idle.", note: "Us" },
    { title: "Clean up", body: "We confirm everything works and remove the temporary access. Then you cancel your old host.", note: "Us, then you" },
  ],
  from: [
    { title: "Next.js platforms", body: "Vercel, Netlify and others. Environment variables, cron schedules and domains come with you." },
    { title: "Shared hosts", body: "cPanel or hPanel accounts, including the database and uploaded files." },
    { title: "WordPress-only hosts", body: "The whole site, with plugins, themes, media and users." },
    { title: "Static hosts and storage", body: "Files, redirects and custom headers." },
  ],
  need: {
    title: "What we need from you",
    items: ["A list of the sites and domains to move", "Temporary access to your current host, or an invite to your Git repository", "Access to your DNS, or ten minutes of your time to add the records we send", "Someone who can look at the preview and say yes"],
  },
  same: {
    title: "What stays exactly the same",
    items: ["Your domain, registered in your name", "Your email, wherever it is hosted today", "Your addresses and content, so search engines see the same site", "Your WordPress admin login"],
  },
  rollback: {
    title: "If something goes wrong",
    body: "Your old host keeps running during the whole move. If the new site is not right after the switch, we point DNS back and nobody notices. We only ask you to cancel the old host after you have confirmed everything works.",
  },
  faq: [
    { q: "How long does a move take?", a: "It depends on the size of the site and how quickly you can look at the preview. We give you a date when we have seen the site, not before." },
    { q: "Will my site go offline?", a: "No. The old host keeps serving visitors until the new one is confirmed, and the DNS switch is prepared in advance." },
    { q: "Does it cost anything?", a: "No. Migration is free on every plan." },
    { q: "Do I have to move my domain?", a: "No. Your domain stays registered where it is. We only change the records that point to your website." },
    { q: "What about my email?", a: "It is not touched. We only move the website unless you ask us to do more." },
    { q: "Can you move several sites at once?", a: "Yes. We move them one by one so each can be checked, and you can keep working while we do." },
  ] satisfies FaqItem[],
};

export const about = {
  title: "About Zaffre",
  lines: ["Hosting should", "be boring."],
  intro: "Zaffre is a managed hosting company for businesses that want their websites to simply work.",
  story: [
    "We started Zaffre because hosting had split into two bad choices. On one side, cheap shared plans that double in price at renewal and leave the work to you. On the other, developer platforms that bill by the request and charge for every seat.",
    "We think there is a better middle: reserved cloud resources, a fair price that stays fair, and engineers who actually look after your sites. We deploy, update, back up and fix. When something needs your attention, a person tells you in plain words.",
    "Good hosting is the kind you do not think about. The site is up, the bill is the number you expected, and when you write to us someone who knows your setup writes back.",
  ],
  name: {
    title: "Why the name",
    body: [
      "Zaffre is a deep cobalt-blue pigment. For centuries it was used to colour glass and to paint the blue onto blue-and-white ceramics, things made to be used every day and to last.",
      "That is the standard we hold ourselves to: quiet, durable, and still doing its job long after you have stopped noticing it.",
    ],
  },
  values: [
    { title: "Honest by default", body: "No fake urgency, no invented numbers, no hidden renewal prices. If we do not know something yet, we say so." },
    { title: "Done for you", body: "If it is hosting work, it is our work. You should never need to open a server console." },
    { title: "Plain words", body: "We explain what happened and what comes next, without jargon." },
    { title: "Yours to take", body: "Your content and data belong to you. You can leave with a full copy at any time." },
  ],
  paid: {
    title: "How we make money",
    body: "From the monthly or yearly price of your package, and nothing else. We do not sell add-ons at checkout, we do not earn from raising your renewal price, and we do not sell or share your data.",
  },
};

export const domains = {
  connect: {
    title: "Already own a domain? Keep it where it is",
    body: "You do not need to move your domain to host with us. It stays registered in your name, and we connect it.",
    steps: [
      { title: "Add the domain in your dashboard", body: "Type the domain. We show you exactly which DNS records it needs." },
      { title: "Add the records at your registrar", body: "Copy two short records into your domain's DNS settings. If you prefer, give us access and we do it." },
      { title: "We check it and issue SSL", body: "We watch for the change, confirm it, and issue a free certificate. You see each step in the dashboard." },
    ],
  },
  faq: [
    { q: "Can I buy a domain from you today?", a: "Not yet. Search works now and registration is coming soon. Until then, buy the domain from any registrar and we connect it." },
    { q: "Is SSL included?", a: "Yes. Every domain you connect gets a free certificate that renews automatically." },
    { q: "Do I have to transfer my domain to you?", a: "No. Your domain stays registered in your name, wherever it is today." },
    { q: "How long does DNS take to update?", a: "Often minutes, sometimes a few hours. Your dashboard shows when we can see the change." },
    { q: "Can I use more than one domain for a site?", a: "Yes. Add as many as you need, for example with and without www, and choose which one is the main address." },
  ] satisfies FaqItem[],
};

export const contact = {
  next: [
    { title: "A person reads it", body: "Your message goes to the people who run the servers, not to a sales team." },
    { title: "We reply with a suggestion", body: "Which package fits, what a move would involve, and anything we need to know first." },
    { title: "You decide", body: "No follow-up calls and no pressure. If we are not the right fit, we say so." },
  ],
  helpful: ["The addresses of the sites you have today", "Where they are hosted now", "Whether they are Next.js, WordPress or plain HTML", "Anything that is going wrong at the moment"],
};
