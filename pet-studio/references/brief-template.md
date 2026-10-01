# Agent brief template (one agent per direction, model: opus)

Fill the `<...>` slots from the Phase 0 brief and the direction paragraph. Keep everything else; it is the contract that made past runs comparable.

```
Goal: build an interactive prototype of a brand mascot for "<NAME>", <PRODUCT IN ONE SENTENCE, INCLUDING ITS SIGNATURE BEHAVIOR>. The owner wants a mascot that is <THE OWNER'S WORD: breathtaking / warm / serious>, a living "pet" that represents the brand and can take on each client's colors. Three agents build three directions in parallel; you build DIRECTION <LETTER>. The owner will open all three and pick one.

Direction <LETTER>, "<direction title>": <DIRECTION PARAGRAPH: what she is made of, the two literal features, and how every state reads in this material. Name the signature gesture explicitly, e.g. "when she refuses, she lands, folds her wings, dims the lantern a step and looks at you".> Build it in <raw WebGL | a fragment shader | layered Canvas 2D with springs | layered SVG>; if a library is unavoidable use only a UMD build from cdnjs with an exact pinned version (three.js on cdnjs stops at r160); no other external resources, everything else inline. Must run at 60 fps on a laptop and degrade (fewer elements, lower resolution) on phones.

Deliverable: ONE self-contained HTML file at `<PROJECT>/mascot/explore/<letter>-<slug>.html` with: the mascot centered, large; a control strip with buttons for the states <STATE LIST, 8 max> (keyboard 1 to N too); a brand color input (`<input type="color">`) plus three presets (<DEFAULT COLOR>, <CLIENT PRESET 1>, <CLIENT PRESET 2>) that remap the whole palette through one token so the mascot looks native to any client (the color lives in <THE LIGHT / THE THREAD / THE RIM>, never as a flat body tint); a size toggle (hero / chat avatar 48px) that shows the same mascot rendered small in a mock chat bubble row to prove it reads at that size (the small version is a simpler pose with bigger eyes, not a scaled render); the mouse position makes her look toward the cursor; a reduced-motion fallback (static pose with a slow glow or fade). A one-line caption under the mascot names the current state in plain words. No text other than captions and controls; <LANGUAGE>; no em dashes.

Page contract (it will be published as a claude.ai artifact): write the content directly, no doctype/html/head/body tags, `<title><NAME> <LETTER></title>` and `<style>` at the top; define colors as tokens on `:root`, redefine under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])` and again under `:root[data-theme="dark"]`; body has an explicit background; no `alert`/`confirm`/`prompt`; works at 400 px width with no horizontal scroll; keep under 1 MB.

Verify: open the file with playwright (serve it with `python3 -m http.server` on a free port, kill it after), take screenshots of at least four states at 1280x800, one at 400x800, and one in dark theme, LOOK at them (Read the PNGs) and fix anything weak: a generic blob, eyes that read as a bug or as two slits, states that look alike, idle and answering differing only in speed, low frame rate (measure with requestAnimationFrame deltas and report the number). Save screenshots to `<PROJECT>/mascot/explore/shots/<letter>-<state>.png` (overwrite).

Rules: write only under `<PROJECT>/mascot/explore/`; nothing in git; do not touch anything else in the repo. The bar is "<THE OWNER'S WORD>": iterate on the silhouette, the eyes and the signature gesture until she has character; a character animator's timing (anticipation, overshoot, settle) matters more than effects.

Report in under 150 words: path, technique and any library version, element count desktop/phone, measured fps, which states you are proudest of and which are weakest, the screenshot paths, anything not done.
```

# Refinement brief (Phase 4)

```
Goal: take mascot direction <LETTER> at <PATH> from prototype to a shippable character, in two rounds, keeping its concept.
Owner's notes: <verbatim>.
Steal from the other directions: <e.g. "the thread that traces from the body to the citation" from direction A>.
Round 1: silhouette and eyes (two iterations, screenshot each), the two weakest states (<names>), idle vs answering must differ in shape, the 48px avatar redrawn as its own pose. Round 2: both themes screenshotted in every state; performance on a throttled CPU (playwright `cpuThrottlingRate: 4`) still above 30 fps.
Package: `pet.js` exposing `Pet.mount(el, {color, size})` and `pet.set(state, {target?})`, a static pose exported as SVG or PNG at 512 and 32 px for favicon/OG, an embed snippet, and `BRANDING.md` for clients (what they may change: the color; what they may not: the form, the eyes, the gestures).
Same page contract, same verification loop, same report format as the build brief.
```
