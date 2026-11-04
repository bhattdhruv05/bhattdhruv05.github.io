# Portfolio interaction audit — 2 November 2026

Scope: the live GitHub Pages portfolio, its engineering map, media lifecycle, responsive layouts, navigation and keyboard access. Source baseline: `711aed7`.

## Findings and repairs

- Map selection called playback logic on every pointer movement. Selection now changes once per field, with pointer movement checks to avoid activation when content scrolls beneath a stationary cursor.
- Switching fields recreated cards, canvases and event handlers. Each field now retains its preview nodes for reuse; media downloads begin on selection.
- Dismissal and re-entry competed across asynchronous fades. A single controller now owns selection, timers, dismissal and recovery, including re-entry into the same field during its exit transition.
- Six rounds of embedded homepage styling and later overrides made layout behavior fragile. Both pages now use one shared base stylesheet, with illustration styles isolated in `visuals.css`.
- Laptop layouts compressed the map beside the introduction, and absolutely positioned instructions could collide with the map title. The introduction stacks above the map at narrower laptop widths, and map instructions participate in normal layout.
- Preview text could affect the map's footprint. The preview area now reserves its space before interaction and remains stable across all six fields.
- Canvas loops queried layout and searched the DOM every frame. Sizes and active canvases are cached and updated by ResizeObserver. Case-study canvases use IntersectionObserver and stop their animation loop offscreen.
- Case-study videos requested metadata before being needed. They now use `preload="none"` and explicit visibility-controlled playback.
- Project navigation used buttons and script redirects. Preview destinations are now real, individually labelled links supporting keyboard navigation and normal browser actions.
- Added a skip link, concise selection announcements, Escape dismissal, focus handling and a keyboard-accessible playback retry button.

## Verification

- JavaScript syntax and Git whitespace checks passed.
- Five automated media-lifecycle regression tests passed: pending-play deduplication, late resolution after dismissal, interrupted playback recovery, reduced-motion/hidden-page suppression, and resume behavior.
- All 43 local HTML references resolve; project anchors and map media files exist. Referenced map video streams pass ffprobe inspection.
- Chromium responsive layout checks at 320, 390, 760, 900, 1100, 1280 and 1440px: no horizontal document overflow.
- All six fields exercised at 320, 900 and 1440px: two expected previews, correct project destinations and unchanged map height for every selection. Narrow phone previews remain within their reserved area.
- Live browser checks confirmed project navigation and that only nearby case-study videos keep playing. All seven case studies remain present.
- Thirteen browser interaction regression checks passed, including hover without clicking, cached-video reuse, interrupted dismissal, keyboard selection and stationary-pointer behavior.
- Reusable browser interaction regressions: serve the site and open `tests/map-browser.html`; press Run map regression checks.

## Verification limits

Browser testing used cloud Chrome, including responsive iframe viewports and synthetic pointer-event regression checks. Physical touch devices, Safari and Firefox were not available. Existing video/image source quality is retained; this update does not reconstruct low-resolution original imagery. No performance score or universal frame-rate guarantee is claimed.

## Repeat checks

```sh
node --test tests/media-playback.test.cjs
node --check engineering-map.js
node --check map-animations.js
node --check media-playback.js
node --check projects/project-animations.js
python3 -m http.server 8000
```


## Playback rebuild — 4 November 2026

A user recording showed that card-selection checks were insufficient to establish animation playback. This follow-up separates the visible appearance of a preview from proof that its frames advance.

- Removed the common reduced-motion playback veto from interactive previews. They now start when selected unless a visitor explicitly pauses them. Reduced-motion styling still removes decorative entrance transitions.
- Added a single shared Play/Pause preference for video, CSS and canvas renderers, with an in-memory fallback when storage is unavailable.
- Added an accessible Play preview button for actual autoplay rejection; no rejected-play retry loop.
- Removed mouse-movement-delta requirements from pointer entry. Scroll-related entry is guarded by a short scroll window, while physical pointer movement, click and keyboard focus select immediately.
- Click and keyboard selection remain pinned while the visitor reaches the motion control. Outside click and Escape still dismiss previews.
- Removed competing startup IntersectionObservers from the map; visibility checks use the actual visual rectangles. Offscreen playback and page restoration share the same lifecycle.
- Render clocks use elapsed time rather than losing animation time whenever frames are throttled. Model-fit line highlights remain visibly animated between reveals without altering the reported data.
- Created four map-only 480px H.264 previews with fast-start metadata: robot 295,225 bytes, CAM 284,641, mechanism 335,054 and assembly 169,336. Their source files totalled 4,907,421 bytes; preview files total 1,084,256 bytes (78% reduction). Full case-study videos are unchanged.
- Removed external Google Fonts stylesheets from both pages. Fonts are self-hosted WOFF subsets with font-display swap and included licenses. Deferred scripts download in parallel while preserving execution order.
- Case-study video/poster URLs are assigned only near the viewport; noncritical images use lazy decoding. Navigation-intent prefetch warms the other document without delaying clicks.

Validation includes actual video timestamps, canvas pixel changes, CSS transform changes, explicit Pause/Play, autoplay-rejection recovery, default playback with reduced-motion settings, and the full project-page media. Automated media lifecycle tests: 8 passed. Physical-device and non-Chromium testing remain unavailable; no universal frame-rate or load-time guarantee is claimed.


## Autoplay follow-up — 4 November 2026

- Removed the global animation control from both page headers and removed the persisted Pause preference. Selected previews autoplay on every visit, including visitors with an old saved Pause setting.
- Preserved canvas state through brief map exits and page visibility changes so resumed graphs do not jump back to the beginning.
- Recover once from a browser AbortError without a selection change; repeated aborts expose the existing per-video retry instead of retrying in a loop.
- Added regressions for obsolete saved preferences, isolated/repeated aborts, and canvas continuity.
