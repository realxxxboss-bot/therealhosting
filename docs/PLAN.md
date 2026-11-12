# Zaffre: build plan

Living plan. Updated at the end of every work session.

**Current status (2026-11-12):** Phases 0 and 1 and the design overhaul are merged, and the owner approved the design. Phase 2 (real backend) is built and in review: Postgres schema and migrations, database-backed data access, real sign-in, password reset, 2FA, invites, invoice PDFs, private uploads and email through Resend. The preview keeps running on the built-in sample database until a real database is connected (OWNER-ACTIONS #9). Phase 3 prep is in review: the server runbook and the Coolify, Cloudflare and UptimeRobot connections, switched off until the server (OWNER-ACTIONS #3) and domain (#1) exist.

Legend: `[x]` done · `[~]` in progress · `[ ]` not started

---

## Phase 0: Plan and brand

- [x] Competitor price research (Hostinger Business, Hostinger Cloud Startup, Vercel Pro), see [DECISIONS D-002](./DECISIONS.md)
- [x] Brand name decision: **Zaffre**, see [DECISIONS D-001](./DECISIONS.md)
- [x] `docs/PLAN.md`, `docs/DECISIONS.md`, `docs/OWNER-ACTIONS.md`, `docs/SPEC.md`
- [x] Brand kit: `docs/BRAND.md`, SVG logo + icon, favicon set, OG image template

## Phase 1: Full UI on demo data

- [x] Next.js 16 app, TypeScript strict, Tailwind 4, brand tokens, light + dark
- [x] Adapter layer interfaces + mock implementations (deploy, DNS, custom hostnames, backups, uptime, mailboxes, transactional email, WhatsApp, registrar, payments)
- [x] Seeded demo store: "UK client" with 6 sites (4 Next.js, 1 WordPress, 1 static)
- [x] Public site: Home, Pricing (+ comparison table, FAQ), Features, Next.js / WordPress / Static landing pages, Migration, Domain search, Status, Blog (MDX), Contact, About, Terms, Privacy, Refund, AUP, SLA, 404
- [x] SEO: metadata, sitemap, robots, JSON-LD
- [x] Client dashboard: sign-in, reset password, 2FA screen, overview, sites + site detail tabs, domains, email, billing + pay invoice + proof upload, support tickets, team access, notifications, account settings
- [x] Admin panel: overview, clients (create, edit, notes, per-client package prices), login-as-client (audited), sites (create, assign server), plans (read-only list; list prices live in `src/config/plans.ts`), invoices (one-off + renewal run), payment verification queue, tickets, fleet health, backups, payment methods, email templates, announcements, audit log
- [x] Unit tests (Vitest, 35) and e2e + accessibility tests (Playwright + axe, 22 incl. every dashboard and admin screen)
- [x] CI: secret scan, lint, typecheck, unit, build, e2e
- [x] Dockerfile (Coolify) + Vercel compatible
- [x] Preview deployment on Vercel

## Phase 2: Real backend

- [x] Postgres + Drizzle schema and first migration (accounts, users, memberships, invites, sites, servers, subscriptions, domains, invoices, payments, tickets, notifications, sessions, files, audit log, rate limits)
- [x] In-process sample database (PGlite) for the preview, local work and tests, running the same SQL as production
- [x] Sign-in with scrypt password hashes, password reset and first-password links, TOTP 2FA, session list with remote sign-out, roles (admin / owner / developer / billing). Built on Node's crypto instead of Better Auth, see DECISIONS D-012
- [x] In-memory store replaced with Drizzle queries behind the same data-access functions
- [x] Invoice PDF download (client and admin)
- [x] Payment proofs and ticket attachments stored privately, with type and size limits and access-checked downloads (in Postgres for now, R2 in Phase 3, see D-013)
- [x] Team invites by email with one-time links, per-site permissions
- [x] Email through Resend when `RESEND_API_KEY` is set
- [x] Rate limiting in the database and Zod validation on every action
- [x] Audit log persisted, with IP address
- [x] First admin created from `ADMIN_EMAIL` on an empty database
- [ ] Connect a real database to the deployment (OWNER-ACTIONS #9)
- [ ] Email notifications for site events and per-user notification preferences applied to sending (needs real uptime and deploy events, Phase 3)
- [ ] Admin screens for adding servers and editing plans in the database

## Phase 3: Infrastructure integration

- [x] `docs/RUNBOOK-SERVER.md` (VPS + Coolify + Cloudflare + backups, copy-paste steps)
- [x] Coolify adapter: deploy, restart, env vars, logs, written and unit tested, switched off until configured (D-014)
- [x] Cloudflare custom hostnames adapter (domains and HTTPS), written and unit tested, switched off until configured
- [x] UptimeRobot adapter: site uptime and status page from real monitors
- [x] Admin: link a site to its Coolify app, connections overview
- [ ] Server bought and set up by the owner (OWNER-ACTIONS #3, runbook)
- [ ] First live check of each connection against the real server
- [ ] Domain-connect flow end to end on a real domain
- [ ] R2 for backups list and uploads, Coolify server list on the fleet page, cache rules

## Phase 4: First client migration

- [ ] `docs/RUNBOOK-MIGRATION.md`: 4 Next.js (Vercel → Coolify), 1 WordPress, 1 static; DNS cut-over; rollback plan
- [ ] Migrate and verify each site

## Phase 5: Launch hardening

- [ ] OWASP security review
- [ ] Backup restore test
- [ ] Monitoring + alerts
- [ ] Accessibility + performance audits
- [ ] Legal pages reviewed by owner
- [ ] Launch checklist

---

## Definition of done (every phase)

- [ ] PLAN.md updated
- [ ] CI green
- [ ] Screenshots or preview link shared with owner
- [ ] Owner tasks in OWNER-ACTIONS.md with Roman Urdu steps
- [ ] Short Roman Urdu summary sent to owner
