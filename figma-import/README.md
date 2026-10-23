# Figma import files (html.to.design)

Self-contained snapshots of every page, ready for the **html.to.design** Figma plugin. Each file is one frame at a fixed width:

- **Rendered:** the page after its JavaScript ran, with no autoplay and the Story chapters revealed.
- **Self-contained:** CSS inlined, media queries resolved for that width, and fonts and photos embedded. No network is needed.
- **Pre-named:** each file's `<title>` is the frame name, for example `Home — Desktop` or `Order — Cart open — Mobile`.

| Figma file | Folder |
|---|---|
| [Ibn Hamido — Base v2](https://www.figma.com/design/oYZJu9L7PhTNYInUz5sHRm) | `base/` |
| [Ibn Hamido — A · Corniche](https://www.figma.com/design/GgbwMZrpBHmsiMjxe2JELB) | `a-corniche/` |
| [Ibn Hamido — B · Anfushi market](https://www.figma.com/design/GX7lTEODTp3nWMuDgXQjc7) | `b-anfushi/` |
| [Ibn Hamido — C · Mix](https://www.figma.com/design/QTWiZzWXXNWZTySf7XZhPN) | `c-mix/` |

Each Figma file already has the pages **Cover · Coming Soon · Home · Menu · Order · Checkout & Confirmation · Our Story · Visit · Parties & Catering · Privacy · Styles**. The Cover is filled in, and the Styles page holds that look's color styles and text styles.

## Which files go on which Figma page

| Figma page | Files (each comes as `-1440` Desktop and `-390` Mobile) |
|---|---|
| Coming Soon | `01-coming-soon` |
| Home | `02-home` |
| Menu | `03-menu` |
| Order | `04-order`, plus the states `04-order-state-cart-open`, `-combo-sheet`, `-sides-error`, `-fresh-catch-sheet`, `-ordering-closed` |
| Checkout & Confirmation | `05-checkout`, plus the states `05-checkout-state-errors`, `05-checkout-state-confirmed` |
| Our Story | `06-story` |
| Visit | `07-visit` |
| Parties & Catering | `08-catering` |
| Privacy | `09-privacy` |

The cart and sheet states are one screen tall (1440×900 or 390×844) because the panel sits over the page. Everything else is full-page.

## Click by click

**One-time setup**
1. On GitHub, open the repo, click **Code → Download ZIP** and unzip it. Or `git clone` it.
2. In Figma, open **Community** (or Resources, Shift+I) → **Plugins**, search for **html.to.design** (by ‹div›RIOTS) and click **Open** or **Save**.

**For each design (repeat 4 times)**

3. Open the matching Figma file from the table above.
4. In the left sidebar, click the **Home** page.
5. Run the plugin: **Main menu → Plugins → html.to.design**, or Shift+I → Plugins → html.to.design.
6. Click the plugin's **File** tab.
7. Drag `figma-import/<design>/02-home-1440.html` onto the drop zone. Leave the import options at their defaults (the files are already fixed-width) and click **Import**. The frame arrives as **Home — Desktop**.
8. Drag `02-home-390.html` in the same way. It arrives as **Home — Mobile**.
9. Put them side by side: select **Home — Mobile** and, in the right panel, set **X = 1540, Y = 0**. **Home — Desktop** stays at X = 0, Y = 0.
10. Repeat steps 4–9 for every page, using the table above.
    - **Order:** put the five state frames in a row under the Desktop/Mobile pair (Y = the Desktop frame's height + 200), Desktop states first, then Mobile states.
    - **Checkout & Confirmation:** same idea with the Errors and Confirmed frames.

**Faster: one import per Figma page.** The File tab also accepts a **.zip** under 32 MB and imports every page inside it. Every page group here is under 14 MB.
- Windows: in the design folder, select for example all twelve `04-order*` files, then right-click → **Send to → Compressed (zipped) folder**.
- macOS: right-click → **Compress**.

Then drop that zip in step 7 to import all twelve frames at once.

## Notes

- If a frame name doesn't come through as the file's title, rename the frame to `<Page> — Desktop` / `<Page> — Mobile` (states: `Order — Cart open — Desktop`, and so on).
- **Fonts:** Young Serif, Inter, Aref Ruqaa and Rakkas are all Google Fonts that Figma already has, so text stays editable in the right typeface.
- **Photo tags:** "AI concept" and "Stand-in" tags on photos are part of the mockup. Delete them from frames you hand to the owner as finals.
- **Regenerating:** these files are generated from the static site. If a page changes, regenerate them rather than editing by hand.
