# landing-studio kit · engine, CSS, React parts, app template

The motion layer every scene builds on. It implements `../CONTRACT.md`; this page restates it for scene authors.

## Install into an app
1. `cp -R app-template/. <app>/ && rm <app>/sync-kit.sh`, then from the skill
   `app-template/sync-kit.sh <app> [--scenes a,b] [--backend]`. Layout inside the app:
   `src/kit/engine`, `src/kit/react`, `src/styles/{tokens,motion}.css`, `src/scenes/<name>/`,
   `src/app/preview/<name>/page.tsx` (one per scene, from its `preview.tsx`), and with `--backend`
   `src/app/api/lead/route.ts`, `src/lib/{leads,email}.ts`, `src/config.ts`, `.env.example`.
   Re-run after any kit fix; app-owned files (`tokens.css`, `config.ts`, previews) are only written when missing.
2. `layout.tsx` already inlines `BOOT_SCRIPT` (from `@/kit/engine/boot`) as the first child of `<head>`,
   as a raw synchronous `<script>`, never `next/script`. It adds `js`, `rm` (reduced motion), restores `paused`,
   and swaps `js` for `ls-static` if the engine has not added `mo` within 3.5s (`bootScript(ms)` to change it,
   keep `--ls-failsafe` in tokens.css equal).
3. Render `<Motion />` once per page, after the content. Options (props or `mountMotion(opts)`):
   `breakpoint` 820 · `tau` 80 ms · `jumpVh` 1.5 · `settle` .0005 · `liveMargin` 0 vh · `px` .07 · `watchMargin` "0px".
4. `npm run dev` (port 3040, `PORT=3061 npm run dev < /dev/null` to change), `npm run build`.

## Attributes
| Attribute | Effect |
|---|---|
| `data-rv` = "" mask clip blur pop wipe side path | one-shot reveal, `.in` added by one shared IO (threshold .12, rootMargin 0 0 -7% 0). Delay `--d`, ladder `--i` (x `--ls-stagger`). clip and wipe are observed through the parent. path: strokes with `pathLength="1"`. |
| `data-replay` | the reveal runs on every entry and undoes itself once fully out (hysteresis .35 / 0) |
| `data-count="120"` `data-suf` `data-pre` `data-ms` | count-up on reveal, 1500 ms ease-out; decimals follow the target. `<Count to={120} suf="+" />` |
| `.w > i` | word mask; `<SplitWords text="..." />` renders it on the server. Release with `data-rv="mask"` on an ancestor |
| `data-scene` + `.ls-scene` + `style="--len:320vh"` | pinned track; first child `.ls-stage` sticks for 100svh. Engine writes `--p` (0..1, 4 decimals) |
| `data-tau="120"` `data-jump="1.5"` (scene) | smoothing constant (ms) and snap threshold (viewports) for this scene |
| `.live` (engine) | on the scene while it is on screen; the only place `will-change` is set |
| `data-beat data-a data-b [data-last]` | beat fades in over `a..a+.07`, out over `b-.06..b`; `data-a="0"` starts visible. Children `data-sub` step in. Tunables on the beat or scene: `data-beat-in` `data-beat-out` `data-beat-y` (46px) `data-sub-in` `data-sub-x` `data-sub-from` |
| `data-pour="in\|out" data-d` | cascade columns, -101% to 0 on in-out; column start = `a + (d / dmax) x spread`. `data-d` normalised by the scene's largest (or `data-pour-dmax`). Scene: `data-pour-in="0,0.1"` `data-pour-out="0.8,0.08"` `data-pour-len=".12"` `data-pour-dist="101"` `data-pour-dmax` |
| `data-deal="i"` + `data-deal-sh` | cards drop and land rotated; per card `data-a data-b data-r`; scene `data-deal-r0` 18 `data-deal-x` 22vw `data-deal-y` .6 `data-deal-y-sm` .4 `data-deal-nudge` 18 |
| `data-bar` | `scaleX(--p)` progress bar |
| `data-px="0.07"` | page-level parallax at and above the breakpoint, writes `--py`, applied as `translate: 0 var(--py)`. Flow sections only: inside a sticky stage it drifts, use `--p`-driven transforms there |
| `data-watch` (any value) | `.off` while off screen: every CSS loop inside pauses |
| `data-watch="hero"` | also `--hx` (0..1 over the first 80vh of scroll) and, from the breakpoint on a fine hover pointer, `--mx` / `--my` in [-1, 1] (rAF-throttled; off on touch, `rm`, `paused`) |
| `<MotionToggle />` | "Pauză mișcare" / "Pornește mișcarea", toggles `html.paused` (WCAG 2.2.2), remembered per session |

