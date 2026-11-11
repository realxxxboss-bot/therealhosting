# Decisions log

Every important choice, with the reason. Newest decisions are added at the bottom of each section.
Facts we cannot confirm ourselves are marked `TODO(confirm)` and listed in [OWNER-ACTIONS.md](./OWNER-ACTIONS.md).

---

## D-001 Brand name: **Zaffre** (domain `zaffrehost.com`)

**Date:** 2026-11-11

**Decision.** The company and product are called **Zaffre**. Primary domain: `zaffrehost.com`.

**Why.**

- Zaffre is a historic deep cobalt-blue pigment. It ties straight into our deep-blue brand colour, so the name and the look tell one story.
- Short (6 letters, 2 syllables: _ZAF-er_), easy to spell after hearing it once, and not tied to any country or language.
- Not a generic "host/cloud/web" compound, so it is brandable and memorable.
- The `.com` (with the descriptive "host" suffix) was listed at about USD 12/yr with the same price on renewal, which matches our own "no renewal jump" promise.

**Checks done on 2026-11-11.**

| Check | Result |
| --- | --- |
| US trademark "ZAFFRE" | One live registration (Zaffre Capital, LLC, serial 90894262) in class 36 (investment / real estate) and class 39 (travel information) only. No filing found in class 42 (hosting, SaaS) or 38. Different industry, so low confusion risk. |
| Other hosting brands | A hosting company called **ZafireHosting** (zafirehosting.com) exists. Spelling and pronunciation differ (_za-FIRE_ vs _ZAF-er_), and we always write "Zaffre" with the pigment story, but this is the main residual risk. |
| `zaffre.cloud` | Registered by a third party (expires 2026-11-28). Not needed. |
| `zaffrehost.com` | Whois lookups from our build environment were inconclusive (registry lookups are blocked here). The owner must confirm availability at checkout. |
| Social handles | Could not be verified automatically (sites block bots). Owner checks by hand (see OWNER-ACTIONS). |

**Alternatives considered.**

- _Kyanos_ (Greek "dark blue"): nice meaning, but "Kyanos" is already an open-source network-monitoring tool and "Kyanon Digital" is a cloud consultancy. Harder to spell from hearing it.
- _Cyanode_: close to "CyanConnode", an existing IoT network company.
- _Azurion_, _Cerulo_: only `.cloud` domains in the shortlist; generic "azure" association with Microsoft Azure is a risk for Azurion.

**Fallback.** If `zaffrehost.com` is gone at checkout, use `getzaffre.com` or `zaffre.host`, in that order. The brand name lives in `src/config/site.ts`, so a domain change is one line.

**Owner follow-up.** Before spending on marketing, run a quick trademark search in the UK IPO and EUIPO databases for "Zaffre" in class 42 (steps in OWNER-ACTIONS).

---

## D-002 Pricing (USD, fixed, no renewal jump)

**Date:** 2026-11-11 · Source of truth: `src/config/plans.ts`

### Competitor benchmark (checked 2026-11-11)

| Product | Intro price | Renewal price | Notes |
| --- | --- | --- | --- |
| Hostinger Business web hosting | $4.49/mo (24-month term) | **$16.99/mo** | Shared hosting. Source: findstack.com renewal table (Aug 2026 data); Hostinger's page was in a Black Friday promo state. |
| Hostinger Cloud Startup | $7.99/mo (48-month term, paid upfront) | **$25.99/mo** | 4 GB RAM, 4 CPU cores, 100 GB NVMe, "unlimited" sites. Source: hostinger.com/pricing. |
| Vercel Pro | $20/mo per deploying seat | same | Includes $20/mo usage credit, then usage-based billing. Extra member seats $20/mo each. Source: vercel.com/docs/plans/pro-plan. |

### Our rules

1. **One price, forever.** The price you sign up at is the price you renew at. No multi-year lock-in needed to get a good price.
2. **Yearly = 10 × monthly** (2 months free, about 17% off). Simple to explain.
3. **Anchor on renewal prices**, not intro prices. Hostinger's real long-term cost is the renewal price.
4. **A package covers several sites.** A client can hold more than one package (for example one Next.js package plus one WordPress package).
5. **Managed is included.** Every plan includes free migration, updates, backups and human support. That is why we sit above shared hosting.

