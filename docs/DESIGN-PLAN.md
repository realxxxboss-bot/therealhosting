# Design overhaul plan

Status: built, waiting for the owner's review (2026-11-11). Goal: the site, dashboard and admin must feel premium and human-designed before Phase 2 starts.
Source: owner review of Phase 1, plus 8 design audits (home, pricing and hosting pages, secondary pages, design system, client dashboard, admin and sign-in, motion, photography).

## Owner's rules for this pass
- No gradients anywhere. No grid or pattern backgrounds.
- No "AI-coded" or template SaaS look. The fake dashboard mockup in the hero goes.
- Real photography, free but premium-looking and relatable (Unsplash).
- Pages need substantial, honest content.
- Motion: page-load, scroll and hover effects, restrained and with reduced-motion support.
- Design includes structure and layout, not only colour.

## Direction: "cobalt glaze"
Zaffre is the cobalt pigment used on blue-and-white porcelain. The site borrows that, not a tech look: white porcelain surfaces, one deep cobalt used in large solid fields, black ink type, and real photographs. Boldness is spent in one place: big solid cobalt bands and full-bleed photos. Everything else stays quiet.

We deliberately avoid three common defaults: indigo-on-blue-grey SaaS, cream paper with a serif and a terracotta accent, and near-black with one neon accent.

### Colour (6 tokens)
| Token | Light | Use |
| --- | --- | --- |
| Porcelain | `#FFFFFF` page, `#F4F5F7` sunk areas | backgrounds |
| Ink | `#0E1018` | text, dark-mode background, footer |
| Zaffre | `#0014A8` | primary buttons, links, full-bleed bands, the logo |
| Glaze | `#E9ECFB` | selected rows, highlighted plan, focus fills |
| Stone | `#DCDDE2` | 1px rules and borders |
| Slate | `#5A5F6E` | secondary text |

Status colours stay (success `#0B7A55`, warning `#B45309`, danger `#C8261B`). No cyan, no glow. Dark mode: Ink background, Porcelain buttons on Ink, Zaffre-light `#8C97FF` only for text links.

### Type
- One family with character for everything: **Schibsted Grotesk** (OFL, variable 400–900), self-hosted from npm `@fontsource-variable`.
- **IBM Plex Mono** only for code, DNS values, env vars and commit hashes.
- Scale (px): 13 caption, 15 small, 17 body (marketing), 15 body (app), 20 lead, 24 h3, 36 h2, 56 h1, 80 display (mobile: h1 40, display 52). Headings 600–700, tight leading, sentence case.
- No arbitrary text sizes. No ALL-CAPS eyebrows. No one-word colour accents in headlines.

### Shape and depth
- Two radii: 4px controls, 8px cards and photos.
- No shadow at rest. Structure comes from 1px Stone rules and spacing. One elevation for menus, drawers and dialogs.
- Layout: 12-column, mostly 5/7 and 4/8 splits, left-aligned. Section rhythm 96/128px desktop, 64px mobile. Vary widths: narrow text columns next to full-bleed photos.

### Photography
- Subjects: people doing web work, the business owners we host for, real hardware in daylight, and our own dashboard. No unrelated craft or still life (see docs/BRAND.md). Product visuals replace decorative photos.
- Daylight, quiet, people mid-task and not looking at the camera. 8px corners. One grade.
- Banned: handshakes, pointing at screens, server rooms with blue LEDs, globes, headsets, grins.
- Never caption a stock person as staff, a client or a testimonial. Credits page lists every photographer.
- Served from Unsplash's image CDN (their recommended hotlinking), sized per slot.

### Motion
- Tokens: 120ms press, 200ms hover and menus, 420ms reveals, 600ms hero. Ease-out `cubic-bezier(.22,1,.36,1)`. Movement 8–16px, scale at most 1.03.
- One orchestrated hero load: headline lines rise in sequence, then text and buttons, then the photo opens with a clip reveal.
- Scroll: headings and photos fade up once; photos drift slightly; header gains a rule after scrolling; reading progress on blog and legal; the migration timeline line draws as you scroll.
- Hover and press: buttons press down slightly; links grow an underline; clickable cards lift; photos zoom 1.03 inside their frame; nav and pricing toggles use a sliding pill.
- App: toasts for deploy, restart and copy; tab underline slides; skeletons only after 150ms.
- Avoid: every card animating in turn, counters, tilt or glow, marquees, letter-by-letter text, scroll-jacking.
- `prefers-reduced-motion`: opacity-only, short, no parallax.

## Work items

### A. System
1. New tokens, fonts and type scale in `globals.css`; delete `.bg-glow` and `.bg-grid`.
2. Flat logo (no gradient) in the component, SVGs, favicons and OG image. This also fixes the blank logo on mobile.
3. Button, card, badge, field, table restyle (radii, no shadows, press states).
4. Header with a Hosting menu, active state, solid background; full-height mobile menu with motion, scroll lock and focus handling; substantial footer.
5. Motion primitives: `MotionConfig`, `Reveal`, hero intro, sliding pill, toast system.

### B. Public pages (rebuilt with real content and photos)
Home, Pricing, Features, Next.js, WordPress, Static, Migration, About, Domains, Contact, Status, Blog (3 posts expanded to long form, with covers), Legal (table of contents, plain summary), 404, and a new Credits page. Fix the copy contradictions (staging on Starter, email on WordPress), the mobile overflow on Pricing, the Status page claiming "operational" without data, and the visible TODO text on legal pages.

### C. Sign-in, 2FA and reset
Split layout: form on the page (no floating card), photo on the right. Clickable demo logins. 2FA shows which account is signing in.

### D. Client dashboard
"Needs attention" list instead of repeated banners and stat tiles; sites as a dense table with uptime bars; chart labels and axes fixed; settings pages as single-column rows; mobile fixes (site header, invoice rows); calmer status pills; toasts.

### E. Admin
Fix the audit log order (bug). Work queue first as a table with inline actions. Proof preview and amount check on payment checks. Filters on invoices and tickets. Ticket context panel. Calmer tables (no shadows, denser rows). Grouped navigation.

### F. Verify
Re-run the audits on the new build, unit and browser tests including accessibility, screenshots for the owner, PR.
