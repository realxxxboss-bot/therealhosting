# Zaffre: product spec (short)

## What we sell

Premium **managed** hosting for Next.js, WordPress and static sites, with a simple client dashboard.
Positioning: **"Cloud-level performance, business-level price, plus real people managing it for you."**

Edge: fully managed (we deploy, update, back up and fix), reserved resources, one fixed price with no renewal jump, fast personal support, first-class Next.js (API routes, ISR, cron, caching).

## Users and roles

| Role | Where | Can do |
| --- | --- | --- |
| **Admin** (us) | `/admin` | Everything. Every sensitive action is written to the audit log. |
| **Owner** (client) | `/dashboard` | Everything in their own account: sites, billing, team. |
| **Developer** | `/dashboard` | Sites they are given access to: deploys, env vars, logs, domains. No billing, no team. |
| **Billing-only** | `/dashboard` | Invoices, payments, billing details. No sites. |

An **account** is a client company. Users belong to accounts through **memberships** (role + optional list of site ids). A user can be invited to more than one account.

## Core objects

- **Account**: client company, plan packages, notes (admin only).
- **Package** (subscription): plan id, billing cycle (monthly/yearly), renewal date, site slots.
- **Site**: name, type (`nextjs` | `wordpress` | `static`), server id, status, domains, env vars (Next.js only), deployments, backups.
- **Server**: name, region, provider (`vps` | `proxmox`), capacity, status. Placement = `site.serverId`.
- **Domain**: hostname, site id, verification status, SSL status, redirect rule.
- **Mailbox**: address, domain, quota, status.
- **Invoice**: number, lines, total (USD), due date, status (`unpaid` | `pending_verification` | `paid` | `void`), payments.
- **Payment**: method id, amount, reference, proof file, status, reviewed by.
- **Ticket**: subject, status, priority, messages (with attachments), site id (optional).
- **Notification**: kind, title, read state, channels.
- **Audit event**: actor, action, target, time, metadata (including "admin acting as client").

## Public site

Home, Pricing (comparison table + FAQ), Features, Next.js / WordPress / Static hosting, Migration, Domain search, Status, Blog (MDX), Contact (form + WhatsApp), About, Terms, Privacy, Refund, AUP, SLA, 404.
All copy lives in `src/config/*` and `content/*`.

## Client dashboard (`/dashboard`)

Overview · Sites (list + detail with Overview, Domains, Deployments, Backups, Analytics, Environment, Logs, Settings) · Domains · Email · Billing (+ pay invoice with proof upload) · Support · Team · Notifications · Account (profile, security + 2FA, sessions, activity).

## Admin (`/admin`)

Overview · Clients (+ notes, login as client) · Sites · Servers / fleet health · Plans · Invoices (+ recurring) · Payment verification queue · Tickets · Backups · Payment methods · Email templates · Announcements · Audit log.

## Non-negotiables

- No country or personal identity anywhere. No invented facts (`TODO(confirm)` instead).
- USD only. English only.
- Tenant isolation on every query. Role checks on the server.
- No secrets in the repo; secret scan in CI.
- Data location stated honestly from config (`site.dataRegions`).