### Plans

| Type | Starter | Business | Pro |
| --- | --- | --- | --- |
| **Static / HTML** | $7/mo · 3 sites | $12/mo · 10 sites | $20/mo · 25 sites |
| **WordPress** | $19/mo · 1 site | $29/mo · 3 sites | $49/mo · 8 sites |
| **Next.js** | $24/mo · 2 apps | $39/mo · 5 apps | $69/mo · 12 apps |

Full limits (CPU, RAM, storage, bandwidth, backups) are in `src/config/plans.ts`.

**Why these numbers.**

- **WordPress Business $29** sits just above Hostinger Cloud Startup's $25.99 renewal. For about $3 more the client gets reserved resources, fully managed updates, daily off-site backups and a real person, and the price never jumps.
- **WordPress Starter $19** is a little above Hostinger Business renewal ($16.99) for the same reason.
- **Next.js Starter $24** compares with Vercel Pro ($20/seat + usage). We include ISR, cron, image optimisation and caching with no usage meter and no surprise bills, plus we manage the deployment. Teams with developers also avoid paying $20 per seat: our team access is free.
- **Static** is cheap to run, so it is priced to win easy switches from shared hosts.
- Example: our first client (4 Next.js, 1 WordPress, 1 static) fits **Next.js Business + WordPress Starter + Static Starter = $65/mo** ($650/yr), on one bill, with one support contact.

Review prices every 6 months, or before any big marketing push.

---

## D-003 Tech stack

| Area | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16.4 (App Router), React 19, TypeScript strict** | Required by brief. Also proves our own Next.js expertise. Cache Components and Partial Prefetching are on (Next 16 defaults). |
| Styling | **Tailwind CSS 4** with our own design tokens and in-house components (shadcn/ui-style patterns, not stock) | Fast to build, easy to keep on-brand. We copy only the patterns we need, so there is no unused UI code. |
| Icons | **lucide-react** | Consistent 1.75px stroke icons that match our icon style. |
| Fonts | **Schibsted Grotesk** (everything), **IBM Plex Mono** (code only). Self-hosted woff2 files via `next/font/local`. Changed from Plus Jakarta Sans + Inter in the design overhaul (D-006). | No call to Google at build or run time (privacy, works offline in CI and on Coolify). Both are SIL Open Font License. |
| Validation | **Zod 4** | One schema for forms, server actions and API inputs. |
| Content | **MDX** (`@next/mdx`) for blog and legal pages; typed config files in `src/config` for everything else | Content lives outside components, as the brief requires. |
| Theme | **next-themes**, light first, dark mode supported | No flash of wrong theme. |
| Unit tests | **Vitest 5** | Fast, native ESM/TS. |
| E2E + a11y | **Playwright** + **axe-core** | Real browser tests and automated WCAG checks. |
| Database (Phase 2) | **Postgres + Drizzle ORM** | Typed SQL, plain migrations, light runtime, works on Vercel and Coolify. |
| Auth (Phase 2) | **Better Auth** | Self-hosted, supports email/password, 2FA (TOTP), sessions list, organisations and roles, Drizzle adapter. No per-user fees. |
| Transactional email | **Resend** | Simple API, good deliverability, React email templates. |
| Client mailboxes | **Migadu** (white-label, priced per account not per mailbox) | We never self-host mail. Migadu suits a reseller: unlimited domains and mailboxes per account. |
| Uptime | **UptimeRobot** first (off-site, no server to run), adapter also ready for **Uptime Kuma** later on a separate small server | Monitoring must run outside our own servers. |
| App deploys | **Coolify** (self-hosted PaaS) | One control plane, many servers. Fits Phase A (one VPS) and Phase B (Proxmox cluster). |
| DNS / SSL / backups | **Cloudflare** DNS, Cloudflare for SaaS custom hostnames, R2 | Free SSL for client domains, cheap durable backup storage with no egress fees. |

## D-004 Architecture: adapter layer

The UI never talks to infrastructure. Every outside system sits behind a TypeScript interface in `src/lib/adapters/types.ts`:

