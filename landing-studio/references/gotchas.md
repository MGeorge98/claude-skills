# Gotchas: symptom → cause → rule

Every entry happened on a real build (SPEECH 2026-10-08, Vello, getdapost, Twinproof, the pitch
pipeline). Memory notes live in `~/.claude/projects/-Users-novamatter-GitHub-Landing-Page-Portfolio/memory/`.
Paste the three that matter into each scene brief; do not paste the whole file.

## Reveal and IntersectionObserver

1. **Dock animates before it is on screen** → IO observed the full-height section, which intersects
   long before the element inside it is visible → observe the element itself, threshold .4, and arm
   the failsafe only after it is visible.
2. **A clip reveal never fires** → `clip-path: inset(0 0 100% 0)` on the observed element makes Chrome
   report no intersection → clip the children, observe the wrapper.
3. **Hero photo present in one shot, missing in the next** → a reveal on an element half in the fold,
   threshold plus negative rootMargin is a coin flip → nothing partly visible at load carries a reveal.
4. **Whole sections stay at opacity 0, every check green** → the `.js` class was set before the
   observer attached and the script died later (a top-level `var status` binds to `window.status`
   and throws) → set the gate class after the observer, keep scripts in modules or an IIFE, failsafe.
5. **Page blank in dev, no console error** → Next 16 dev opened on `127.0.0.1` while started as
   `localhost`; HMR blocked, nothing hydrates → open the host the server printed; `allowedDevOrigins`.
6. **A tilt or offset disappears after reveal** → `.rv.in { transform: none }` outranks the decorative
   transform on the same element → decoration transform goes on a child.

## Pinned scenes

7. **Dead first frame at a pinned handoff** → the first group starts at p > 0 → first group visible at
   p=0; assert it in the sheet at the pin's first pixel.
8. **A fast flick skips the cascade** → beat windows too short for the smoothing → longer windows,
   tau 120 to 160 ms for that scene, flick test (frames per beat at least 8).
9. **Beats kink at handovers** → quadratic easing has velocity at the ends → smootherstep.
10. **Scrolling back leaves things wrong** → state or timers inside a pin → pure function of p.
11. **Jank on scroll with a quiet page** → `getBoundingClientRect` per frame → measure on resize,
    `fonts.ready`, `load`; read cached geometry in the frame.

## Performance

12. **728 paints in a 2 s scroll, mostly off-screen** → infinite SVG loops in the hero kept repainting
    after it left → `data-watch` + `animation-play-state: paused` under `.off` (went to 47).
13. **Zoom ends soft and pixelated** → a `will-change` layer laid out small and scaled up → author at
    final size, scale from small to 1.
14. **Cards repaint while scrolling** → `filter` or `box-shadow` animating, or `will-change` missing on a
    per-frame transform → transform/opacity only, `will-change` under `.live`.
15. **Mobile LCP over budget after adding sections** → render-blocking head CSS grew; each gzip KB costs
    about 120 ms on Slow 4G → scene CSS below the fold inlined in the body or split; measure gzip.
16. **LCP lands at the reveal time** → the LCP element starts at `opacity: 0` → hero headline and hero
    image paint from the first frame (under an opaque overlay if an intro must hide them).
17. **CLS over .02 on the hero** → masthead elements without explicit line-height shift on font swap →
    `line-height` on every masthead element; log layout-shift sources before blaming copy.

## Layout and fold

18. **scrollWidth 402 at 390** → a `100vw` element plus a scale on the network graphic → scale only at
    1024 and up, `body { overflow-x: clip }`, audit scrollWidth == viewport at both widths.
19. **Hook line cut by the fold** → hero frame taller than the screen or content pushed down by chrome →
    every hero frame is `100svh`, assert fold boxes (hook, CTA) fully inside 390x844 and 1440x900.
20. **Collage cards collapse or blow out** → card width came from the image's intrinsic size → set width
    on the card, image `width: 100%`.
21. **A media query override does nothing** → it sits before the base rule, equal specificity → place
    the override right after the base rule it beats.
22. **A positioned glow eats words of the headline** → decoration absolutely positioned above in-flow
    type → `z-index: -1` on decoration, or the type gets its own stacking context.
23. **Tracked caps header wraps at 390** → letter-spacing on a long uppercase label → test at 390, drop
    tracking under 480.

## Brand transitions

24. **Headline sliced by the brand-wipe edge mid-transition** → the wipe layer sits above the headline →
    hold the headline above the wipe layer, or reveal it only after the wipe passes.
25. **Seam between two dark scenes** → each scene paints its own background → the integrator owns
    backgrounds at handoffs; scenes only paint inside their stage.

## Forms and popup

26. **Floating CTA covers the form or the fields** → a sticky CTA visible everywhere → hide it from the
    form down; drop it entirely when the form is in the first screen.
27. **Success popup traps or loses focus** → a div instead of `<dialog>` → native `dialog.showModal()`,
    focus returns to the form, Escape closes.
28. **Optional field breaks the lead** → field added in the form but not in the API schema or the
    notification → change form, API validation, stored record and both emails together.

## Email

29. **Gmail on iOS turns the dark email into a pale mess** → Gmail inverts dark emails → logos on dark
    pills baked into the PNG, inline `bgcolor` on every table cell, test with an inversion emulation.
30. **Email looks right in the browser preview only** → CSS in `<style>` stripped → inline styles,
    tables, absolute image URLs or CID attachments.

## Deploy and Vercel

31. **Leads vanish on Vercel** → the function file system is read-only and ephemeral → the email
    notification is the record; a JSONL file works only on a server with a disk.
32. **Attachment missing in production email** → the function bundle did not include the folder →
    `outputFileTracingIncludes` for that route.
33. **Upload over 15,000 files or a type error only on Vercel** → `.vercelignore` replaces `.gitignore`
    → count files per top-level dir, grep imports into excluded dirs before handing over the deploy.
34. **Local runs write to production data** → `vercel env pull` wrote a real secret to `.env.local` →
    comment it out; never pull env as an agent.

## Process and agents

35. **`npm run dev` fails with "operation not permitted" in Downloads** → macOS quarantine on
    node_modules → `xattr -dr com.apple.quarantine node_modules`.
36. **Turbopack refuses the clone** → node_modules symlinked → `cp -Rc` (APFS clone), one port per agent
    (3051+).
37. **A CSS fix "did not work"** → hot reload served stale CSS, or old shots → full reload, re-shoot,
    compare mtimes before believing a broken frame.
38. **A full set of shots of an error page** → stale server on the port → check the HTTP status before
    shooting; kill your own server when done.
39. **Agent report never arrives** → a `while pgrep -f` wait loop matched itself → run suites in the
    foreground with a timeout.
40. **Copy drifted from the source deck** → patched from memory after the deck changed → diff old vs new
    source, table `file:line | current | source`, apply, re-run the facts gate.
