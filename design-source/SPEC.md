# Ibn Hamido Seafood — Orland Park · Website v2 SPEC

This file is the single source of truth for v2. All three build prompts (Claude, v0, Framer) point to it.
If a tool and this spec disagree, the spec wins.

---

## 1. The business (context every builder needs)

- **What:** Ibn Hamido Seafood, a family-owned Alexandrian (Egyptian) seafood restaurant. Its second location is opening in Orland Park, IL. The original is Hamido Seafood in Astoria, Queens, NY.
- **Address:** 14035 LaGrange Rd, Orland Park, IL 60462
- **Domain:** ibnhamidochicago.com
- **How it works:** guests pick fish from the counter (sold by the pound) → tell the chef how to cook it → get seated → add Egyptian sides. Dining is **walk-in only**. **Private parties** are the only reservations (form). **Catering** is call-ahead.
- **Audience:** Chicago's southwest suburbs, including a large Arab-American community. Bilingual touches (Arabic lines in Aref Ruqaa, always paired with English) are part of the brand, not decoration.
- **Launch plan:** Phase 1 = Coming Soon page (live now). Phase 2 = full site + online pickup ordering.

## 2. Decisions already made (do not re-ask)

| Topic | Decision |
|---|---|
| Prices | Every price is a placeholder: `[PRICE]`. Astoria's prices go **only** in an internal reference note, never in the UI. |
| Fresh catch online | Sold online by estimated weight; the final price is set by actual weight at the counter (§6). Needs a POS that supports weight-adjusted charges `[VERIFY]`. |
| Ordering | A full mocked pickup-ordering flow: menu → item options sheet → cart → checkout → confirmation. No real payments. The payment area is a labelled `[POS PAYMENT EMBED]` slot. |
| Fulfilment | Pickup only, paid online (matches Astoria's ordering). |
| Order CTA | Every "Order online" button now goes to the site's own Order page, not an external POS link. |
| Photos | Every image slot carries its shot ID from §8 (for example `H-01 · Whole grilled branzino on the table · 3:4`). **AI concept images (from `04-GEMINI-photo-prompts.md`) are allowed until launch**: use the file named by its shot ID (`H-01.png`) when supplied, otherwise show the striped labelled placeholder. Each AI image gets a small "AI concept" tag in internal/mockup views (never on the public site), and the content checklist lists it as **REPLACE BEFORE LAUNCH**. Shots marked OWNER ONLY (ST-02–ST-05, V-01) may only use the generic stand-ins until the owner's real photos arrive. No stock photos. |
| Owner text | Anything the owner must write is `[OWNER: what is needed]`. A fact still missing is `[FACT NAME]`, for example `[HOURS]`. Something that needs checking is `[VERIFY: what]`. No lorem ipsum, no invented reviews, years, quotes or stats. |
| Naming | Orland Park brand: **Ibn Hamido Seafood**. Astoria is referred to as "our Astoria, NY restaurant" or "Hamido Seafood, Astoria" with `[VERIFY: Astoria brand name]`. Spell the fish **Branzino** everywhere, including dish names. |
| Tagline | Replace "We seafood differently." with "Seafood, the Alexandrian way." and add `[VERIFY: owner may prefer the original "We seafood differently."]` in the content checklist only. |

## 3. Design system (keep exactly)

**Fonts (Google):** Young Serif 400 for headlines (never bold) · Inter 400/500/600 for body/UI · Aref Ruqaa 400/700 for Arabic (RTL, `lang="ar" dir="rtl"`, always paired with English).

**Color tokens**

| Token | Hex | Use |
|---|---|---|
| surface | #FFFFFF | page ground |
| surface-tint | #F1F4FB | alternating sections, cards |
| foam | #E9EEF9 | chips, hover fills (never text) |
| ink | #0F1B3D | body & headings |
| ink-muted | #4F5F7E | secondary text |
| sea (primary) | #2B4AA5 | primary buttons, links, logo blue, focus ring; white text on it |
| sea-ink | #213C8C | small blue text, button hover |
| sea-deep | #13245A | footer, reviews band, story, top bar |
| on-navy text | #C9D3EE | body text on sea-deep |
| turquoise (secondary) | #1F9AA0 | icons, stars, numbers, dividers, progress — not small text on white |
| turquoise-ink | #0F6E73 | eyebrows / small turquoise text on light |
| turquoise-bright | #5CC8C8 | eyebrows & accents on navy |
| line | #DCE2F0 | borders, dividers |
| input border | #AFBBD6 | form fields |

**Shape & layout:** 1200px max container; gutters 48px desktop / 16px mobile; section padding 96–112px desktop, 64px mobile. Buttons are pills (radius 999, min-height 48). Cards are radius 16–24. Inputs are radius 4, height 48. The signature photo crop is an **arch** (`border-radius: 50% 50% 12px 12px / 200px 200px 12px 12px`). Eyebrows: Inter 600 12px, letter-spacing .14em, uppercase, turquoise-ink.

**Placeholder look:** diagonal stripes `repeating-linear-gradient(135deg,#E6EBF5 0 12px,#EEF2F9 12px 24px)` with uppercase 12px #3F4F70 label text. On navy: stripes `#3A57B0/#3350A8`, label #E9EEF9.

**Logo:** two files the owner supplies: `LOGO-01` blue on light, `LOGO-02` white on navy.

## 4. Sitemap v2

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Coming Soon | `/` before launch (`/coming-soon` after) | keep, apply fixes |
| 2 | Home | `/` after launch | revise |
| 3 | Menu | `/menu` | revise: add `[PRICE]` slots and "Order this" links |
| 4 | **Order** | `/order` | **new** |
| 5 | **Checkout** | `/order/checkout` | **new** |
| 6 | **Order confirmed** | `/order/confirmed` | **new** |
| 7 | Our Story | `/story` | **rebuild** as a scrolling narrative (no auto slideshow) |
| 8 | Visit | `/visit` | keep, apply fixes |
| 9 | Private Parties & Catering | `/catering` | keep, apply fixes |
| 10 | **Privacy & SMS Terms** | `/privacy` | **new**, short; the legal text is `[OWNER: legal text]`. Needed for SMS opt-in registration. |
| 11 | **Content checklist** (internal, not linked) | `/content-checklist` | **new**: every placeholder in §7–§8 as a checklist grouped by page |

**Nav (all pages):** Logo · Menu · Order · Our Story · Visit · Parties & Catering · [Order pickup] button. On mobile (<900px) the links collapse into a menu button (accessible dialog/drawer). The top bar shows "Walk-in only · 14035 LaGrange Rd" plus a launch-mode slot "Opening [OPENING DATE]" that can be switched off after launch.

**Footer:** keep the v1 footer and add Order and Privacy & SMS Terms links.

## 5. Fixes from the v1 review (all required)

1. **SMS consent:** every phone field used for texts gets an unticked checkbox: "Text me opening news and offers from Ibn Hamido. Msg & data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help. See Privacy & SMS Terms." The checkout's order-update texts get their own separate checkbox.
2. **Reduced motion:** when `prefers-reduced-motion: reduce`, no autoplay, no slide/scale transitions.
3. **Reviews carousel:** visible Pause/Play button; it also pauses on keyboard focus. Nothing is announced while autoplaying; `aria-live="polite"` only after a manual prev/next.
4. **Mobile nav:** menu button below 900px (see §4).
5. **No hover-only behaviour:** Cooking styles open on click/tap only (no layout jump on hover). The dish accordion may switch on hover only after a 150ms hover delay; click/tap always works.
6. **De-duplicate:** the 4-step "how it works" appears once on Home only, with the copy below. Story links to it. Remove "Today's catch" from Home (it lives on Menu/Order).
   - 01 Pick your fish: "Choose from the day's catch at the counter. It's weighed by the pound."
   - 02 Tell the chef how: "Grilled, fried, baked, singari, rada, butterflied or deboned."
   - 03 Take a seat: "We seat you while your fish hits the fire."
   - 04 Add your sides: "Golden rice, tahini, babaghanoush, the Hamido salad and more."
7. **Story:** rebuild as a vertical scroll narrative: 5 chapters, each a full-width photo slot + year + title + body, revealed on scroll (static when reduced motion is on).
8. **Arabic:** every Arabic line has `lang="ar" dir="rtl"`.
9. **Links:** "Cooking styles" buttons go to `/menu#styles`. All "Order" buttons go to `/order`.
10. **Halal:** add a conditional chip "Halal [OWNER CONFIRM]" in the Home hero and the Order header, flagged in the checklist.
11. **Press claims:** keep "NYT Top 100 · 4.7★ · 7.7/10 The Infatuation", labelled "The Astoria original", and add a checklist item `[VERIFY: NYT list name + year; rating sources]`.
12. **Astoria address:** Story chapter 3 says "31-29 Ditmars Blvd" with `[VERIFY: The Infatuation lists 33-08 Ditmars Blvd after a 2025 move]` in the checklist.
13. **Live states:** the "Open today [HOURS]" chip and the top-bar opening slot are data-driven, not hard-coded.
14. **Local SEO (build tools that output code):** schema.org `Restaurant` JSON-LD with address, `[PHONE]`, `[HOURS]`, `servesCuisine: ["Egyptian","Seafood","Mediterranean"]`, `hasMenu: /menu`, `acceptsReservations: false`.

## 6. Ordering flow spec

> Based on Astoria's online ordering (fixed-price items, pickup, paid online), **plus one deliberate addition: fresh catch is sold online by the pound** (`onlineByWeight: true`). Astoria only does this in-store. Guests pick a fish, an estimated weight and a cooking style. They pay the estimated total online, and the final price is set by actual weight at the counter.

**Order page (`/order`)**
- Header: "Order pickup" · Arabic line "اطلب من ابن حميدو" · subtitle "Browse the menu, build your order, pay online, pick up when it's ready." · address · "Ready in about [PREP TIME]" · Halal chip (conditional).
- **Ordering status banner**, 3 states: Open ("Ordering open · last orders [LAST ORDER TIME]") · Closed ("Online ordering has closed for today (last orders [LAST ORDER TIME]). Please check back during opening hours.") · Lunch (shown only when `combosLunchOnly` is on: "Hamido Combos available Mon–Fri [LUNCH HOURS]").
- Sticky category tabs that scroll-spy, in this order: **Fresh Catch · by the lb · Hamido Combos · Signature Dishes · Seafood Sandwiches · Salads & Sides** (§7).
- **Fresh Catch** section intro: "Today's catch, priced by the pound. Pick your fish, tell us how you want it, and we'll weigh and cook it for pickup." + a short "How by-the-pound works" explainer (3 steps: choose fish & estimated weight → pay the estimate → we weigh it, and your final price matches the actual weight). Fish cards show `[PRICE]/lb · market price`, an "Order by the lb" button, and a `Sold out today` state (per-fish `availableToday`).
- Item cards: photo slot (1:1, shot ID) · name · one-line description · `[PRICE]` · "Add" button · badges (`2 sides included`, `Sold out` state). Items **without** option groups add straight to the cart from the card with an "Added · Undo" toast (as Astoria does). Items with options open the sheet.

**Item options sheet** (modal on desktop, bottom sheet on mobile; focus-trapped, Esc closes). Option groups come from §7 `optionGroups`:
- Combo: Preparation (Grilled / Fried, where the item has it) · **Combo Sides (pick 2)**: a +/− stepper per side and a "0 / 2" counter, exactly 2 required; the same side can count twice (as Astoria allows) · instructions (140 chars) · quantity · "Add to order · [PRICE]".
- Signature dish: Preparation where listed (Red Snapper) · instructions · quantity.
- Sandwich and Fish & Chips: **Side (pick 1)**: Fries · Potato Chips Classic · BBQ · Salt & Vinegar · Sour Cream & Onion · instructions · quantity.
- Rice: Size Small / Medium / Large (each `[PRICE]`).
- Other sides: quantity + instructions.
- **Fresh catch (by the lb):** **Estimated weight** (required chips: 1 · 1.5 · 2 · 2.5 · 3 lb · Other, a stepper in 0.5 lb steps up to [MAX LB]; helper "About 1 lb of whole fish per person [OWNER CONFIRM]") · **How should the chef cook it?** (required radio, showing only that fish's allowed styles from `menu-data.json`: Grilled / Fried / Baked included; Singari / Rada / Butterfly / Deboned +[PRICE]; each with a one-line description and a link to Menu › Cooking styles) · **Add sides** (optional steppers, each [PRICE]) · instructions · a live price breakdown: `weight × ([PRICE]/lb + [PRICE]/lb cooking) + style = Est. [PRICE]` · note "We weigh your fish at the counter. Your final price is set by the actual weight and may differ slightly from the estimate." · "Add to order · Est. [PRICE]".

**Cart** (drawer from the right on desktop; full-screen sheet on mobile; a sticky bottom bar on mobile "View order (n) · [SUBTOTAL]")
- Line items with chosen options listed under the name · edit (reopens the sheet prefilled) · remove · quantity stepper.
- Subtotal · Tax `[TAX RATE]` · Tip (optional: 15/18/20/custom/none) · Total (labelled "Estimated total" only when by-weight items are present).
- Empty state: "Your order is empty" + "Browse the menu". The cart persists across pages (localStorage or equivalent).

**Checkout (`/order/checkout`)**
- Pickup time: ASAP ("about [PREP TIME]") or a scheduled slot (15-minute slots within today's [HOURS]; disabled when closed).
- Contact: name, mobile, email (labels, inline validation, error summary at the top).
- Order-update texts: separate unticked consent checkbox (see §5.1).
- Payment: a striped `[POS PAYMENT EMBED]` slot ("Pay online now, pick up when ready"). When fresh catch is in the cart, add the note: "Your card is authorised for the estimated total plus up to [AUTH BUFFER %]. We charge the final amount after weighing, and you'll get a receipt with the actual weight."
- Order summary (collapsible on mobile) · "Place order".

**Confirmation (`/order/confirmed`)**
- "Order #[ORDER NUMBER] is in." · pickup time · address + Get directions · Call `[PHONE NUMBER]` · item summary (fresh-catch lines marked "Est., final after weighing") · note "Dining in? We're walk-in only. Come pick your fish at the counter."

**States to show/design:** open, closed, lunch-only combos (flag), sold-out item, fish sold out today, fresh-catch sheet with its price breakdown, sheet validation error (fewer than 2 sides), empty cart, checkout errors, confirmation.

## 7. Menu data

> **Source:** Astoria's live online pickup menu (hamidoseafood.com/order), captured 2026-10-22. The full machine-readable version, with option groups and internal reference prices, is **`menu-data.json`**. Use it as the data file. Descriptions are paraphrased from the Astoria menu, so the owner confirms the wording. **Prices in the UI are always `[PRICE]`.** The "Astoria ref" column is internal only.
> Confirm the whole Orland Park lineup with the owner.

**Hamido Combos — your choice of two sides** *(Astoria ref $21.99 each)*

| ID | Item | Description | Options |
|---|---|---|---|
| CB-01 | Grilled Salmon | Half a pound of grilled salmon. | 2 sides |
| CB-02 | Mixed Grilled Calamari & Shrimp | Half a pound of calamari and shrimp off the grill. | 2 sides |
| CB-03 | Mixed Fried Calamari & Shrimp | Half a pound, lightly battered and fried. | 2 sides |
| CB-04 | Tiger Shrimp, Grilled or Fried | Seven black tiger shrimp. | prep + 2 sides |
| CB-05 | Calamari, Grilled or Fried | Half a pound of calamari. | prep + 2 sides |
| CB-06 | Whole Branzino, Grilled or Fried | A one-pound whole branzino. | prep + 2 sides |

Combo side choices (from Astoria's live menu): Baba Ganoush · Beet Salad · Garlic Eggplant · Hamido Salad · Lemon Potatoes · Moussaka · Rice · Seasoned Fries · Tahini (small portions). The same side may be picked twice.

**Signature Dishes**

| ID | Item | Description | Astoria ref |
|---|---|---|---|
| SG-01 | Branzino Stuffed Singari | Butterflied whole branzino stuffed with calamari, shrimp and vegetables. | $31.99 |
| SG-02 | Whole Wild Red Snapper | One pound, butterflied, fried or grilled, with garlic sauce (prep option). | $26.99 |
| SG-03 | Seafood Tajin | One-pound calamari and shrimp stew in tomato sauce. | $29.99 |
| SG-04 | Head-on Shrimp Butterfly | About a pound of wild head-on shrimp (3–4 pieces) in butter sauce. | $40.99 |
| SG-05 | Jumbo Shrimp Grilled | Wild jumbo shrimp stuffed with vegetables, garlic olive oil. | $24.99 |
| SG-06 | King Crab Legs | One pound in butter sauce, extra sauce on the side. | $99.99 |
| SG-07 | Lobster Tail (9 oz) | Buttery finish. | $29.99 |
| SG-08 | Baked Clams | A dozen little necks in garlic olive oil. | $21.99 |
| SG-09 | Scallops & Shrimp Linguine | Linguine in garlic sauce. | $23.99 |
| SG-10 | White Sauce Pasta with Shrimp | Penne in a creamy white sauce, one serving. | $16.99 |
| SG-11 | Fish & Chips | Four fried tilapia fillets with seasoned fries (side choice: fries or chips, as Astoria). | $19.99 |
| SG-12 | White Fried Shrimp | Fifteen fried white shrimp, tartar sauce. | $15.99 |
| SG-13 | Hamido Seafood Pizza | 12-inch, shrimp, scallops, peppers, mozzarella. | $26.99 |

**Seafood Sandwiches — with fries or potato chips (Classic, BBQ, Salt & Vinegar, Sour Cream & Onion)** *(Astoria ref $12.99 each)*
SW-01 Fried Fish Fillet Sandwich (tilapia, sautéed peppers & onions, hero) · SW-02 Grilled Fish Fillet Sandwich · SW-03 Fried Shrimp Sandwich (lettuce, tartar) · SW-04 Grilled Shrimp Sandwich (peppers & onions) · SW-05 Salmon Burger (homemade patty, brioche).

**Salads & Sides**

| ID | Item | Description | Astoria ref |
|---|---|---|---|
| SD-01 | Rice (Small / Medium / Large) | Egyptian golden rice with caramelized onions. | $5 / $6 / $7 |
| SD-02 | Tahini | Smooth sesame tahini. | $6.00 |
| SD-03 | Babaghanoush | Smoked eggplant, tahini, lemon, garlic, olive oil. | $6.00 |
| SD-04 | Hamido (House) Salad | Tomato, cucumber, cilantro, onion, vinegar, olive oil. | $7.49 |
| SD-05 | Beet Salad | Diced beets, garlic, olive oil. | $6.00 |
| SD-06 | Lemon Potatoes | Roasted potatoes and peppers in lemon and olive oil. | $6.00 |
| SD-07 | Garlic Eggplant | Roasted eggplant and mild chilies, garlic-vinegar marinade. | $6.00 |
| SD-08 | Moussaka | Eggplant and chilies in garlicky tomato sauce. Vegetarian. | $6.00 |
| SD-09 | French Fries | Straight-cut, house seasoning. | $7.49 |
| SD-10 | Greek Salad | Romaine, cucumber, tomato, onion, olives, feta. | $10.49 |
| SD-11 | Herring Salad | Smoked herring, tahini, tomato, lemon, vinegar. | $9.00 |
| SD-12 | Mezza Platter | Tahini, babaghanoush, moussaka, lemon potatoes. | $16.00 |

**Fresh Catch — by the pound, in-store and online** (the Menu page + the first Order category) · market price `[PRICE]/lb` per fish + cooking charge `[PRICE]/lb` · style extras `+[PRICE]` *(Astoria ref: market price + $4/lb cooking charge; singari/rada/butterfly/deboned extra; Astoria sells by the lb in-store only)*
Allowed cooking styles per fish (default, `[OWNER CONFIRM]`): Branzino & Red Snapper: all 7 · Salmon: grilled, fried, baked, singari · Tiger Shrimp & Scallops: grilled, fried, singari · Lobster: grilled, baked.
F-01 Branzino ("Mediterranean sea bass.") · F-02 Salmon · F-03 Red Snapper · F-04 Tiger Shrimp · F-05 Scallops · F-06 Lobster · F-07 [ADDITIONAL FISH]. Descriptions are `[OWNER: description]`.

**Cooking styles** (7): Grilled · Fried · Baked (included) · Singari · Rada · Butterfly · Deboned (+[PRICE]). Each description is `[OWNER: what it is, how it's prepared, best fish for it]`.

**Not on Astoria's online menu:** drinks, desserts, kids' items, hummus, grilled vegetables, pita `[VERIFY: are these served in Orland Park?]`.

**Allergen / dietary note:** `[OWNER: shellfish & gluten warnings, halal sourcing if applicable]`

## 8. Photo shot list (every image slot = one row)

| ID | Page | Shot | Ratio |
|---|---|---|---|
| LOGO-01 / 02 | global | Logo blue / logo white | vector |
| OG-01 | global | Social share image | 1200×630 |
| CS-01 | Coming Soon | Hero spread: grilled branzino, shrimp, rice, salads | arch 4:5 |
| H-01 | Home | Whole grilled branzino on the table | arch 3:4 |
| H-02 | Home | The fish counter on ice | arch 4:5 |
| H-03 | Home | Sides spread | 3:2 |
| H-04…H-07 | Home | Steps: catch on ice · chef at the grill · dining room · sides & pita | arch 4:5 |
| H-08 | Home | Story teaser: Alexandria harbor / family (video loop optional) | arch 4:5 |
| H-09 | Home | Catering trays on a long table | 16:10 |
| M-01 | Menu | Counter on ice | arch 4:5 |
| F-01…F-07 | Menu/Order | Each fish, raw on ice, overhead | 1:1 |
| K-01…K-07 | Menu | Each cooking style, plated | 16:9 |
| CB-01…CB-06 | Menu/Order | Each Hamido Combo, plated with two side bowls | 1:1 |
| SG-01…SG-13 | Menu/Order | Each signature dish, plated | 1:1 |
| SW-01…SW-05 | Menu/Order | Each sandwich with fries | 1:1 |
| SD-01…SD-12 | Menu/Order | Each salad/side | 1:1 |
| ST-01…ST-05 | Story | Alexandria/Qaitbay · family archive · Astoria storefront · Astoria dining room · Orland Park build/dining room | 16:9 full-bleed |
| V-01 | Visit | Orland Park storefront exterior | 3:2 |
| C-01…C-03 | Catering | Long table platters · room set for a party · catering trays | arch 4:5 / 3:2 |
| MAP | Home/Visit/CS | Google Maps embed: 14035 LaGrange Rd | 4:3 |

## 9. Owner content checklist (facts & copy)

- **Facts:** [OPENING DATE] · [HOURS] Mon–Thu / Fri–Sun · [LUNCH HOURS] · [HOLIDAY NOTE] · [PHONE NUMBER] · [EMAIL] · [@HANDLE] Instagram · Facebook [PAGE] · Google [LISTING] · [JOBS EMAIL] · [GRAND OPENING OFFER]
- **Ordering:** all [PRICE] values (Astoria refs in menu-data.json) · [TAX RATE] · [PREP TIME] · [LAST ORDER TIME] · pickup slot rules · POS/payment provider · sold-out handling
- **Parties & catering:** [CAPACITY] · [MIN. NOTICE] · tray sizes [X–Y] · [RESPONSE TIME]
- **Copy in the owner's words:** 7 cooking styles · 12 sides · 6 fish · Story: 4 × [YEAR], family history, origin of the name "Ibn Hamido", opening in Astoria, why Orland Park · 5 handpicked reviews (quote, first name + last initial, source)
- **Verify:** combos lunch-only or all day · by-the-lb online: POS weight-adjusted charging, [AUTH BUFFER %], [MAX LB], styles per fish, daily market prices & sold-out updates · "Bronzini" (Astoria menu) vs "Branzino" (site) · drinks/desserts/hummus/pita served? · NYT list + year · 4.7★ sources · Astoria address · Astoria brand name · halal · allergen note · tagline preference
- **Legal:** privacy policy + SMS terms text
