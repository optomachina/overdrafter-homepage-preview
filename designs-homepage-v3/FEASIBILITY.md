# v3 feasibility review: homepage as a multi-sheet engineering print set

Written before the build. Each reviewer below is a review lens, not a real person. The **Decisions** at the end are what the build follows.

## The concept as briefed
- **Sheets:** every section is a full-viewport drawing sheet with a real title block (rev letter, date, drawn by, and so on).
- **CTAs:** each sheet has its CTA in its main view.
- **Transition:** scrolling rolls the current sheet off to reveal the next.
- **Navigation:** every sheet has Previous and Next buttons, and a "Sheet N of M" counter at bottom right opens a jump menu.
- **Title block as info hub:** hovering, focusing or tapping a field shows a quick fact; clicking opens a modal.
- **QR code:** a locally generated, scannable QR code to https://www.overdrafter.com sits in the drawing.

## Council

### Interaction and pacing
- **Sheet count:** six sheets fit the supplied copy exactly: Cover (hero and quote chart), Instant quotes everywhere, The shop library, Built to connect, Results, Founder note and close. More sheets would pad the copy. Fewer would cram the cover, which already holds the chart.
- **Pacing risk:** a print set reads slower than a scrolling page, and visitors who want the CTA should never have to page through all six sheets to find it. So every sheet carries a CTA, the top bar keeps "Join the founding beta" and "Sign in" visible on every sheet, and the jump menu lets readers skip ahead.
- **Transition length:** the roll should feel like turning a sheet, not a cinematic. It is tied to scroll position, not a timer, so it moves only as fast as the reader scrolls.

### Scroll-jacking (the biggest risk)
- **Rejected: hijacking wheel or touch events** (preventDefault plus a JS tween). This breaks trackpad momentum, keyboard scrolling, find in page, screen reader virtual cursors, browser zoom and scroll restoration. It is also the usual source of the "page is fighting me" complaint. design-taste-frontend bans `window.addEventListener('scroll')`.
- **Chosen: native document scroll with CSS `scroll-snap-type: y mandatory`** on tall enough desktop viewports, and `scroll-snap-stop: always` on each sheet so a fast flick does not skip a sheet. The browser owns the scroll; snapping only settles it.
- **The roll uses CSS scroll-driven animations** (`animation-timeline: view()` with `animation-range: exit`). They run on the compositor, are tied to real scroll position and reverse naturally when the reader scrolls back. Only `transform` and `opacity` animate.
- **Fallback:** browsers without `animation-timeline` get plain snapping with no roll, decided by `@supports`. Nothing breaks.
- **IntersectionObserver** (not a scroll listener) tracks the current sheet for the counter and `aria-current`.

### Mobile
- **Content outgrows the viewport.** At 390px the cover sheet (headline, subhead, CTAs, chart and readout) cannot fit in one viewport. Mandatory snap with content taller than the viewport traps or skips content, which is a known iOS failure.
- **Decision: under 760px wide, or under 720px tall,** sheets size to their content (`min-height: 100svh`), snapping relaxes to `proximity`, and the roll becomes an opacity fade on exit only. Sheets still read as separate prints with their own frame and title block.
- **Title block on mobile** stacks into a two-column grid below the sheet content. Field taps follow the same tooltip and modal rules (see Accessibility).
- **Counter and jump menu** stay fixed bottom right with a 44px minimum target, clear of the iOS home indicator through `env(safe-area-inset-bottom)`.
- **`100svh`, not `100vh`,** so the iOS address bar does not cause a jump.

### Reduced motion
- **Under `prefers-reduced-motion: reduce`:** no roll transform. The scroll-driven animation is replaced by an opacity cross-fade (better-ui: replace movement with opacity, do not remove it outright), smooth scrolling is turned off so Previous, Next and the jump menu move instantly, and press scaling and menu scaling are disabled.
- **Snapping stays.** It is not motion, and it helps sheet-by-sheet reading.

