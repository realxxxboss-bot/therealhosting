# Zaffre brand kit

## Name and idea

**Zaffre** is a historic deep cobalt-blue pigment, made for centuries to colour glass and ceramics that last.
That is our promise: deep, dependable, crafted. Pronounced _ZAF-er_.

- Written as **Zaffre** in sentences. The wordmark is lowercase **zaffre**.
- Domain: `zaffrehost.com`. Never write "Zaffre Host" as the brand name; "host" is only in the domain.
- Tagline: **Managed hosting, done for you.**
- Positioning line: **Cloud-level performance, business-level price, plus real people managing it for you.**

## Logo

- **Mark:** a flat zaffre tile (8px corner on a 64px grid) with a white Z. No gradient, no glow, no second colour.
- **Wordmark:** "zaffre" in lowercase, Schibsted Grotesk 700, tracking -4.5%.
- Files: `public/brand/icon.svg`, `icon-mono.svg`, `logo.svg`, `logo-on-dark.svg`, plus PNG icons made by `npm run icons`.
- Clear space: half the tile width on every side. Minimum size: 20px tile.
- Never: add effects, rotate, recolour outside zaffre, ink or white, or place on a busy photo.
- In the product UI the wordmark is live text (sharper and accessible); the SVG files are for use outside the app.

## Direction: "cobalt glaze"

Zaffre is the cobalt pigment used on blue-and-white porcelain. The site borrows that, not a tech look: white porcelain surfaces, one deep cobalt used in large solid fields, ink type, and real photographs. Full reasoning: [DESIGN-PLAN.md](./DESIGN-PLAN.md).

Hard rules from the owner: **no gradients anywhere, no grid or pattern backgrounds, no fake product mockups, no template "SaaS" look.**

## Colour tokens

Source of truth: `src/app/globals.css`.

| Name | Light | Dark | Use |
| --- | --- | --- | --- |
| Porcelain (`--background`, `--surface`) | `#FFFFFF` | `#0E1018`, `#151824` | page and surfaces |
| Sunk (`--surface-2`) | `#F4F5F7` | `#1B1F2D` | alternate sections, hover rows |
| Ink (`--foreground`, `--ink`) | `#0E1018` | `#ECEEF4` | text; the footer is always Ink |
| Zaffre (`--primary`, `--band`) | `#0014A8` | buttons become Porcelain on Ink; bands stay `#0014A8` | primary buttons, links, full-width bands, logo |
| Glaze (`--primary-soft`) | `#E9ECFB` | `#1D2346` | selected rows, highlights |
| Stone (`--border`) | `#DCDDE2` | `#2A2E3D` | 1px rules |
| Slate (`--muted`) | `#5A5F6E` | `#A3A8B8` | secondary text |
| Link in dark (`--accent`) | `#0014A8` | `#8C97FF` | text links and active markers in dark mode |

Status colours: success `#0B7A55`, warning `#B45309`, danger `#C8261B` (lighter in dark mode). A status is always a dot plus a word, never colour alone and never a filled pill.

All text pairs meet WCAG AA. The browser tests run axe on every screen.

## Typography

| Role | Font | Weight | Size |
| --- | --- | --- | --- |
| Display (home hero) | Schibsted Grotesk | 600 | 52 to 84 px, line height 0.98, tracking -3.5% |
| H1 (inner pages) | Schibsted Grotesk | 600 | 44 to 64 px |
| H2 | Schibsted Grotesk | 600 | 32 to 40 px |
| H3 | Schibsted Grotesk | 600 | 20 to 28 px |
| Body (marketing) | Schibsted Grotesk | 400 | 17 to 18 px / 1.6 |
| Body (app) | Schibsted Grotesk | 400 | 15 px |
| Code, DNS records, env vars | IBM Plex Mono | 400 / 500 | 13 to 15 px |

One family for everything, self-hosted (`src/fonts`, SIL Open Font License). Sentence case everywhere. Never: ALL-CAPS labels above headings, one coloured word inside a headline, "A · B · C" strings, arrows on links.

## Shape, depth and motion

- Two radii: 4px for controls, 8px for cards and photographs.
- No shadow at rest. Structure comes from 1px rules and spacing; a strong Ink rule opens a list, light Stone rules divide it. One shadow (`--shadow-pop`) for menus and toasts.
- Layout: 12 columns, mostly 4/8 and 5/7 splits, left-aligned. Boldness is spent on solid zaffre bands and photographs; everything else stays quiet.
- Lists and tables instead of grids of identical cards. No icon-in-a-tinted-square feature grids.
- Motion (`src/components/motion`): one page-load sequence in the hero, photographs open with a clip reveal and drift slightly on scroll, headings fade up once, the nav rule and toggles slide, buttons press. 120 to 600ms, ease `cubic-bezier(.22,1,.36,1)`. Everything respects `prefers-reduced-motion`.

## Photography

- Registry: `src/config/photos.ts`. Free photos under the Unsplash License, served from Unsplash's image CDN, credited on `/credits`.
- Subjects: the customer's world (shops, studios, makers), calm desk work, and cobalt craft (glazed tile, blue glass, pottery) for the brand story.
- Daylight, quiet, people mid-task and not looking at the camera.
- Banned: handshakes, pointing at screens, server rooms with blue lights, globes, headsets, forced smiles.
- Never caption a stock person as staff, a client or a testimonial.
- Product visuals are real screenshots of the demo account (`public/screens`), never drawn mockups.

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
