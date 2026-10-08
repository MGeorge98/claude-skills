# landing-studio · kit contract (wave 1, integrated 2026-10-08)

The engine is attribute-driven and compatible with the SPEECH page built 2026-10-08
(`~/Downloads/SPEECH/src/components/Motion.tsx`). Scenes, scripts and docs all target THIS contract;
the demo in the integrator's scratchpad (`ls-demo`) built, audited and passed against it.

## App layout (made by `kit/app-template` + `kit/app-template/sync-kit.sh`)
```
src/kit/engine/{engine,math,boot}.ts   src/kit/react/{Motion,Reveal,SplitWords,Count,MotionToggle}.tsx
src/styles/tokens.css (app-owned after the first copy)   src/styles/motion.css (kit-owned, re-synced)
src/scenes/<name>/        <Name>.tsx, <name>.css, data.example.ts, preview.tsx
src/app/preview/<name>/page.tsx   dev preview, generated once per scene, deleted before ship
src/app/api/lead/route.ts  src/lib/{leads,email}.ts  src/config.ts  .env.example   (--backend)
src/app/{layout.tsx,globals.css,page.tsx}   page.tsx has one writer: the integrator
```
Imports: `@/kit/engine/engine`, `@/kit/react/SplitWords`, `@/scenes/<name>/<Name>`, `@/config`, `@/lib/email`.

## Boot (inline <head> script, before paint)
- `html.js` added when JS runs; `html.rm` when prefers-reduced-motion; `html.paused` restored from sessionStorage;
  engine adds `html.mo` on mount and `html.ls-ready` after the first measure.
- If `mo` is missing at 3.5 s the boot script swaps `js` for `ls-static` (finished static page).
- Reveal hidden states are gated `html.js:not(.rm)`; `[data-rv]` without `.in` becomes visible via
  `animation: ls-failsafe 0s var(--ls-failsafe) forwards` while `html.mo` is absent.
- **Pinned layouts are gated `html.mo:not(.rm)`** (motion.css `.ls-scene` / `.ls-stage` / hidden beats, and every
  scene css). Without the engine `--p` never moves, so a pin gated on `.js` would freeze on its first frame.
  Before mount, without JS, under `rm` or `ls-static`, a scene is a readable column in flow.

## Reveal
- `[data-rv]` (variants: "" | mask | clip | blur | pop | wipe | side | path), delay via `--d`, stagger via `--i`;
  `data-replay` reruns on every entry.
- One shared IntersectionObserver (threshold .12, rootMargin 0 0 -7% 0), adds `.in`, unobserves. Clip-path targets
  are observed through the parent.
- `[data-count]` + `data-suf` / `data-pre` / `data-ms`: count-up on reveal (1500 ms ease-out).
- Word masks: `<span class="w"><i style="--d;--i">word</i></span>` rendered on the server by
  `SplitWords({ text, start?, step?, base? })`, `--d = base + index x step`.

## Pinned scene
- `<section data-scene class="ls-scene" style="--len:320vh"><div class="ls-stage">…</div></section>`
- Engine writes `--p` (0..1, 4 decimals) on the section; toggles `.live` while on screen; `will-change` only under `.live`.
- Progress is smoothed per scene: `p += (target-p)*(1-exp(-dt/tau))`, tau from `data-tau` (ms, default 80),
  snap on jumps > `data-jump` viewports (1.5), loop parks when settled.
- Scene children are pure functions of `--p` in CSS (clamp/calc), or engine-written by handlers:
  - `[data-beat][data-a][data-b]` with optional `[data-sub]` children and `data-last`
  - `[data-pour=in|out][data-d]` columns. Scene attributes: `data-pour-in="a,spread"` (0,0.1),
    `data-pour-out="a,spread"` (0.8,0.08), `data-pour-len` (.12), `data-pour-dist` (101, %), `data-pour-dmax`
    (default: largest `data-d`). Column start = `a + (d / dmax) x spread`.
  - `[data-deal=i]` cards + `[data-deal-sh]` shadow
  - `[data-bar]`: inline `scaleX(p)`
  - custom: `registerSceneHandler(attr, fn)` at module top level.
- **`data-px` is for flow sections only.** Its document position is measured once, so inside a sticky stage it
  drifts. Inside pinned stages use `--p`-driven transforms (e.g. brand-pour's `--pd`).
- No getBoundingClientRect in the frame; geometry measured on resize (debounced 120 ms), fonts.ready, load.
- Integrator rule: the first frame of each pin (p = 0) shows content, never an empty stage.

## Page-level handlers
- `[data-px="0.07"]`: writes `--py` (px) at and above the breakpoint (820); apply with `translate: 0 var(--py)`.
- `[data-watch]` (any value): `.off` while the element is off screen; CSS loops inside pause.
- `[data-watch="hero"]`: also gets `--hx` = clamp(scrollY / (0.8 x vh), 0, 1) on every scroll frame, and, at and above
  the breakpoint on a fine hover pointer, `--mx` / `--my` in [-1, 1] (pointer from viewport centre, rAF-throttled).
  Off on touch, under `html.rm`, and while `html.paused`. CSS reads them with a 0 fallback.
- Optional `MotionToggle` adds `.paused` on `html` (WCAG 2.2.2).

## Tokens (CSS custom props on :root, `src/styles/tokens.css`)
- `--ls-ease: cubic-bezier(.16,1,.3,1)`, `--ls-spring: cubic-bezier(.32,1.28,.36,1)`, `--ls-inout: cubic-bezier(.65,0,.35,1)`
- `--ls-t-fade: .6s; --ls-t-reveal: .9s; --ls-t-ui: .35s` (exit twins at 60%), `--ls-stagger: 80ms; --ls-stagger-word: 45ms`,
  `--ls-failsafe: 3.5s`, `--gut`
- Brand tokens (values from brand ingest): `--bg --ink --ink-2 --muted --accent --accent-2 --line --font-sans --font-mono`.
  Scenes use only these names (guest brands come in as scene props, e.g. brand-pour's `guest`).

## Lead API (form-popup <-> `src/app/api/lead/route.ts`)
- `POST /api/lead`, JSON: `{ nume: string, companie?: string, email: string, telefon: string, acord: true,
  interese: string[], website: string }` plus optional extra keys. `website` is the honeypot; `interese` ids are
  filtered against `interese` in `src/config.ts`. The default route requires `telefon` (9 to 15 digits).
- Responses: `200 { ok: true, emailed: boolean }`; honeypot `200 { ok: true }`; field errors
  `400 { ok: false, errors: { nume?, email?, telefon?, acord? } }`; general `400|429|500 { ok: false, error: string }`.
- form-popup's `DEFAULT_KEYS` are exactly these names and set the inputs' `name` attributes (`input[name=nume]`).

## Files & prefixes
- Kit source in the skill: `kit/engine/`, `kit/css/`, `kit/react/`, `kit/scenes/<name>/` (`scene.md` stays in the
  skill), `kit/backend/`, `kit/app-template/`.
- Scene classes are prefixed `.<name>-` (form-popup: `.form-popup-`); a scene folder has one writer.

## House rules every file obeys
Romanian diacritics in copy examples; no em dashes anywhere; no invented facts in examples (label "Exemplu");
transforms/opacity/clip-path only; 16px inputs; 100svh frames; nothing cut at 390x844 or 1440x900.