`DeployAdapter` (Coolify), `DnsAdapter` + `CustomHostnameAdapter` (Cloudflare), `BackupStorageAdapter` (R2), `UptimeAdapter`, `MailboxAdapter`, `TransactionalEmailAdapter`, `WhatsAppAdapter`, `RegistrarAdapter`, `PaymentProvider`.

- Each has a **mock** implementation with realistic demo data (Phase 1) and gets a **real** implementation in Phases 2–3.
- `src/lib/adapters/index.ts` picks mock or real from the `ADAPTER_MODE` env var, so the demo and production use the same UI code.
- **Servers and regions are data**: a `Server` record has a region, provider (`vps` or `proxmox`), and capacity. A site points to a server. Moving a site is a data change plus a redeploy, never a code change.

## D-005 Data access and tenant isolation

- All reads go through `src/lib/data/*` functions that take the **current session** and filter by `accountId`. Pages never query raw tables.
- Admin-only functions live in `src/lib/data/admin.ts` and check `role === "admin"` on the server first.
- Phase 1 uses an in-memory seeded store (`src/lib/data/store.ts`); Phase 2 swaps it for Drizzle with the same function signatures.

## D-006 Payments

- `PaymentProvider` interface with a `manual` provider now (bank transfer, Wise, others, all configured by admin) and room for `stripe` later.
- Flow: invoice `unpaid` → client uploads proof + reference → `pending_verification` → admin approves → `paid` (or rejects → back to `unpaid` with a reason).
- Late payment shows a warning banner only. **No automatic suspension.**
- Card payments need a registered company and address. See OWNER-ACTIONS (UK Ltd / US LLC note).

## D-007 Demo mode (Phase 1)

- Sign-in accepts the demo accounts listed on the sign-in page. A signed cookie holds the demo user id.
- Mutations in demo mode change the in-memory store for the running server only and reset on restart. A banner says "Demo data".
- The demo client is called **"UK client"** with 6 sites: 4 Next.js, 1 WordPress, 1 static HTML. Site names and domains in the demo use the reserved `.example` TLD so they can never point at a real business.

## D-008 Data location

- The server region is a config value: `site.dataRegions` in `src/config/site.ts`. The privacy policy reads it.
- Planned Phase A region: **Germany, EU** (Hetzner, dedicated-vCPU line), because it is close to the first (UK) client, is under GDPR, and has strong price/performance. `TODO(confirm)` until the VPS is bought.

## D-009 Hosting the platform itself

- The app builds as a **standalone Next.js server** (`output: "standalone"`) with a multi-stage `Dockerfile`, so it runs on Coolify. It also deploys to Vercel for previews with no changes.

## D-010 CI

GitHub Actions on every push and PR: install → secret scan (gitleaks) → lint → typecheck → unit tests → build → Playwright e2e + axe accessibility checks. A PR must be green before merge.

---

## D-006 Design overhaul: "cobalt glaze"

**Date:** 2026-11-11

**Decision.** After the owner's review of Phase 1 the whole visual layer was rebuilt. Plan and reasoning: [DESIGN-PLAN.md](./DESIGN-PLAN.md). Rules: [BRAND.md](./BRAND.md).

- **No gradients, glows, grid backgrounds or drawn product mockups**, anywhere. The logo is a flat tile.
- **One typeface** (Schibsted Grotesk) instead of the common Inter pairing; IBM Plex Mono for code only.
- **Palette** reduced to white, ink, one zaffre blue (`#0014A8`, the pigment's own colour) used in large solid bands, and greys. The cyan accent is gone.
- **Structure**: ruled lists and tables in 4/8 and 5/7 splits instead of grids of identical cards with icons. Status is a dot and a word, not a pill.
- **Photography** from Unsplash (free licence), served from Unsplash's CDN, with a credits page. A cream-paper-and-serif direction was considered and rejected because it is as common a template look as the one it would replace.
- **Motion** with the `motion` library, limited to one hero sequence, photo reveals, sliding markers and press states.
- **Content**: every public page was extended with real, checkable content. No testimonials, logos or numbers were invented. Legal pages no longer print `TODO(confirm)` placeholders; they show a clear draft notice instead.

**Known limit.** The build environment cannot reach `images.unsplash.com`, so the photographs were chosen from their descriptions and have not been looked at. The owner should review them on the first live preview (OWNER-ACTIONS).

