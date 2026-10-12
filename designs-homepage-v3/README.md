# Overdrafter homepage v3: print set

A static prototype. Nothing is live: no deploys, PRs, pushes, DNS or Vercel changes, and no messages. Open `index.html` directly; it works from `file://`. The only external dependency is Google Fonts (Questrial, IBM Plex Sans, IBM Plex Mono).

## Concept
The homepage is an engineering print set of six sheets, styled after a SolidWorks drawing sheet:
- a zone border (numbers 6 to 1 across, letters D to A down);
- a REVISIONS table top right;
- a full title block bottom right;
- an unlabelled QR code bottom left;
- dimension lines with arrowheads;
- Questrial, a Century Gothic style drafting face.

Every table sits flush in its corner, touching the border lines.

The sheets:
1. **Cover.** Bill of materials top left, an isometric shop with balloons 1 to 6, and the hero copy.
2. **Instant quotes everywhere.** The sample quote field.
3. **The shop library.** A labelled photo placeholder.
4. **Built to connect.**
5. **Results.**
6. **Founder note.** Join the founding beta and Sign in.

Every sheet carries a CTA, Previous and Next sheet buttons, the revisions table and the title block.

## Magnetic sheets (Blaine's decision, overriding the earlier no scroll jacking plan)
- **One flip per input.** Any wheel, trackpad, swipe or key press (PageUp/PageDown, Space, arrows, Home/End) flips exactly one sheet.
  - One flip per gesture: wheel events under 220ms apart are one gesture, so trackpad inertia flips once.
  - Input is locked while a flip runs.
- **Never intercepted:** input inside the modal, the jump menu or form fields; Space on a focused control; ctrl+wheel zoom.
- **Tall sheets** (phones, short windows) scroll inside themselves first. They flip only from a gesture that starts at the top or bottom edge, so nothing is trapped.
- **After a flip,** focus moves to the new heading and a live region announces the sheet.
- **The flip** peels the sheet from its top right corner, where a paperclip would hold the set. It uses a 3D rotate with transform and opacity only.
- **Reduced motion** is an instant swap.
- **One page view.** The jump menu has "Show all sheets on one page", which turns the deck into a normal scrolling page for find in page, reader modes and screen readers.
- The risks are documented in `FEASIBILITY.md`.

## Interaction
- **Sheet counter.** The SHEET N OF 6 cell in each title block opens the jump menu. Small screens also get a fixed chip.
  - Arrow keys move through the menu; Escape closes it and returns focus.
  - The current sheet carries `aria-current`.
- **Title block info hub.** Each field shows a quick fact tooltip on hover, keyboard focus or first tap, and opens a native `<dialog>` modal on click, Enter or second tap. Escape dismisses tooltips; modals trap focus and return it.
  - Fields: tolerance block, draft notice, projection symbol, theme note, each NAME/DATE row, notes, logo, web/contact, title, size, DWG. NO., REV, DO NOT SCALE, weight.
- **Revisions table.** Each row opens a modal listing what changed.
- **Two way zones.** Hover or focus a BOM line to light its zone in the drawing, or hover, focus or tap a balloon or zone to light its BOM line. Enter or Space pins the highlight, and Escape clears it.
- **Theme.** Dark by default. The toggle persists to localStorage key `od-theme`, with transition suppression during the swap.

## Bill of materials and zone map (final, from Blaine)
| Item | Part number | Description | Balloon | Zone in the drawing |
|---|---|---|---|---|
| 1 | OVD-001 | DESIGN | 1 | CAD desk |
| 2 | OVD-002 | ANALYSIS | 2 | Analysis workstation |
| 3 | OVD-003 | PDM | 3 | File server |
| 4 | OVD-004 | FABRICATION | 4 | CNC machines |
| 5 | OVD-005 | FULFILLMENT | 5 | Shipping dock |
| 6 | OVD-006 | MARKETPLACE | 6 | Showroom counter |

## How to add a rev
1. Append an entry to `revs` in `changelog.json` (oldest first):
   ```json
   { "rev": "02", "label": "PRE-RELEASE", "eng": "BSW", "date": "10/18/2026",
     "desc": "Short summary", "changes": ["One line per change"] }
   ```
   `label` shows in the DESCRIPTION column, `eng` in ENG., `date` in DATE (MM/DD/YYYY).
2. Run `python3 src/build.py`. It renders the row into every revisions table and inlines the JSON for the rev modals. The title block REV and the DRAWN date then show the newest entry. WEIGHT is recomputed.
3. Keep descriptions free of hyphens and dashes (PRE-RELEASE excepted, as supplied).

Edit `src/template.html` (CSS and JS), `src/build.py` (sheets, BOM, drawing, title block, modals) or `changelog.json`, then rebuild. Do not hand edit `index.html`.

