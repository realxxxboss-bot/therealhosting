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
| Auth (Phase 2) | Own implementation on `node:crypto` (see D-012) | Originally planned as Better Auth. Email/password, 2FA (TOTP), session list and roles, with no extra schema or per-user fees. |
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
- Phase 1 used an in-memory seeded store. Since Phase 2 the same functions run SQL through Drizzle, with the account filter in the query itself (D-011).

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

---

## D-011 Database: Postgres, Drizzle, and one code path for the demo

**Date:** 2026-11-12

- **Postgres + Drizzle.** The schema is `src/lib/db/schema.ts`; SQL migrations are generated into `drizzle/` and committed. The app applies pending migrations when it starts, under a Postgres advisory lock, so several copies starting together are safe.
- **No `DATABASE_URL` means the sample database.** The app then runs on PGlite (Postgres compiled to WebAssembly, in the same process), migrated and filled with the sample data on first use. The preview, local development and the tests use it. This keeps one code path: the demo runs the same queries as production, and nothing in the app checks "is this the demo" to pick a data source.
- **Sample data never reaches a real database.** Seeding only happens in the in-process database. A real, empty database gets the email templates and the first admin (`ADMIN_EMAIL`), nothing else.
- **Admin lists** read whole tables in one round of queries (`loadAdminStore`), with long tables capped. That is right for tens of clients; each screen gets its own paged query when volumes grow.
- Ids are prefixed random strings (`site_…`). Invoice numbers come from a database sequence and ticket numbers from a serial column, so two requests can never get the same number.

## D-012 Authentication: built on Node's crypto, not Better Auth

**Date:** 2026-11-12 · Replaces the Better Auth row in D-003.

What we need is small and standard: password hashing, a session cookie, one-time links, TOTP. We build it on `node:crypto`:

- Passwords: scrypt (N=32768), salted, in a self-describing format so the cost can be raised later.
- Sessions: a random token in an HMAC-signed, httpOnly cookie; the database stores only its SHA-256. Deleting the row signs that device out at once. A password change or reset ends every other session.
- Emailed links (reset, first password, invite): random 256-bit tokens, stored as hashes, single use, time limited. Links are built from configuration (`APP_URL`), never from the request's Host header.
- 2FA: TOTP (RFC 6238), checked against the RFC test vectors. Secrets are encrypted with AES-256-GCM using a key derived from `SESSION_SECRET`.
- Sign-in gives the same answer and takes the same time for an unknown email and a wrong password, and is rate limited per IP and per email.

**Why not Better Auth.** It would add a second schema and session model next to ours, and the sample-data preview (which can run as several short-lived copies with separate in-process databases) needs a stateless fallback that is simple with our own cookie and awkward with a library. The trade-off: we own this code, so it is covered by unit tests and listed for the Phase 5 security review. Passkeys or social sign-in would be a reason to revisit.

**Sample accounts.** Only in the sample database: password `demo`, and accounts with two-factor accept the code `123456`. With a real database neither exists and the sign-in page does not show them.

## D-013 Uploaded files live in Postgres for now

**Date:** 2026-11-12

Payment proofs and ticket attachments (PNG, JPG, WebP, PDF, up to 5 MB) are stored in a `files` table and served only by a route that checks the viewer: admins, or members of the owning account (payment proofs need billing access). They are always sent as downloads, never rendered inline.

R2 with signed links was the original plan. It needs the Cloudflare account, which arrives in Phase 3, and at our volume (a few small files per invoice) Postgres is simpler and is backed up together with the rest of the data. `src/lib/files.ts` is the only code that touches storage, so moving to R2 later is a contained change.


## D-014 Live infrastructure adapters switch on one provider at a time

**Date:** 2026-11-12

`ADAPTER_MODE=live` now builds real clients for Coolify (deploy, restart, env vars, logs), Cloudflare for SaaS (custom hostnames and their certificates) and UptimeRobot (site uptime and the status page). Each one switches on when its settings are present. A provider without settings, and the parts not built yet (backups list, analytics, mailboxes, domain search), answer "not connected" or show empty charts. Live mode never falls back to demo data, because a real client must never see invented numbers.

A site is linked to its Coolify application by uuid (`sites.deploy_ref`, set on the admin Sites page). Linking also creates its UptimeRobot monitor (`sites.monitor_ref`). Custom hostname ids are kept on `domains.provider_ref`. Status page services use monitors named `zaffre:<service>` (for example `zaffre:dashboard`); a service without one shows "no data".

The Cloudflare and UptimeRobot calls follow their public API references. The Coolify v4 deploy call is from its reference; the restart, env var and log endpoints follow the v4 API but could not be read in full from the build environment, so the first live connection is checked by hand before clients use it (RUNBOOK-SERVER, Hissa G). Provider errors are logged without tokens and shown to users as plain messages.

## D-015 List prices stay in code; servers are managed in the admin

**Date:** 2026-11-12

Servers are now added, edited and removed on the admin Servers page. A server with sites on it can't be removed until they are moved. Usage meters show only in demo mode; in live mode the page says usage is not measured yet, until real server metrics are connected.

Plans and list prices stay in `src/config/plans.ts` instead of moving to the database. The pricing page, the dashboard and invoices all read that one file, so they can never disagree, and the public pricing page stays a fast static page. List prices change rarely, and a change never touches existing clients, whose price is saved on their package. Per-client deals are already set in the admin on each client's packages. To change a list price, the owner asks for it and it ships as a reviewed change.

## D-016 One public email and the social handles

**Date:** 2026-11-13