## Writing a scene handler
Most scenes need no JS: style children as pure functions of `--p` with `clamp()`/`calc()`.
For procedural scenes register a handler at module top level of the scene file (before `<Motion />` mounts):

```ts
import { registerSceneHandler, fx } from "@/kit/engine/engine";
registerSceneHandler("data-orbit", (scene, items, env) => {
  const turns = env.num(scene.dataset.orbitTurns, 1);          // read params ONCE, here
  return ({ p, vh, wide, write }) => items.forEach((el, i) =>
    write(el, "--a", fx(p * turns + i / items.length)));       // per frame: write only
});
```
The handler runs once per scene that contains `[data-orbit]` children; the returned function runs only on
frames where that scene's smoothed `--p` changed. Frame fields: `p scene y vh vw wide write`.

**Write only vars** (or transform / opacity / visibility) and only through `write(el, prop, value)`: it dedupes,
so a scene at rest costs nothing. Never read layout (getBoundingClientRect, offsetHeight, getComputedStyle)
inside a frame; the engine measures on resize (debounced 120ms), `fonts.ready` and `load` only.

## CSS gating rules
- Reveal hidden states live under `html.js:not(.rm)` (the failsafe covers them). No JS, reduced motion and
  `html.ls-static` all render the finished static page: beats stacked in flow, words placed, numbers final.
- Pinned layouts (track height, sticky stage, hidden beats) and every state the engine drives gate on
  `html.mo:not(.rm)`: without the engine `--p` never moves and a `.js`-gated pin would freeze on frame one.
- `html.rm` is the kill switch: final state, `!important`, no animation, no transition.
- Failsafe: anything you hide yourself must also carry `animation: ls-failsafe 0s var(--ls-failsafe) forwards`
  under `html.js:not(.rm):not(.mo)`, or be reached by `[data-rv]`, which already does.
- Scene classes are prefixed `.<scene>-`; brand values only through `--bg --ink --ink-2 --muted --accent --accent-2 --line --font-sans --font-mono`.

## House motion language
Do
- One easing family: `--ls-ease` for entrances, `--ls-inout` for transfers, `--ls-spring` for landings. JS twins in `math.ts`.
- Exits run at 60% of the entrance (`--ls-t-*-exit`).
- Ladders of at most 6 steps (`--i` 0..5); words step 45ms.
- Animate transform, opacity and clip-path only.
- `will-change` only under `.live`; remove the promotion when the scene leaves.
- Measure once, cache geometry, write deduped strings with fixed decimals.
- Give every hidden state a failsafe; reduced motion shows the final state, never a midway one.
- Pause infinite loops off screen (`data-watch`) and with the toggle.
- Copy in examples is Romanian with diacritics, labelled "Exemplu"; no invented facts.

Avoid
- `mix-blend-mode`, large or animated blurs (`data-rv="blur"` is for text on flat colour only), animated filters on photos.
- Animating width, height, top, left, margins or anything that lays out.
- Scroll hijacking: the stage is native `position: sticky`; the engine only smooths what it writes.
- Promoting a layer and then scaling it up (stretched raster); author at final size and scale up from below 1.
- A second scroll listener or rAF loop in a scene: register a handler instead.
- `overflow: hidden` on an ancestor of a stage (breaks sticky); use `overflow-x: clip` on body.
- Em dashes anywhere.

## Files
- `engine/math.ts` pure math (clamp, seg, lerpK, expK, easings, smoothProgress, trackProgress, inView, fx); `node engine/math.test.mjs`
- `engine/engine.ts` `mountMotion`, `registerSceneHandler`, `write`, `num`, `observeReveal`, built-in handlers `beats pour deal bar`, page-level `px` and `hero`
- `engine/boot.ts` `BOOT_SCRIPT`, `bootScript(ms)`
- `css/tokens.css` motion tokens + brand token names, `css/motion.css` the contract CSS
- `react/` `Motion` `Reveal` `SplitWords` `Count` `MotionToggle`
- `app-template/` Next 15 + React 19 + Tailwind 4 skeleton (noindex header and metadata), `sync-kit.sh`