## Files
- `index.html`: the built page.
- `FEASIBILITY.md`: the council review, plus an addendum with the magnetic sheets override and risks, the restyle, the zone map and the revisions table.
- `changelog.json`: drives the revisions table.
- `qr.svg`: generated locally, decodes to https://www.overdrafter.com.
- `src/build.py`, `src/template.html`, `src/zone-map.md`: the generator, the template and the generated zone map.
- `reference/`: Blaine's style reference photos. They are proprietary, used for style only, and not linked or shipped by the page.
- `screenshots/`:
  - every sheet in dark at desktop 1440 and mobile 390 (mobile shots show the full sheet);
  - light samples;
  - jump menu (desktop and mobile);
  - title block modal (desktop and mobile);
  - revision modal;
  - hover and tap tooltips;
  - both zone highlight directions;
  - two mid peel frames.
- `_superseded-single-page.html`: the earlier draft, for reference only.

## Copy
- **Verbatim copy:** Blaine's copy is used verbatim, including the applied fixes: "instant quote shops" without a hyphen, and "optomechanical engineer" in the founder note.
- **Links:**
  - "Join the founding beta" and "Upload a part" go to https://www.overdrafter.com/?auth=signup.
  - "Sign in" goes to https://www.overdrafter.com/?auth=signin.
- **Founder note:** marked as draft on the page ("Draft copy pending founder approval").
- **No providers or counts:** no provider names, provider counts or route framing. A scan of the copy areas found no digits.

## Placeholders
- **Sign offs:** only Blaine's initials (BSW) appear in name fields. CHECKED, ENG APPR. and Q.A. are marked PLACEHOLDER.
- **Contact:** contact phone, email and address are placeholders.
- **Shop photo:** a labelled placeholder.
- **Chart:** sample data, with anonymized shops.

## Flags
- **Hyphens.** OVD-001 to OVD-006, OVD-HOME-0001 and PRE-RELEASE contain hyphens. They are kept because Blaine specified them, but they conflict with the no-hyphen copy rule.
- **Magnetic sheets.** They override the earlier no scroll jacking recommendation. Risks:
  - wheel expectations;
  - find in page and screen reader reading in sheet mode (mitigated by the one page view);
  - no per sheet URL or back button support.
- **Unbuilt features without a planned label (per Blaine).** The BOM lists Analysis, PDM, Fabrication, Fulfillment and Marketplace, which are not built yet, with no planned label. This is an expectations risk.
- **Peel duration.** At 480ms (down from 640ms, per critique W3) it is still longer than the 300ms UI motion guidance; treated as a page transition.
- **QR on phones.** The QR stays visible at 390px even though a phone cannot scan its own screen, because Blaine placed it in the bottom left corner (see the critique response, W7).
- **Decorative title block content.** The tolerance block, projection symbol and "do not scale" are decorative drawing conventions on a web page. WEIGHT is the real file size.
- **Duplicate CTA intent.** Join and Upload both go to signup, and signup is not beta enrollment.
- **Long subhead.** It runs past the design-taste-frontend hero length guideline; kept verbatim.
- **Brand spelling.** "Overdrafter" in the copy, "OverDrafter" in the repo.
- **"A dozen tabs"** is a word number inside the copy.
- **Dark default** departs from the repo DESIGN.md light default.
- **Style reference.** The reference drawings are another company's proprietary documents. Only the general drafting style was copied, and a grep of all outputs found none of their text.
- **Small labels on mobile.** At 390px the drawing's balloons are small; the BOM carries the text.
- **JavaScript.** Content is static HTML. The flip, tooltips, modals, jump menu, zones and chart need JavaScript; without it only the first sheet shows.

## Skills applied
- **better-ui:**
  - press scale 0.96 over 150ms;
  - named transitions;
  - hover gated by `(hover:hover)`;
  - theme swap suppression;
  - staggered entrance;
  - exits faster than enters;
  - reduced motion becomes an instant or opacity change;
  - `overscroll-behavior: contain`.
- **emil-design-eng:**
  - custom ease out;
  - origin aware popovers and tooltips from scale 0.96;
  - no animation on keyboard opened menus and modals;
  - tooltip delay, then instant on neighbours;
  - the peel uses transform and opacity only.
- **design-taste-frontend:**
  - zero em dashes;
  - no eyebrow labels on sheets two to five;
  - no fake metrics (dimensions are words, weight is real);
  - labelled placeholders;
  - CTAs on one line;
  - no window scroll listeners;
  - both themes tested.

## Critique response (2026-10-11)
Source: `/workspace/critiques/overdrafter-homepage-v3/2026-10-11-critique.md` and `fix-list.md`. The copy, the brief and Blaine's decisions are unchanged.