The owner confirmed the domain `zaffrehost.com`, a single public email `info@zaffrehost.com`, and the handle `@zaffreehost` on Instagram, Facebook and Threads. All public contact points (footer, contact page, About, legal pages, invoices, email reply-to) use info@. The code keeps `supportEmail` and `salesEmail` as names for the two jobs, so they can be split into separate inboxes later by changing one line in `src/config/site.ts`. Social links are plain text links with accessible names, not logo icons.

The handle has two e's while the brand has one. We use the handle exactly as given.

## D-017 Formal Terms of Service, under the laws of England and Wales

**Date:** 2026-11-13

The owner asked for formal, standard terms, "similar to Hostinger", and confirmed the legal name as Zaffre. The Terms now follow the usual structure for a hosting company: definitions, account, services, fees, responsibilities, IP, data protection, backups, third parties, suspension, termination, warranties, liability cap, indemnity, force majeure, changes, notices, general clauses and governing law. Our own promises are kept: no renewal price increase, notice before suspension for late payment (14 days after the due date), 30 days to take a copy of your data.

Governing law is England and Wales. It is widely used in international hosting contracts, matches the UK GDPR reference in the Privacy Policy, and suits the first client. Consumers keep the mandatory protections of their own country. When a company is registered, the legal name and possibly the governing law should match it; both are one line in `src/config/site.ts`. The documents stay marked as drafts until a lawyer has reviewed them.

## D-018 Production hardening before the first real client

**Date:** 2026-11-13

- **Live mode by default with a real database.** When `ADAPTER_MODE` is not set, a `DATABASE_URL` means live mode. Connecting the database alone can no longer leave real clients looking at demo data and the demo banner. `ADAPTER_MODE=mock` still works on purpose (a staging copy), and the startup check warns about it.
- **No silent email loss.** The sample-data preview never sends real email, even with a Resend key, because its demo admin login is public. With a real database and no key, the server logs an error at start, and the contact form tells the visitor to email us instead of claiming it has their message. Contact-form emails set reply-to to the visitor.
- **Admins must use two-factor.** Admin accounts can open every client's data. `requireAdmin` sends an admin without 2FA to `/admin/account` to set it up, and `loadAdminStore` checks for an admin itself. Not enforced on the sample database, so the public demo keeps working. A used code can't be replayed inside its 90-second window (`users.totp_last_step`).
- **Static Content Security Policy, not nonces.** A nonce needs every page rendered per request, which would throw away the static marketing pages. The policy still blocks framing, plugins, foreign forms, foreign scripts and images except Unsplash's CDN. Inline scripts are allowed (Next's bootstrap, theme, JSON-LD).
- **Client IP from the right of `X-Forwarded-For`**, counting `TRUSTED_PROXY_HOPS` (default 1). The left-most entry is whatever the visitor sends.
- **Suspended accounts** can still view, pay and open tickets; changes to sites, domains, mailboxes and team are refused with a clear message. An admin acting as the client can still fix things.
- **Error pages, health check and startup check.** `error.tsx` in each area and `global-error.tsx` show a reference (the error digest) that matches the server log line written by `onRequestError`. `/api/health` checks the database. `src/lib/env-check.ts` lists missing or half-set settings by name at start, never values.
- **Migrations on Vercel** run at build time (`npm run db:migrate`) against `DATABASE_URL_UNPOOLED`, with the same advisory lock as the app, and `DATABASE_AUTO_MIGRATE=false`.

## D-019 Legal set for businesses and consumers

**Date:** 2026-11-13

The owner chose to sell to both businesses and consumers. So the Terms now have a consumer cancellation right (section 4A: 14 days, with an express request to start early and a pro-rata deduction), consumer wording on liability (13.4) and VAT (4.1), and a model [cancellation form](/legal/cancellation). Business customers keep the liability cap and indemnity.

- **Identity.** UK law requires the business name and a postal address before selling online. `site.legalAddress`, `site.operatorCountry` and `site.companyRegistration` are `TODO(confirm)`. Until the address is set, the legal pages say it will be published before the first paid order; they never show a placeholder. `operatorStatement()` builds the sentence.
- **Providers have a status.** `src/config/providers.ts` is the one list for the Privacy Policy and the sub-processor page, and marks each provider "In use", "From launch" or "If you connect it", because the VPS and database are not live yet. Unsplash is listed because photos load from its CDN.
- **New documents:** Data Processing Agreement (Art 28, 48-hour breach notice, 30 days' notice of new sub-processors with a right to object), sub-processor list, cancellation form, complaints procedure (2 business days to acknowledge, 14 days to reply), notice-and-takedown in the AUP, and a `/security` page that states only what the code does.
- **Fixes:** refund maths (yearly price minus the monthly price per started month, never negative), 7 days' email notice before suspension for late payment, support "every day, within 24 hours" everywhere, maintenance announced on the status page and by email, "service credit" replaced by a plain outage review.

All documents stay marked as drafts (`legalDraft = true`) until a lawyer has reviewed them.

## D-020 Footer and navigation

**Date:** 2026-11-13

- **Footer:** wordmark, one-line description, email and social links on the left. Four columns: Hosting (what we sell), Company (who we are), Help (sign in, domains, security, complaints), Legal (every policy, including Service Levels and the DPA). The repeated sales pitch is gone, since the call-to-action band sits right above. Group titles are plain text, not headings, so the page outline stays clean. The bottom row holds the copyright, the trading-name line once confirmed, and small print.
- **System status** is out of the navigation until monitoring is connected. The page stays reachable and says monitoring is not connected yet.
- **Main nav:** About replaces Domains; domain registration isn't available yet, so Domains moves to the footer.
- **Admin sidebar** is grouped into Work, Clients and Platform.
- Focus rings are white on the blue band and the ink footer, where the brand blue was invisible.