### Accessibility
- **Structure:** each sheet is a `<section>` with `aria-labelledby` pointing at its heading. The heading has `tabindex="-1"`, so programmatic navigation can move focus to it. A skip link goes to sheet one.
- **Keyboard:** native Page Up, Page Down, Space, arrows and Home/End all work, because scroll is not hijacked. Previous and Next are real `<button>`s. On the first sheet Previous is disabled, and on the last sheet Next is disabled (`aria-disabled`, still focusable so it can be announced).
- **Focus after navigation:** Previous, Next and the jump menu scroll to the target sheet, then focus its heading with `preventScroll`, so screen reader and keyboard users land where they expect.
- **Jump menu:** a `<button aria-haspopup="dialog" aria-expanded aria-controls>` labelled "Sheet N of M, jump to sheet". It opens a non-modal panel with `role="dialog"` and `aria-label="Jump to sheet"`, holding a list of buttons where the current sheet carries `aria-current="true"`. Opening focuses the current item, Up and Down arrows move between items, and Escape or an outside click closes it and returns focus to the counter. A visually hidden `aria-live="polite"` region announces sheet changes made by scrolling.
- **Title block tooltips** (WCAG 1.4.13: content on hover or focus):
  - each field is a `<button>` linked to its tooltip with `aria-describedby`;
  - the tooltip has `role="tooltip"`;
  - it shows on hover (after a short delay, then instantly on neighbouring fields, per emil-design-eng) and on keyboard focus;
  - it can be hovered itself without disappearing, Escape dismisses it, and it stays until the pointer or focus leaves.
- **Tap behaviour:** a first tap shows the tooltip; a second tap on the same field, or tapping its "Details" hint, opens the modal. Mouse click and Enter open the modal directly.
- **Modals:** a native `<dialog>` opened with `showModal()` gives a real focus trap, Escape to close and an inert background. It has `aria-labelledby` and a visible Close button, closes on backdrop click, and returns focus to the field that opened it.
- **Contrast:** AA is checked for both themes. The QR code always renders dark on a light patch, because inverted codes fail on some scanners.
- **The roll is decorative.** No information depends on it.

### Performance
- **No JS animation loop and no scroll listeners.** The roll is CSS on the compositor, using `transform` and `opacity` only, with no blur on full sheets (blur on large layers is expensive, per emil-design-eng).
- **Rendering:** each sheet gets `contain: layout paint`, and `will-change` is not set preemptively (better-ui).
- **Assets:** the QR code is a small inline SVG (about 1.5 KB) and the chart is a small inline SVG. There are no images apart from a labelled placeholder slot.
- **Fonts:** three Google font families with `display=swap`. They should be self-hosted for production.

