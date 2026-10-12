# Homepage v3, anatomy cover (mockup copy)

This is a copy of `/workspace/designs/homepage-v3/`, which is unchanged. The only difference is that the cover's isometric machine shop and engineering office drawing was rebuilt with the anatomy skill (`/home/box/agent-data/workflows/anatomy/`). Everything else (copy, BOM, sheets, title block, tests) is the same as v3 after the critique pass. It is a mockup only; nothing is live.

## How it is built
- **Skill copy.** `anatomy/` is a working copy of the skill (MIT, see `anatomy/LICENSE`), so the approved skill folder is untouched. The cover figure is a new example, `anatomy/examples/overdrafter-shop/build.mjs`. It was started from `desk-computer` (monitors drawn in the plane of a face, keys moved with `translateAlong`).
- **Build.** `python3 src/build.py` writes `src/bom.json` from the BOM, runs `node examples/overdrafter-shop/build.mjs`, and inlines its output:
  - `src/shop.svg`: 64 kit solids, 170 paths, 14.4 KB (integer coordinates, relative path commands, collinear points removed);
  - `src/shop-const.json`: camera and moving part constants;
  - `src/shop-theme.css` (now the only figure CSS; the kit's iso.css is no longer inlined) and `src/shop-live.js`.
  - Balloon positions live in `anatomy/examples/overdrafter-shop/balloons.json` (an anchor point plus either a screen offset or a floor point).
- **Check.** `anatomy/scripts/capture.mjs` (desktop, 390, reduced motion: console clean, no sideways scroll), and `anatomy/scripts/lines.mjs`. See the critique response for the line end results after the drafting restyle.

## The drawing
- **Room.** A floor slab with a grid, two cut walls (the cut end of the server rack is hatched), two windows, a door and dashed hidden lines where the walls meet the floor.
- **Zones.** Six zones, one per BOM line, painted back to front by `depthOf`.

| Item | Zone | Parts | Moves when its BOM line or balloon is highlighted |
|---|---|---|---|
| 1 Design | CAD desk | desk, monitor, printed bracket | the bracket turns in wireframe on the CAD screen |
| 2 Analysis | Analysis workstation | desk, tower, two monitors | load case bars rise and fall; a cantilever beam deflects |
| 3 PDM | File server | two racks with unit seams and activity lights | a drive sled slides out of the rack; activity lights run down the units |
| 4 Fabrication | CNC machines | mill (base, column with rails, head and spindle, table with vise and part); lathe (cabinet, splash guard, ways, headstock, chuck, bar stock, tailstock, carriage and tool post) | the mill table feeds in X while the head plunges; the lathe carriage traverses; the chuck turns |
| 5 Fulfillment | Shipping dock | taped bay, roller conveyor, pallet (three runners and a deck) with two loads, parcel, label printer | a parcel rides the conveyor toward the pallet |
| 6 Marketplace | Showroom counter | counter, top, turntable, display part | the display turntable turns |

## Interaction
- **Unchanged contract.** The BOM row, the BOM button and balloons 1 to 6 still call the same `hl(zone)`, which now also calls `ODShop.set(zone, mode)`.
- **Inputs.** Hover (mouse), focus (keyboard), and tap or click (pin, Escape clears) all highlight and animate the zone. The other zones dim to 25%; their balloons dim only to 50% so they stay readable.
- **Motion modes.** Hover loops for as long as the pointer stays. A pin or keyboard focus runs 2 cycles (2 s each), then eases into the still working pose and the loop stops (WCAG 2.2.2). The rack lights chase at 3 steps per second.
- **Loop.**
  - One `requestAnimationFrame` loop, time based (dt clamped to 1/30 s).
  - Each zone's motion eases in and out (τ 0.28 s), so nothing snaps.
  - The loop stops once every zone has settled. It also stops when the cover is not the current sheet, when the drawing is offscreen (IntersectionObserver) and when the tab is hidden.
  - Measured 60 fps with 4x CPU throttle.
- **Reduced motion.** No loop. A highlighted zone jumps to a still working pose (sled out, spindle down, parcel on the conveyor, and so on), so input still visibly does something.
- **Accessibility.** The svg keeps `role="group"`, a title and balloon buttons with the same labels as v3. The BOM buttons and the balloons are each one tab stop (roving tabindex: arrows, Home and End move inside the group without flipping the sheet). A focused balloon gets a 2px accent ring outside the balloon. Moving parts are decorative.
- **Mobile.** At 390 the BOM rows are the control (the whole row is the tap target, 44px tall) and sit directly under the drawing; the balloons are enlarged but not interactive. A tap scrolls the drawing back into view if it has left the top of the screen.
- **Themes.** The kit tokens are mapped onto the sheet tokens (`src/shop-theme.css`): paper is `--bg`, ink is `--text`, `--rule` and `--hairline`, and the highlight is `--accent`. Both themes work.

## Deviations from the skill, on purpose
- **Balloons and dimension lines are kept.** The skill says no leader lines, balloons, dimension arrows or labels in the drawing. The brief requires balloons 1 to 6 and dimension lines, so they sit in a drafting layer above the figure.
- **No card.** The skill's card (Fig n, title, hint, readout) is not used, because the drawing sheet is the card and the BOM highlight is the readout.
- **No idle tour.** The skill asks for a looping tour when idle. On a homepage cover it would keep highlighting BOM lines on its own and pull attention from the headline, so motion only runs while a zone is highlighted.
- **Not the kit's look.** Kit halos, shading and the kit stylesheet are not used. Each solid is drawn as one paper fill with a 1.5px silhouette and 0.75px creases, so the line drawing matches the sheet.
- **Hero scope, not Epic.** The skill classes a whole building with many moving systems as an Epic and says not to start one. This was built at Hero scope (64 solids after the critique pass, one or two mechanisms per zone), because a full shop rebuild was asked for explicitly.
- **Moving parts are rebuilt by a small page script.** The sled, turntable part, chuck jaws and screen content are rebuilt each frame with its own projection, which uses the kit's camera formula and `P`. Inlining the full kit (`kitScript()`) would have added its whole source for six shapes.
- **No geometry audit.** `--audit` (kit/audit.mjs) was not run, because the figure has no pipes, cables or turned assemblies that the audit targets. Depth order was checked by eye in 4x captures.

## Cost
Page weight is 137 KB (140,600 bytes), the same as v3 before the QR dedupe and under the 160 KB target. It was 290 KB before the critique pass.

## Critique response (anatomy, 2026-10-11)
Source: `/workspace/critiques/overdrafter-homepage-v3-anatomy/2026-10-11-critique.md` and `fix-list.md`. The copy, the brief and Blaine's decisions are unchanged. W2 (jump menu link instead of a compact header button) and W7 (QR kept on mobile) stay as decided in the v3 pass, and W8 (placeholders) is still Blaine's.

| ID | Status | What was done / why |
|---|---|---|
| A1 | Applied | 290 KB to 137 KB (140,600 bytes). The figure SVG went from about 162 KB and 932 paths to 14.4 KB and 170 paths: integer coordinates, relative commands, duplicate and collinear points dropped, one fill per solid, kit CSS no longer inlined, props removed (A2). The QR is now one `<symbol>` used six times with `<use>`. Note: the QR copies were about 1.5 KB each, so the dedupe saved about 7.5 KB, not the larger figure the critique estimated. |
| A2 | Applied | Drafting weights: 1.5px silhouettes, 0.75px creases, a single paper fill, no shading. Added dashed hidden lines at the wall and floor joints and one 45° hatch on the cut rack end. Props under about 12px were dropped: chairs, keyboards, mice, sketch pad, wall shelf, card reader, pendant, vents; the pallet is down to three runners, a deck and two loads. |
| A3 | Applied | Neutral at rest: screens, tape, lights and leaders use the sheet's ink tokens. Orange appears only under `.z.on` (the active zone, its balloon and its BOM row). A test counts 0 accent-coloured elements in the drawing at rest. No orange element was kept at rest, including the CAD screen. |
| A4 | Applied | A pin or keyboard focus runs 2 cycles, then eases into the still pose and the loop stops (tested: loop time stops advancing, highlight and `aria-pressed` stay). Hover still loops while hovered, since the pointer leaving ends it. LED chase is 3 steps a second (was 9). |
| A5 | Applied | Roving tabindex: the six BOM buttons are one tab stop and the six balloons are one tab stop (was 12). Arrows, Home and End move within each group and do not flip the sheet. Focused balloons get a 2px accent ring outside the balloon edge, separate from the highlight. |
| A6 | Applied (BOM control option) | At 390 the BOM is directly under the drawing (20px gap) and its rows are the control: the whole row is the tap target, 44px tall. The balloons are enlarged (radius 20 in drawing units, number 20) but not interactive, so no tiny tap targets remain. A tap scrolls the drawing into view if needed. The optional auto tour was skipped (same reason as the idle tour deviation). |
| A7 | Applied | The active row gets a 3px accent inset bar on its first cell, a 14% accent tint and accent text. Questrial has no 500 weight, so the heavier look comes from a 0.35px text stroke instead of `font-weight:500`. |
| A8 | Applied, with notes | Balloons moved off objects: 3, 4 and 6 sit outside the room silhouette above the walls, and 2 sits outside the left edge. 1 and 5 sit on clear floor inside the room, because putting them outside would mean crossing the dimension lines or several other zones. The collision check (`_tools/anat-balloons.js`) finds no balloon touching any object. The remaining hits are leaders crossing plain wall faces, which can't be avoided from outside, and leader 2 grazing the base of the counter by the left wall. |
| A9 | Applied | When a zone is highlighted, the other balloons dim to 50% (was 25%). Their zones still dim to 25%. |
| A10 | Applied | Light theme zone shots added: `screenshots/zone-N-*-desktop-1440-light.png`, next to the dark set. |

**Rejected:** none of A1 to A10. A6 used the fix list's "BOM only control" option rather than 44px balloon hit areas. The optional auto tour was skipped.

**Also applied to v3:** the QR `<symbol>`/`<use>` dedupe in `/workspace/designs/homepage-v3/` (137 KB to 130 KB, 133,421 bytes). Nothing else in v3 changed.

**Tests after this pass:**
- `v4test-anat.js`, `v5check-anat.js`, `v4test.js` and `v5check.js` all pass with no errors.
- `anat-motion2.js` covers: neutral at rest, every zone moving on hover, balloons at 50%, the 2-cycle settle and loop stop, roving tab stops, ring and row cues, the loop stopping off-sheet, the reduced motion still poses, mobile order (BOM 20px under the drawing, 44px rows) and mobile tap.
- `anat-fps.js` runs at 61 fps with a 17 ms worst frame, for every zone, with 4x CPU throttle.
- `anatomy/scripts/capture.mjs` (desktop, 390, reduced motion) shows a clean console and no sideways scroll.
- `anatomy/scripts/lines.mjs` on the page as built checks 0 lines, because the restyle no longer uses the kit's `.iso-line` class. On a probe copy with creases, leaders, hidden lines and extension lines tagged as `.iso-line`, 4 of 276 ends float at 1.5px tolerance:
  - the extension lines' deliberate drafting gap from the object (3);
  - leader 4 ending on the face of the mill head (1).

**Screenshots re-shot:**
- the cover at 1440 (dark and light) and 390 (dark and light);
- the six zones at 1440 (dark and light);
- the jump menu, modals, tooltips and both zone directions;
- every v3 sheet.

---

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