| ID | Status | What was done / why |
|---|---|---|
| B1 | Applied | Dark: `--accent` #FF7A1A, `--accent-hover` #FF8F3D, `--on-accent` #141C22 (6.6:1). Light: the button fill is a new `--accent-fill` #FF7A1A with dark text #1C1B19 (6.6:1, hover #FF8F3D); `--accent` stays #C2410C and is used only for orange text and strokes (4.51:1 on the light background). The skip link also moved to the fill token. |
| B2 | Applied (modified) | The header "Join the founding beta" is now an outline `.btn`. "Upload a part" is the only solid primary on all six sheets. Sheet 6 now leads with a solid Upload a part, followed by outline Join the founding beta and Sign in. **Rejected part:** the critique's "make beta solid on sheet 6", because Blaine named Upload as the primary. A test confirms exactly one visible primary per sheet at 1440 and 390. |
| B3 | Applied | Mobile (≤760px, which covers ≤600px) order is headline, body, CTAs, iso, BOM. REVISIONS collapses to its latest row only, with no header (29px). The CTA ends at about 479px, inside the first 844px viewport. |
| W1 | Applied | The wordmark is 20px with .18em tracking and no wrapping, the logo cell has `overflow:hidden`, and the contact column keeps at least 150px. It measures 192px inside a 208px cell. |
| W2 | Applied (alternative) | Rather than a compact "Join beta" button in the bar (that label would change the copy, and the 390px bar has no room for the full label), the jump menu now has a "Join the founding beta" link using the verbatim label. It is reachable from the sheet counter on every sheet. |
| W3 | Applied | The turning sheet is a single opaque layer: opacity holds at 1 until 88%, with a 1px `--frame` fold edge, a 24px `--shadow` gradient at the lifting corner and a smaller drop shadow. The angle is capped at 70° so the sheet never goes edge on, which is what caused the streaks. Duration 480ms with ease out `cubic-bezier(0.23,1,0.32,1)`. It still peels from the top right corner. New captures: `peel-90ms`, `peel-180ms`. |
| W4 | Applied | On `(pointer:coarse)`, `.seg button`, `.btn.sm` and `.pg` have `min-height:44px`. On coarse mobile, `.seg button` uses `padding:12px 14px`. A test found 0 visible targets under 44px at 390. |
| W5 | Applied | Outline button and pager borders now use `--frame` (9.4:1 dark, 15:1 light). `--hairline` is raised to #3E4F5B in dark (1.54 to 2.03:1) and #C4BBAA in light (1.39 to 1.76:1). Hairlines stay decorative; the borders that carry meaning use `--frame`. |
| W6 | Applied | A disabled pager button keeps opacity .4 and loses its border. At ≤760px it is hidden and Next or Previous fills the row. |
| W7 | Partly applied | Each sheet's inner frame gets `padding-bottom:64px` on mobile, so the "Sheet x of 6" badge rests on empty margin; a test found 0 overlaps with the title block or QR. **Rejected part:** hiding the QR at ≤600px. Blaine placed the QR in the bottom left corner with no label, and hiding it would reverse that decision. It is flagged for him instead. |
| W8 | Noted for Blaine | The placeholder photo (sheet 3), "Draft copy pending founder approval" (sheet 6), and the placeholder contacts and sign offs in the title block need real content before launch. If the photo isn't ready, the critique suggests shrinking the sheet 3 panel to the five record cells. Nothing was changed. |
| M1 | Applied | "Blaine." sits on its own line: drafting font, 14px, .14em tracking, `--muted`, 16px top margin. The case and words are unchanged (no uppercase transform). |
| M2 | Applied | The modal heading uses `white-space:nowrap` and `clamp(22px,6.4vw,28px)`, so OVD-HOME-0001 stays on one line at 390. |
| M3 | Applied | `.g-results .words` uses the cover h1 scale (`clamp(44px,4.4vw,70px)`, about 63px at 1440; 40 to 56px on mobile). |
| M4 | Applied (through B1) | Dark small orange text on surface is now 5.97:1 (was 4.40:1). |

**Rejected:** B2's "beta solid on sheet 6" (Blaine named Upload the primary), and W7's "hide QR on mobile" (Blaine's QR placement). W2 was done through the jump menu rather than a compact header button, to keep the copy verbatim.

The revision table still reads REV 01 PRE-RELEASE. Blaine can log this pass as REV 02 in `changelog.json` if he wants it on the sheet.

## Self critique (Awwwards rubric, after this revision)
Fixed during this pass:
- the cover hero dropped below the drawing;
- the drawing ran under the title block;
- SIZE B and the placeholders clipped;
- the chart collided with the corner tables;
- the peel went translucent too early;
- hidden tooltips widened mobile sheets.

| Criterion | Weight | Score |
|---|---|---|
| Design | 40% | 9.2 |
| Usability | 30% | 8.1 |
| Creativity | 20% | 9.3 |
| Content | 10% | 8.0 |
| **Weighted** | | **8.77** (was 8.52) |

After the critique pass, Design gains from the briefed orange, a single primary per sheet, the clean peel and the wordmark fix. Usability gains from the mobile hero order, 44px targets, stronger borders and the badge clearance. It stays the lowest score because of the magnetic sheets trade-off and the placeholders (W8).