### Content and honesty
- **Copy:** Blaine's copy is used verbatim. No provider names, counts or certified-route framing. The no-hyphen rule applies to every string I add; the one supplied hyphen ("instant-quote") is kept and flagged.
- **Allowed digits:** the "Sheet N of M" counter (explicitly allowed), the title-block date and rev, and the chart's labelled sample values. Nothing else may contain digits; a text scan verifies this.
- **Placeholders:** title-block contact facts not supplied (phone, email, address, the checker's name) are clearly marked placeholders that open a modal saying so. Nothing is invented.
- **QR code:** generated locally with the `qrcode` npm package and verified by decoding it with `jsQR`.

### Skeptic
- **Dated metaphor:** a print set can feel like a gimmick that hides the CTA. This is mitigated by the persistent top bar CTAs, a CTA on every sheet, and the cover sheet showing the value proposition and the chart with no scrolling.
- **Long cover on mobile:** the cover is long on phones. That is accepted; the alternative of cramming the chart into one screen hurts usability more.
- **Desktop chart readout:** at 1440×900 the chart readout list must be trimmed to fit the sheet. It shows the top offers by total, and the full list stays reachable through chart points and filters.

## Decisions (the build follows these)
> Items 1 and 2 (and the cover chart placement) are superseded by the addendum at the end: magnetic sheets with a top right peel, and the SolidWorks sheet restyle.
1. Six sheets; native scroll; CSS scroll snap: `mandatory` on desktop at least 720px tall, `proximity` otherwise.
2. The roll is a CSS scroll-driven animation (`view()` exit range), gated by `@supports` and by `prefers-reduced-motion`, and on small screens drops to opacity only.
3. IntersectionObserver tracks the current sheet; there are no scroll event listeners.
4. Previous and Next buttons sit on every sheet; navigation moves focus to the target heading.
5. The fixed "Sheet N of M" counter opens an accessible jump panel (arrow keys, Escape, focus return, `aria-current`).
6. Title block fields are buttons with tooltips on hover, focus and first tap, and a native `<dialog>` modal on click, Enter or second tap. Unknown facts are placeholders.
7. The theme toggle from v2 is kept: dark by default, persisted to localStorage, transitions suppressed during the swap.
8. The QR code is inline SVG, decoded and verified, on the cover and on the closing sheet.
9. Skills: better-ui (press scale 0.96, named transitions, hover gated by `@media (hover:hover)`, theme-swap suppression, opacity fallback); emil-design-eng (custom ease-out curve, popovers that grow from their trigger, exits faster than enters, no animation on keyboard actions, tooltip delay then instant); design-taste-frontend (no em dashes, eyebrow restraint, no section numbering eyebrows, no hand-rolled icons, no fake metrics, honest image placeholders, CTA fits on one line, mobile collapse stated per section).


## Addendum (supersedes parts of the review above)
Later direction from Blaine changed several decisions. Where this addendum conflicts with the council review above, this addendum wins.

### DECISION OVERRIDE: magnetic sheets (replaces "native scroll, CSS scroll snap, no scroll jacking")
Blaine's explicit decision: no free scrolling between sheets. Any wheel, trackpad, swipe or paging key flips exactly one whole sheet and settles it in place. That reverses the council's earlier recommendation, so it is implemented defensively.

How it works:
- **Stacking.** Sheets stack in a fixed deck. Only the current sheet is visible; the others are `inert`, so they are out of the tab order and hidden from assistive tech. The document itself does not scroll.
- **Wheel and trackpad.** Wheel events closer than 220ms apart count as one gesture, and each gesture can flip at most once. Trackpad inertia keeps the gesture alive, so it never causes a second flip. A gesture that starts during a flip is ignored.
- **Keys.** PageDown, ArrowDown and Space go forward. PageUp, ArrowUp and Shift+Space go back. Home and End go to the first and last sheets. Key repeat never flips more than once. Space on a focused button or link still activates it, and arrow keys on the chart are left alone.
- **Tall sheets.** When a sheet is taller than the screen (phones, short windows), the sheet scrolls inside itself first. It only flips when the gesture starts at its top or bottom edge. A scroll that reaches the edge mid gesture never flips; it needs a fresh gesture. Going back lands at the bottom of the previous sheet, and going forward lands at the top. No content is trapped.
- **Swipes.** A vertical swipe of at least 56px that is clearly more vertical than horizontal flips, under the same edge rule. Pinch zoom (ctrl+wheel) and multi touch are never intercepted.
- **Excluded areas.** No input is intercepted while the modal or jump menu is open, or in form fields and editable content.
- **Focus and announcements.** After a flip, focus moves to the new sheet's heading, and an `aria-live` region announces "Sheet N of M, title".
- **Reduced motion.** The flip is an instant swap with no animation.
- **Escape hatch.** "Show all sheets on one page" in the jump menu turns the deck into a normal scrolling document, with no inert sheets and IntersectionObserver driving the counter. This keeps find in page, reader modes, screen reader browsing and long reads working.
- **Buttons.** Previous and next sheet buttons and the jump menu still work.

Risks (accepted by Blaine):
- **Input expectations.** Users expect the wheel to scroll. Small trackpad nudges flip a whole sheet, and heavy trackpads may feel a short dead zone because of the 220ms gesture window.
- **Find in page and anchor links.** These do not reach inert sheets. Mitigated by the one page view.
- **Screen readers in sheet mode.** Virtual cursor reading stops at the sheet edge. Mitigated by the focus moves, the live region and the one page view.
- **Browser behaviour.** The back button and scroll restoration do not track sheets (no URL per sheet in this prototype).
- **Mobile.** In-sheet scrolling plus edge flips is a novel pattern. The swipe threshold may need tuning on real devices.

### Flip animation: peel from the top right corner
- **Pivot.** The sheet pivots on its top right corner (`transform-origin: 100% 0`), where a paperclip would hold the set. It rotates in 3D about the diagonal axis (`rotate3d(-1,1,0,…)`), so the bottom left corner lifts toward the clip and the sheet peels away to reveal the next one underneath.
- **What animates.** Transform and opacity only, through the Web Animations API, over 480ms with ease out (critique W3). The sheet is a single opaque layer with one fold edge; opacity holds at 1 until 88%, and the angle is capped at 70° so it never goes edge on.
- **Back.** Going back plays the peel in reverse on the previous sheet, laid on top.
- **Shadow.** A static shadow sits under the lifting sheet; it is not animated.
- **Duration.** The duration is longer than the 300ms UI guidance, because this is a page transition rather than a control.

### SolidWorks sheet restyle (style reference only)
- **Reference.** Blaine supplied photos of real drawings as style reference. They are proprietary, and none of their content is used: no logo, name, address, part numbers, titles, geometry or notes text. The output was checked by grep.
- **Zone border.** Numbers six to one across the top and bottom, letters D to A down both sides.
- **Bill of materials.** Top left, columns ITEM NO., PART NUMBER, DESCRIPTION. There is no QTY column, per Blaine.
- **Revisions table.** Top right, columns REV., DESCRIPTION, ENG., DATE. It is driven by `changelog.json` and inlined so the page works from `file://`. Each row opens a "what changed" modal.
- **Title block.** Bottom right, with:
  - a tolerance block and the "unless otherwise specified" notes;
  - a draft notice;
  - the third angle projection symbol;
  - NAME and DATE rows for DRAWN (BSW), CHECKED, ENG APPR. and Q.A. (the last three marked PLACEHOLDER);
  - logo, web and contact placeholder;
  - TITLE, SIZE B, DWG. NO. OVD-HOME-0001, REV, WEIGHT (the real file size, computed at build), DO NOT SCALE;
  - SHEET N OF M, which is the jump menu trigger.

  Every field keeps its tooltip (hover, focus, first tap) and modal (click, Enter, second tap).
- **Flush corners.** Every table sits flush in its corner, touching the border lines, with no gap.
- **QR code.** Bottom left corner of every sheet, no label (its accessible name says it opens overdrafter.com).
- **Balloons.** Circled balloons with arrowhead leaders point into the isometric shop. There are no quantity tags, per Blaine.
- **Dimension lines.** Lines with arrowheads and extension lines on the drawing and on sheets two to five. They are labelled with words, not measurements.
- **Typeface.** Questrial (a Century Gothic style face) for drafting text and headings. IBM Plex Sans stays for body copy and Plex Mono for chart data.

### Bill of materials and item to zone map (final, from Blaine)
There are six lines. Each maps to exactly one zone of the isometric shop, and balloon numbers match item numbers. Hovering or focusing a BOM line lights its zone and dims the rest. Hovering, focusing or tapping a balloon or zone lights its BOM line. Enter or Space pins the highlight, and Escape clears it.

| Item | Part number | Description | Balloon | Zone in the drawing |
|---|---|---|---|---|
| 1 | OVD-001 | DESIGN | 1 | CAD desk |
| 2 | OVD-002 | ANALYSIS | 2 | Analysis workstation |
| 3 | OVD-003 | PDM | 3 | File server |
| 4 | OVD-004 | FABRICATION | 4 | CNC machines |
| 5 | OVD-005 | FULFILLMENT | 5 | Shipping dock |
| 6 | OVD-006 | MARKETPLACE | 6 | Showroom counter |

### Allowed digits and hyphens
- **Digits.** Allowed only in drawing furniture: the zone border, BOM item numbers and part numbers, balloons, the revisions table, the title block (date, rev, size, weight, tolerances), the sheet counter and the sample chart. A scan of the copy areas found no digits.
- **Hyphens.** They appear only in strings Blaine specified: OVD-001 to OVD-006, OVD-HOME-0001 and PRE-RELEASE.

## Critique pass (2026-10-11)
- **Accent.** #FF7A1A fill with dark text in both themes. #C2410C is kept for orange text in the light theme only.
- **Primary.** One solid primary per sheet: Upload a part, including sheet 6. The header beta button is an outline.
- **Mobile cover.** Order is headline, body, CTAs, iso, BOM. REVISIONS shows one row.
- **Touch.** Targets are 44px on coarse pointers.
- **Badge.** It sits in a 64px bottom margin.
- **QR.** It stays visible on phones (Blaine's placement).
- **Details.** See the README "Critique response" section.
