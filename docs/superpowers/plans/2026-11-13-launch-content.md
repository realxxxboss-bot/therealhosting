# Launch Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the owner's confirmed contact details and social accounts on the site, and make the legal pages, About page and homepage ready for launch.

**Architecture:** All facts live in `src/config/site.ts`, and page copy lives in `src/config/marketing.ts` and `content/legal/*.mdx`. Pages read from those files, so this work is mostly data and copy. It adds one small presentational component for social links.

**Tech Stack:** Next.js 16 (App Router, MDX), Tailwind 4, Playwright e2e with axe.

**Spec:** the owner's message of 2026-11-13. It names:
- the domain: zaffrehost.com
- the email: info@zaffrehost.com
- the social handle: @zaffreehost on Instagram, Facebook and Threads
- the ask: "have the pages ready: legal pages, about page, homepage with content and info"

## Global Constraints

- Do not invent facts: no testimonials, team, addresses, uptime numbers or registration numbers. Unknown items stay `TODO(confirm)`, and a placeholder is never shown to visitors.
- Never mention the owner's country, cities or name.
- The site and all copy are in English, and prices are in USD.
- No gradients and no decorative patterns.
- Every public contact point uses a single email: `info@zaffrehost.com`.
- Social URLs:
  - `https://www.instagram.com/zaffreehost`
  - `https://www.facebook.com/zaffreehost`
  - `https://www.threads.com/@zaffreehost`
- Legal documents keep the "draft until reviewed" notice (`legalDraft = true`).

## Review Focus

1. Footer social links open in a new tab, carry an accessible name ("Zaffre on Instagram"), and pass axe on every public page.
2. Old `support@` and `hello@` addresses must not remain anywhere a visitor or an email reply can see them, including invoice PDFs and the Resend reply-to. The test greps the built pages.
3. Organization JSON-LD lists the three profiles in `sameAs` and uses info@.
4. The Privacy Policy names only providers that are in the stack, and it says where each one processes data. It does not claim anything that is not yet true. Planned providers are marked as "when enabled".
5. The About page renders without `TODO(confirm)` text and at phone width.

---

### Task 1: Contact and social details in config, footer and contact page

**Files:**
- Modify: `src/config/site.ts` (contact, social)
- Create: `src/components/marketing/social-links.tsx`
- Modify: `src/components/marketing/site-footer.tsx`, `src/app/(marketing)/contact/page.tsx`, `src/app/(marketing)/page.tsx` (JSON-LD)
- Test: `tests/e2e/public.spec.ts`

**Interfaces:**
- Produces:
  - `site.contact.email = "info@zaffrehost.com"`. `supportEmail` and `salesEmail` both equal it, so existing callers keep working.
  - `site.social: { instagram: string; facebook: string; threads: string; handle: "zaffreehost" }`, holding full URLs.
  - `socialProfiles(): { label: string; href: string }[]`
  - `<SocialLinks tone="dark" | "light" />`

- [ ] Write e2e `footer shows email and social profiles`. It expects these on `/`:
  - a `mailto:info@zaffrehost.com` link
  - links whose names are "Zaffre on Instagram", "Zaffre on Facebook" and "Zaffre on Threads", each with the URL above
  - no text matching `support@zaffrehost.com` or `hello@zaffrehost.com` on `/`, `/contact` or `/legal/privacy`
- [ ] Run it and see it fail.
- [ ] Implement the config, component and footer changes. On the contact page, one email and the social row. Add JSON-LD `sameAs` and `email`.
- [ ] Run lint, typecheck and the e2e test. Commit.

### Task 2: Legal pages ready for launch

**Files:** `content/legal/privacy.mdx`, `terms.mdx`, `refund.mdx`, `acceptable-use.mdx`, `sla.mdx`, `docs.ts` (set the `updated` dates to 2026-11-13)

- [ ] Privacy:
  - Add a providers table: Hetzner (servers, Germany), Cloudflare (DNS, SSL, CDN, R2 backups, EU jurisdiction), Neon (database, Frankfurt), Vercel (runs this website and dashboard), Resend (transactional email), UptimeRobot (uptime checks).
  - Add a cookies table: `zf_session` (sign-in, up to 30 days), `zf_2fa` (10 minutes during sign-in), and the theme kept in browser storage, not a cookie.
  - Add short sections on security, children, international transfers and changes.
- [ ] Terms: add suspension for abuse or security (with notice where possible), termination by us with 30 days' notice and a data copy, events outside our control, and a link to the Privacy Policy.
- [ ] Run the existing e2e test (legal pages render and pass axe). Commit.

### Task 3: About page and homepage content

**Files:** `src/config/marketing.ts` (`about`), `src/app/(marketing)/about/page.tsx`

- [ ] Add an "Every plan includes" section to About. It reuses `includedInEveryPlan`, so there is no new list.
- [ ] Add a "Where your sites live" section, using `site.dataRegions` and `site.backupRegions`.
- [ ] Add a "Talk to us" section with the email and `<SocialLinks tone="light" />`.
- [ ] Check the homepage for placeholder or outdated copy. Fix any copy problems there; the JSON-LD changes belong in Task 1.
- [ ] Run the e2e test (About passes axe and has no `TODO(confirm)`), take a screenshot at 390px, then commit.

### Task 4: Owner docs

- [ ] In `docs/OWNER-ACTIONS.md`:
  - #1: domain chosen, zaffrehost.com.
  - #4: email filled in.
  - #6: handles noted (Instagram, Facebook, Threads).
- [ ] Note the email and handles in `docs/DECISIONS.md` as D-016.
- [ ] Run the full checks, push, and open a draft PR.
