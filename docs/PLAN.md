# Zaffre: build plan

Living plan. Updated at the end of every work session.

**Current status (2026-11-11):** Phase 0 done. Phase 1 (clickable UI on mock data) in progress on branch `claude/project-thread-izox2i`.

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
- [x] Admin panel: overview, clients, login-as-client (audited), sites, plans, invoices, payment verification queue, tickets, fleet health, backups, payment methods, email templates, announcements, audit log
- [x] Unit tests (Vitest) and e2e + accessibility tests (Playwright + axe)
- [x] CI: secret scan, lint, typecheck, unit, build, e2e
- [x] Dockerfile (Coolify) + Vercel compatible
- [~] Preview deployment link shared with owner

## Phase 2: Real backend

- [ ] Postgres + Drizzle schema and migrations (accounts, users, memberships, sites, servers, plans, subscriptions, invoices, payments, tickets, notifications, audit log)
- [ ] Better Auth: email/password, reset, optional TOTP 2FA, session list, roles (admin / owner / developer / billing)
- [ ] Replace in-memory store with Drizzle repositories, same function signatures
- [ ] Invoice PDF generation
- [ ] Payment proof upload to private storage (R2, signed URLs), type + size limits
- [ ] Team invites by email, per-site permissions
- [ ] Email notifications via Resend
- [ ] Rate limiting + Zod validation on every action
- [ ] Audit log persisted

## Phase 3: Infrastructure integration

- [ ] Real Coolify adapter (apps, deploys, restart, env vars, logs, servers)
- [ ] Real Cloudflare adapters: DNS, Custom Hostnames (SSL), R2 backups, cache rules
- [ ] Domain-connect flow end to end
- [ ] Uptime (UptimeRobot) adapter, status page from real data
- [ ] `docs/RUNBOOK-SERVER.md` (VPS + Coolify + Cloudflare + backups, copy-paste steps)

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
