# Zaffre brand kit

## Name and idea

**Zaffre** is a historic deep cobalt-blue pigment, made for centuries to colour glass and ceramics that last.
That is our promise: deep, dependable, crafted. Pronounced _ZAF-er_.

- Written as **Zaffre** in sentences. The wordmark is lowercase **zaffre**.
- Domain: `zaffrehost.com`. Never write "Zaffre Host" as the brand name; "host" is only in the domain.
- Tagline: **Managed hosting, done for you.**
- Positioning line: **Cloud-level performance, business-level price, plus real people managing it for you.**

## Logo

| File | Use |
| --- | --- |
| `public/brand/icon.svg` | App icon, avatar, favicon source. Gradient tile + white Z + cyan "node" block. |
| `public/brand/icon-mono.svg` | One-colour version (inherits `currentColor`). For print, embossing, watermarks. |
| `public/brand/logo.svg` | Icon + wordmark on light backgrounds. |
| `public/brand/logo-on-dark.svg` | Icon + wordmark on dark backgrounds. |
| `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`, `public/brand/icon-192.png`, `public/brand/icon-512.png` | Favicon set. Regenerate with `node scripts/generate-icons.mjs`. |
| `src/app/opengraph-image.tsx` + `src/lib/og.tsx` | Open Graph image template (1200×630). Pages can reuse `renderOgImage({ title, eyebrow })`. |

**The mark.** A geometric Z built from two bars and a diagonal, like a stack of server layers. The small cyan block at the bottom right is a "live node": the site is up, someone is watching it.

**Rules.**

- Clear space around the logo = the height of the cyan block × 2.
- Minimum size: icon 16 px, full logo 96 px wide.
- Do not recolour the tile outside the brand blues, do not rotate, do not add shadows or outlines.
- In the product UI the wordmark is live text in Plus Jakarta Sans 800 (sharper and accessible); the SVG files are for use outside the app.

## Colour tokens

Defined in `src/app/globals.css` as CSS variables and mapped to Tailwind (`bg-primary`, `text-muted`, …).

### Zaffre blue scale

| Token | Hex | Notes |
| --- | --- | --- |
| zaffre-50 | `#EEF1FF` | Tinted backgrounds |
| zaffre-100 | `#DDE3FF` | Hover on tinted backgrounds |
| zaffre-200 | `#BCC7FF` | Borders on tinted backgrounds |
| zaffre-300 | `#8E9DFF` | Dark-mode links |
| zaffre-400 | `#6F7CFF` | Dark-mode primary |
| zaffre-500 | `#3E4CF7` | Gradients |
| zaffre-600 | `#1B2BDB` | **Light-mode primary (buttons, links)** |
| zaffre-700 | `#0014A8` | **Brand blue (the pigment)** |
| zaffre-800 | `#0A138A` | Pressed |
| zaffre-900 | `#0D156B` | Headings on tinted areas |
| zaffre-950 | `#070A3A` | Hero backgrounds |

### Semantic tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--background` | `#F7F8FC` | `#070A1F` | Page |
| `--surface` | `#FFFFFF` | `#0D1230` | Cards, panels |
| `--surface-2` | `#F0F2FA` | `#141A3D` | Table headers, subtle fills |
| `--border` | `#E1E5F2` | `#252D58` | Lines |
| `--foreground` | `#0B1030` | `#E8EBFA` | Body text |
| `--muted` | `#545C7E` | `#A0A8CC` | Secondary text (AA on surface) |
| `--primary` | `#1B2BDB` | `#7381FF` | Actions |
| `--primary-foreground` | `#FFFFFF` | `#070A1F` | Text on primary |
| `--accent` | `#0E9BBB` | `#38D6F5` | "Live" cyan, highlights, focus glow |
| `--success` | `#0E8A5F` | `#34D399` | Up, paid |
| `--warning` | `#B45309` | `#FBBF24` | Pending, due soon |
| `--danger` | `#C8261B` | `#F87171` | Down, overdue |

All text/background pairs above meet WCAG AA (4.5:1 for body text).

## Typography

| Role | Font | Weight | Size (desktop / mobile) |
| --- | --- | --- | --- |
| Display | Plus Jakarta Sans | 800 | 56 / 38 px, tracking -2% |
| H1 | Plus Jakarta Sans | 800 | 44 / 32 px |
| H2 | Plus Jakarta Sans | 700 | 32 / 26 px |
| H3 | Plus Jakarta Sans | 700 | 22 / 20 px |
| Body large | Inter | 400 | 18 px / 1.6 |
| Body | Inter | 400 | 15–16 px / 1.6 |
| Small / labels | Inter | 500 | 13 px |
| Code, DNS records, env vars | JetBrains Mono | 450 | 13–14 px |

Fonts are self-hosted from `src/fonts` (SIL Open Font License, licences included).

## Shape, depth and motion

- Radius: 10 px for inputs and buttons, 16 px for cards, 24 px for hero panels.
- Depth: one soft shadow (`0 1px 2px rgb(11 16 48 / 6%), 0 8px 24px -12px rgb(11 16 48 / 18%)`). No heavy drop shadows.
- Signature detail: a faint blue grid + radial "glow" behind hero sections, like light through cobalt glass.
- Motion: 150–200 ms ease-out for hovers and menus. Respect `prefers-reduced-motion`. No auto-playing carousels.

## Icon style

- **lucide** line icons, 1.75 px stroke, rounded caps and joins, 20 px default (16 px in dense tables).
- Icons inherit text colour. Status uses a filled 8 px dot (success / warning / danger), never icon colour alone; there is always a text label too.
- Feature icons sit in a 40 px rounded-square tile with `zaffre-50` fill (dark: `zaffre-950`) and `primary` icon colour.

## Voice and tone

**We sound like a calm senior engineer who is also kind.**

| Do | Don't |
| --- | --- |
| Short, plain sentences. "We move your sites for free." | Jargon walls. "Leverage our hyper-scalable edge-native paradigm." |
| Say exactly what we do and don't do. | Overpromise. No "100% uptime", no "unlimited everything". |
| Speak as "we" and "you". | Speak as a faceless "the company". |
| Numbers that are true and checkable (prices, limits). | Invented numbers: customer counts, uptime stats, awards, reviews. |
| Friendly, a little warm. "Done. Your SSL certificate is live." | Cutesy or slangy. "Woohoo!! 🎉🎉" |
| Explain the next step in errors. "We couldn't find that DNS record yet. It can take up to an hour. We'll keep checking." | Blame or codes alone. "Error 0x8004: invalid." |

**Words we use:** managed, done for you, fixed price, no renewal jump, real people, reserved resources, backed up daily.
**Words we avoid:** cheap, unlimited, best-in-class, world-class, revolutionary, any claim we cannot prove.

**Identity rule.** The brand is international. Never name a home country, city, team member or founder. Location facts appear only where the law needs them (data location in the Privacy Policy), and come from config.
