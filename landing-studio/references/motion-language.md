# Motion language (house)

Distilled from three builds: Vello (`vello/ops/MOTION-AUDIT.md` §2 and "WP0 CONTRACT (as built)"),
getdapost (`getdapost/ops/LANDING-PARTS-CONTRACT.md`), Twinproof v3 (`vera/landing/rebrand/v3/PARTS-CONTRACT.md`)
and the MBV Summit QR page (`~/Downloads/SPEECH/src/components/Motion.tsx`). The kit implements it;
`CONTRACT.md` is the binding version. Paths above are relative to `~/GitHub/Landing Page Portfolio/`.

## 1. Tokens (kit/css/tokens.css; in the app src/styles/tokens.css)

| token | value | role |
|---|---|---|
| `--ls-ease` | `cubic-bezier(.16,1,.3,1)` | every entrance: reveals, word masks, dialogs in |
| `--ls-inout` | `cubic-bezier(.65,0,.35,1)` | visible travel A to B (rail dot, slide, morph) |
| `--ls-spring` | `cubic-bezier(.32,1.28,.36,1)` | press release, stamps, chips landing. Small things only |
| `--ls-t-ui` | .35s | nav, chips, tabs, popup |
| `--ls-t-fade` | .6s | opacity-only changes |
| `--ls-t-reveal` | .9s | rise reveals and masks |
| `--ls-stagger` | 80ms | element ladders |
| `--ls-stagger-word` | 45ms | word masks |

One easing family. Exits use an ease-in (`cubic-bezier(.5,0,.75,0)`) and last **60 percent** of their
entrance. Nothing outside a scroll scene runs longer than 1.4 s (the gesture ceiling). Press is
`scale(.97)` in 90 ms, released on the spring.

## 2. Reveals

- `[data-rv]` rises 22 px with opacity over `--ls-t-reveal`. Variants: `mask` (children rise 104% inside
  an `overflow: clip` parent), `clip`, `blur` (text on paper only, never photographs), `pop`, `wipe`,
  `side`, `path` (SVG stroke).
- **Ladders max 6 steps** (480 ms). Longer lists group into rows. A whole entrance, first element to
  last settled, fits in 1.4 s.
- Order: eyebrow, headline words, body, media, CTA. Media may lead only in the hero.
- Word masks are rendered on the server (`SplitWords`): `<span class="w"><i style="--i:n">word</i></span>`,
  so there is no flash and no layout shift. In a pinned scene drive them by progress (`data-beat`),
  word i up at `(1 + .06 i) / 1.6` of the beat.
- Clip reveals clip the **children**, never the observed element (Chrome reports a fully clipped target
  as not intersecting, so it never reveals).
- Nothing partly visible at load carries a reveal (a half-in-fold figure is a coin flip).
- `[data-count]` counts up only numbers that are in `facts.md`.

## 3. Pinned scenes

- `<section data-scene class="ls-scene" style="--len:320vh"><div class="ls-stage">`: the stage is
  sticky (native, never lags); the engine writes `--p` 0..1.
- **Every child is a pure function of `--p`.** Same p, same frame; scrolling back runs it back. No
  `setTimeout`, no state, no "has played" flags. Overlap consecutive slices by .05 to .10.
- Beats use smootherstep (zero velocity and acceleration at both ends) so handovers have no kink.
- **Smoothing**: `p += (target - p) * (1 - exp(-dt / tau))`, tau 80 ms default (`data-tau`), snap on
  jumps over 1.5 vh (anchors, End key), loop parks when settled. Cascades that read as "too fast" get
  longer windows and a larger tau, not a slower scroll.
- **First frame is a frame**: at p=0 the first group is already visible. A pin that starts empty
  reads as a dead screen at the handoff.
- Lengths: 160vh to 320vh. Short pins with many beats skip frames on a flick; measure.
- Geometry is measured on resize (debounced), `fonts.ready` and `load`; a frame reads no layout.
- Parallax (`data-px`) only at 1024 and wider.

## 4. Compositor rules (performance contract)

- Animate `transform` and `opacity`; `clip-path` per frame only on small elements. Large wipes are a
  translated `overflow: hidden` wrapper with counter-translated content.
- `will-change` only while `.live` (within one viewport). Never permanently.
- No `backdrop-filter` on anything that moves or has motion behind it. No `filter` on an element whose
  size changes per frame; bake blur into a static layer or use a radial gradient.
- **Promoted layers scale down, never up**: author at final size, drive scale from small to 1.
- Infinite CSS loops (hero SVG, marquee) pause off-screen: `[data-watch]` toggles `.off`,
  CSS sets `animation-play-state: paused`. On SPEECH this took a 2 s scroll from 728 paints to 47.
- Images a pin is about to reveal are decoded ahead (`img.decode()` within one viewport, eager loading
  inside pinned stages).
- Idle page: zero style writes.

## 5. Failsafes and quiet modes

- Boot script in `<head>`: `html.js`, `html.rm` for reduced motion; the engine adds `html.mo` on mount.
- Every reveal hidden state is gated `html.js:not(.rm)`; pinned layouts and engine-driven states gate on `html.mo:not(.rm)`. Author the **final state as base CSS** and let motion
  take it apart; never a bare `opacity: 0`.
- Failsafe: `[data-rv]` without `.in` becomes visible after 3.5 s unless `html.mo` exists.
- Reduced motion: every scene at its settled values, reveals visible, loops stopped, pins collapsed or
  at p=1.
- Pause control (`MotionToggle`, `html.paused`) when any loop runs longer than 5 s (WCAG 2.2.2).

## 6. Typography conventions

- Hero headline: `clamp(2.6rem, 7vw + .5rem, 7.5rem)`, line-height .95 to 1.02, letter-spacing -0.02 to
  -0.035em, weight from the brand. One accent word or the accent period, not both.
- Section heads: `clamp(2rem, 4vw + .5rem, 4.25rem)`. Body 17 to 19 px, line-height 1.5, measure 60 to 68ch.
- Every masthead element has an explicit `line-height` (font swap otherwise shifts the hero).
- Tracked caps only on one eyebrow style, used sparingly, and tested at 390 (tracked caps wrap).
- Inputs are 16 px (iOS zooms below that).
- `font-display: swap` with a metric-matched fallback; preload at most one face, and only if it helps LCP.

## 7. Do / avoid

| Do | Avoid |
|---|---|
| One orchestrated moment per scene | Every block fading up on its own |
| Motion that explains (cascade = brand pouring in, deal = choices) | Motion as decoration |
| Pure functions of p | Timers inside pins |
| Masks on words, set on the server | Splitting words in the client after paint |
| Pause loops off-screen | Loops running under the fold |
| Final state as base CSS | `opacity: 0` without the `html.js` gate |
| Scale down from final size | Scaling a promoted layer up |
| A hero frame that is exactly 100svh | A hook line cut by the fold |
| Smoothing tau and longer windows | Scroll hijacking libraries (Lenis), CSS `animation-timeline` |
| Brand wipe that passes before the headline lands | A wipe edge slicing the headline mid-transition |
