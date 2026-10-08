# deck-studio kit: the runtime for slide authors

Read `../CONTRACT.md` first; this file is the how. Everything here is copied into an app by
`app-template/sync-kit.sh`; never import across skills, never edit `src/kit` or `src/styles/deck.css` inside an app.

## Pieces
| file (in the app) | what |
|---|---|
| `src/kit/runtime/deck.ts` | `createDeck({ id, root, mode, onChange })`: state `{ slide, step }`, gating, keys, click, hash, zoom, scaling, BroadcastChannel sync, media, print. Exposes `window.__deck` (`state() next() prev() go(slide, step) total() stepsOf(i) sync()`) |
| `src/kit/runtime/prerender.mjs` | runs after `vite build`: renders `src/deck.tsx` into `dist/index.html` (the no-JS document) |
| `src/kit/react/Deck.tsx` | `<Deck id slides transition? />`: mounts the runtime, renders one `<Slide>` per `SlideDef` from `src/slides/registry.ts`; `?presenter` and `?print` modes |
| `src/kit/react/Slide.tsx` | the section, plus the types `SlideDef`, `SlideProps`, `SlideType`, `Transition` |
| `src/kit/react/Step.tsx` | `<Step at rv? i? swap? as? className?>` |
| `src/kit/react/SplitWords.tsx` | word masks: `<SplitWords text start? />`, `wordCount()` |
| `src/kit/react/Hud.tsx`, `Presenter.tsx`, `server.tsx` | hud and key list, presenter view, prerender entry |
| `src/styles/tokens.css` | app-owned after the first copy: brand block, deck block, type scale |
| `src/styles/deck.css` | stage, modes, step states, transitions, failsafe, rm, print, hud, presenter |

## Attributes the runtime reads and writes
- `section.slide[data-slide=id][data-type][data-steps=N][data-transition=fade|none|wipe]`, rendered by `<Slide>`.
  `data-steps` must equal the highest `at` on the slide (the audit checks it).
- `[data-step=k]` (from `<Step at={k}>`): gets `.in` when the slide's step is `>= k`. `at={0}` enters with the slide.
- `[data-step-swap=group]` (from `<Step swap="group">`): inside one group only the newest revealed member is `.in`.
  Put the members in a `.deck-swap` container (one grid cell). Used by screenshot-zoom and two-up.
- `[data-rv]` on a step: unset = rise 22px, `mask`, `pop`, `side`, `wipe`, `blur`. `--i` (prop `i`, 0..5) ladders
  steps that share one `at` by `--stagger` (70 ms).
- `[data-no-nav]`: clicks inside do not advance (also `a, button, input, select, textarea, label, iframe,
  video[controls]`).
- On `<html>`: `js`, `rm`, `print`, `presenter`, `deck-ready`, `deck-static`, `hud-off`, `keys-on`.
- `.is-current` on the visible section, `.is-leaving` (with `data-leave`) on the previous one during its exit.
- `--deck-scale` on every `.deck-viewport` (the main one also carries the `+ - 0` zoom).

## Writing a slide type
```tsx
import Step from "@/kit/react/Step";
import SplitWords from "@/kit/react/SplitWords";
import type { SlideProps } from "@/kit/react/Slide";
import "./my-type.css";

export type MyTypeData = { point: string; items: string[] };
export const steps = (d: MyTypeData) => d.items.length;          // = the highest `at` below

export default function MyType({ data, step }: SlideProps<MyTypeData>) {
  return (
    <div className="my-type-root">                               {/* position: absolute; inset: 0; padding: var(--slide-pad) */}
      <Step at={0} rv="mask" as="h2" className="my-type-point"><SplitWords text={data.point} /></Step>
      {data.items.map((t, n) => <Step key={n} at={n + 1} className="my-type-item">{t}</Step>)}
    </div>
  );
}
```
Rules:
1. Sizes in px at 1920 x 1080; never `vw`, `vh`, `%` of the viewport, media queries. The runtime scales the stage.
2. Every element that is not there from the start is a `<Step>`; its box is laid out from step 0. Never `display: none`,
   never conditional rendering on `step` for content (the space would not be reserved and the no-JS document loses it).
3. CSS that depends on the step keys off `.in`, never off the `step` prop: e.g. a card frame hidden with its row is
   `html.js:not(.print) .x-row:has(> .x-head:not(.in)) { border-color: transparent }`. Hidden states only under
   `html.js:not(.rm):not(.print)`; under `html.js.rm` only `opacity: 0` on `:not(.in)`.
4. Use the `step` prop only for values the CSS cannot express (a zoom target, a highlighted range, a count-up).
   Write them as inline custom properties or transforms; never change a `<Step>`'s `className` with it
   (the runtime owns `.in` on the same element).
5. Transforms, opacity and clip-path only; no transform rests above scale 1. No listeners on window or document
   (the runtime has the only resize, key and click handlers). No GSAP, no reveal libraries.
6. Classes prefixed `.<type>-`, colours and fonts from tokens only. No em dashes in code, comments or copy.
7. Video: `muted playsInline preload="metadata" poster width height`; the runtime plays it when its slide (and its
   step, if inside one) is current and pauses it on leave. Images: local, in `public/`, with width and height.
8. The presenter's "Urmează" pane renders the next slide with every step `.in`; your CSS must read right there too.

## Adding a type to the catalogue
`kit/slides/<type>/` with `slide.md`, `<Type>.tsx` (PascalCase of the folder: `big-number` -> `BigNumber.tsx`),
`<type>.css`, `data.example.ts` (exports `example` and `notes`; Romanian, diacritics, "Exemplu", no facts) and
`preview.tsx` (exports `variants: SlideDef[]`, the edge cases). Add its row to `slides/INDEX.md`.
`sync-kit.sh <app> --slides <type>` copies it and regenerates `src/slides/registry.ts` and `src/preview-deck.tsx`.

## The preview deck
`/?preview` shows one slide per synced type from its `data.example.ts`, in catalogue order; `/?preview=<type>` shows
that type's `variants`. Both are ordinary decks: keys, `#n.k`, `?presenter` and the audit work on them
(`audit.cjs --url "http://localhost:5190/?preview=<type>" --slide n`; the no-JS and print profiles cover THE ORDER only).

## Modes
- No JS (and `html.deck-static` after the 3.5 s failsafe): the prerendered slides stacked at 1920 x 1080, zoomed to
  the window by a CSS `zoom` ladder, every step visible, swap groups show their last member.
- `?print`: every slide one 1920 x 1080 page (`@page`), every step in, no hud, no transitions.
- `?presenter`: current slide, next slide, notes, timer (`T` resets), `slide n / N · pas k / K`.
- `?rm` forces reduced motion (as `prefers-reduced-motion: reduce` does).
