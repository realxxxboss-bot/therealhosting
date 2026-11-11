# Zaffre

Managed hosting for Next.js, WordPress and static sites: a public website, a client dashboard and a staff admin panel in one Next.js app.

> **Status: Phase 1 (demo).** Every screen works, but infrastructure is simulated by mock adapters and data lives in memory. See [docs/PLAN.md](docs/PLAN.md).

## What's inside

| Area | Path | What it does |
| --- | --- | --- |
| Public site | `/`, `/pricing`, `/hosting/*`, `/migration`, `/domains`, `/status`, `/blog`, `/legal/*` | Marketing, pricing, domain search, status page, legal pages |
| Client dashboard | `/dashboard` | Sites, deploys, domains and DNS, backups, analytics, env vars, logs, email, billing, support, team, notifications |
| Admin panel | `/admin` | Clients, sites, servers, plans, invoices, payment checks, tickets, backups, payment methods, email templates, announcement, audit log |

## Run it locally

Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local   # then set SESSION_SECRET to a long random string
npm run dev
```

Open http://localhost:3000 and sign in from `/sign-in`. The demo accounts are listed on that page (password `demo`; the staff account asks for the demo 2FA code `123456`).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | TypeScript (strict) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests with accessibility checks (Playwright + axe). Run `npm run build` first. |

## How it is built

- **Next.js (App Router), TypeScript strict, Tailwind CSS.** Brand tokens and rules: [docs/BRAND.md](docs/BRAND.md).
- **Adapters** (`src/lib/adapters`): every piece of infrastructure (deploys, DNS, backups, uptime, mail, messages, registrar) sits behind an interface with a mock today and a real provider later. `ADAPTER_MODE=live` refuses to start until real adapters exist.
- **Tenant isolation** (`src/lib/data/client.ts`): every client query is scoped to the signed-in account and the member's role. Covered by unit and browser tests.
- **Payments:** manual bank transfer and Wise with proof upload and staff verification. Card payments come later.
- **Audit log:** sensitive actions by clients and staff, including "sign in as client", are recorded.

Decisions and their reasons: [docs/DECISIONS.md](docs/DECISIONS.md). Product spec: [docs/SPEC.md](docs/SPEC.md).

## Deploy

- **Preview:** Vercel, with `SESSION_SECRET` and `ADAPTER_MODE=mock` set in the project's environment settings.
- **Self-hosted:** `docker build -t zaffre .` then run with `-e SESSION_SECRET=… -p 3000:3000`. The image uses Next.js standalone output.

## Security

- Never commit secrets. Only `.env.example` (placeholders) is tracked; CI runs a gitleaks secret scan on every push.
- Session cookies are HMAC-signed, `httpOnly`, `SameSite=Lax`. Server actions re-check permissions on every call.
- Uploads are limited to PNG, JPG, WebP and PDF up to 5 MB, checked by content (magic bytes), not just the file name.
