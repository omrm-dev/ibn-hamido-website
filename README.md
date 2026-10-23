# Ibn Hamido Seafood · Orland Park: website mockups

Static HTML/CSS/JS versions of the four designs on the Claude Design canvas: **Base v2**, **A · Corniche**, **B · Anfushi market** and **C · Mix**. Each design is the full 9-page site (10 HTML files, because Checkout and Confirmation are separate pages) with working mock pickup ordering.

> **Not production.** Content is placeholders (`[PRICE]`, `[HOURS]`, `[OWNER: …]`, `[VERIFY: …]`), photos are **AI concept** images and **stand-ins**, and payments are mocked (`[POS PAYMENT EMBED]`). Every page carries `<meta name="robots" content="noindex, nofollow">`. Don't point the real domain here.

No framework, no build step: open the files or serve the folder.

## What's in each folder

| Path | What it is |
|---|---|
| `index.html` | Internal picker that links the 4 designs and their review states. Marked "Internal preview: not the live site". |
| `base/`, `a-corniche/`, `b-anfushi/`, `c-mix/` | One design each: `index.html` (Home), `coming-soon.html`, `menu.html`, `order.html`, `checkout.html`, `confirmed.html`, `story.html`, `visit.html`, `catering.html`, `privacy.html`, plus `css/look.css` (that design's shared styles). Rules used by only one page sit in that page's `<style>`. |
| `shared/tokens.css` | Design tokens from the installed design system ("Ibn Hamido — Orland Park": colors, type, spacing, radius, shadow). |
| `shared/fonts.css`, `shared/fonts/` | Young Serif, Inter, Aref Ruqaa and Rakkas, self-hosted (SIL Open Font License) so pages render the same offline. |
| `shared/photos/<ID>.jpg` | The 70 photos by shot ID (AI concept images and stand-ins, all **REPLACE BEFORE LAUNCH**) plus `LOGO-01.svg` (blue) and `LOGO-02.svg` (white). `OG-01.jpg` is the social-share image (not shown on a page). |
| `shared/data/menu-data.json` | The menu data file, unchanged. Every price is `null`, so the UI shows `[PRICE]`. |
| `shared/data/menu-data.js` | The same data wrapped as `window.IHS_MENU_DATA`, only for pages opened straight from disk (browsers block `fetch()` on `file://`). |
| `shared/js/order.js` | One ordering engine for all 4 designs. It renders the menu from `menu-data.json` and handles: option sheets (combo sides stepper with "0 / 2" and repeats, preparation, sandwich side, rice size, fresh catch weight/style/sides with a live price breakdown), direct add with "Added · Undo", the cart drawer and mobile bar, the `localStorage` cart, checkout validation and confirmation. Price math is a set of pure functions (`window.IHS.Price`): `null` prices give `[PRICE]`. |
| `shared/js/ui.js` | Mobile nav drawer, cooking-style reveal (click/tap only), dish accordion (150 ms hover intent, click always works), reviews carousel with Pause/Play, story scroll reveal. All of it respects `prefers-reduced-motion`. |
| `design-source/` | For the record: every canvas board (`project/*.dc.html`), `project/canvas.json`, the design-system tokens, `SPEC.md`, and `ContentChecklist.md` (the owner checklist board as markdown). |

The canvas boards were converted to plain HTML: the markup and styles come from the boards, while the interactions and ordering logic are re-implemented in `shared/js/`. No canvas runtime is included. `/_blob/` asset URLs from the canvas are replaced by files in `shared/photos/`.

## Preview locally

Either open `index.html` directly in a browser, or serve the folder (recommended, so `fetch()` reads `menu-data.json`):

```bash
cd ibn-hamido-website
python3 -m http.server 8080
# open http://localhost:8080/
```

Photo tags ("AI concept", "Stand-in") show because every page has `<body class="mockup">`. Remove that class to hide them.

## Review states (URL params)

Order (`order.html`):

| Param | Effect |
|---|---|
| `?status=open` / `closed` / `lunch` | Ordering banner. `closed` disables Add buttons and checkout. `lunch` only changes the banner with `lunchOnly=1`. |
| `?demoCart=1` | Loads the demo cart: Branzino 1.5 lb Singari + Tahini · CB-04 Tiger Shrimp grilled with Rice + Hamido Salad · Rice (Medium). This replaces the saved cart. |
| `?panel=cart` / `comboSheet` / `sidesError` / `sandwichSheet` / `catchSheet` | Opens that panel on load. |
| `?lunchOnly=1` | `combosLunchOnly` on: combos are orderable Mon–Fri [LUNCH HOURS] only. |
| `?byWeight=0` | `onlineByWeight` off: fresh catch shows the in-store card. |
| `?soldOut=0` | Turns off the demo sold-out states (F-06 Lobster "Sold out today", SG-06). |

Checkout (`checkout.html`):

| Param | Effect |
|---|---|
| `?step=confirmed` | Goes to `confirmed.html`. |
| `?showErrors=1` | Shows the error summary and inline errors. |
| `?status=closed` | Closed state. |
| `?demoCart=1` | Uses the demo cart when the saved cart is empty. |

Any page: `?capture=1` renders the settled state (no autoplay, story chapters revealed, no animations), for screenshots and design-tool imports.

The cart is saved in `localStorage` (`ihs-order-v4`) and shared by all four designs in the same browser.

## Deploy a preview

**Vercel**: import the repo with Framework preset **Other**, no build command and output directory `.` (repo root). Or from a terminal: `npx vercel` (preview) and `npx vercel --prod`. `vercel.json` adds an `X-Robots-Tag: noindex, nofollow` header to every response.

**GitHub Pages**: Settings → Pages → Build and deployment → Source **Deploy from a branch** → Branch `main`, folder `/ (root)` → Save. The site appears at `https://<user>.github.io/ibn-hamido-website/`. All links are relative, and `.nojekyll` stops Jekyll from processing the files. A private repo needs a paid GitHub plan for Pages; otherwise use Vercel.

## Editing the menu

Edit `shared/data/menu-data.json`, then regenerate the `file://` copy:

```bash
python3 -c "import json;d=open('shared/data/menu-data.json').read();open('shared/data/menu-data.js','w').write('/* Same content as menu-data.json, wrapped for pages opened straight from disk (file://), where fetch() is blocked.\n   Edit menu-data.json, then regenerate this file (see README). */\nwindow.IHS_MENU_DATA = '+d.strip()+';\n')"
```

When a price is set (for example `"price": 21.99`), the cards, sheets, cart and checkout show it and compute totals. Prices still `null` stay `[PRICE]`.

## Open owner questions (SPEC §9)

- **Facts:** [OPENING DATE] · [HOURS] Mon–Thu / Fri–Sun · [LUNCH HOURS] · [HOLIDAY NOTE] · [PHONE NUMBER] · [EMAIL] · [@HANDLE] Instagram · Facebook [PAGE] · Google [LISTING] · [JOBS EMAIL] · [GRAND OPENING OFFER]
- **Ordering:** all [PRICE] values (Astoria references are in menu-data.json) · [TAX RATE] · [PREP TIME] · [LAST ORDER TIME] · pickup slot rules · POS/payment provider · sold-out handling
- **Parties & catering:** [CAPACITY] · [MIN. NOTICE] · tray sizes [X–Y] · [RESPONSE TIME]
- **Copy in the owner's words:** 7 cooking styles · 12 sides · 6 fish · Story: 4 × [YEAR], family history, origin of the name "Ibn Hamido", opening in Astoria, why Orland Park · 5 handpicked reviews (quote, first name + last initial, source)
- **Verify:** combos lunch-only or all day · by-the-lb online: POS weight-adjusted charging, [AUTH BUFFER %], [MAX LB], styles per fish, daily market prices & sold-out updates · "Bronzini" (Astoria menu) vs "Branzino" (site) · drinks/desserts/hummus/pita served? · NYT list + year · 4.7★ sources · Astoria address · Astoria brand name · halal · allergen note · tagline preference
- **Legal:** privacy policy + SMS terms text

The full checklist, with every photo slot by shot ID, is in [`design-source/ContentChecklist.md`](design-source/ContentChecklist.md).

## Notes on the conversion

- **Superseded sticky:** the canvas has no "Superseded" sticky on the base row, so the base design is exported as it is.
- **One visual fix:** on the canvas, `.lk a` out-ranks `.btn-pri`, so primary link-buttons in looks A/B/C render blue text on blue. Here they get white text (see the end of each `look.css`).
- **`[MAX LB]`** is simulated as 10 lb until the owner sets it.
- **Copy from the data file:** the Fresh Catch Arabic label, the combo/sandwich notes, the order of the combo sides and the chip names come from `menu-data.json`. The canvas used slightly different wording in places.
- **Not exported:** the canvas's concept boards (Direction A/B/C), mobile-check frames and the internal checklist board. The checklist is in `design-source/` as markdown.
