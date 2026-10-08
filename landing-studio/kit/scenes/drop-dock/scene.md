# drop-dock

Items thrown into a container. When the container is 40% on screen, each item flies in from an off-screen corner
(WAAPI, `--ls-spring`, 680 ms, landings at 60 / 280 / 500 ms, more items continue the ladder), the counter ticks at
60% of each landing, the container shakes for 180 ms and snaps (accent border and glow fade in). Runs once.
Flow scene, not pinned. Port of the SPEECH agent dock (`351c8dd`, `[data-drop]`, `[data-ctr]`, Motion.tsx).

## When to use
"These N things join your team / your stack / your package": a short set (2 to 6, best 3) that lands in one named
place, with a count that matters. Not for long lists or for anything that needs reading order.

## Props
| name | type | default | drives |
|---|---|---|---|
| `items` | `{ mark?, name, note? }[]` | required | the cards; `mark` is an icon node or a 2 to 3 character label in the round mark |
| `label` | string | required | the container's name ("Firma ta") |
| `counterLabel` | string or `{ one, many }` | required | counter text `"<n> <label>"`, singular at 1 |
| `heading` | string | none | h2, word masks (`data-rv="mask"`, 60 ms step) |
| `kicker` / `lead` | ReactNode | none | mono line above, paragraph under the heading (`data-rv`) |
| `meta` | ReactNode | none | mono line beside the label |
| `children` | ReactNode | none | under the container (CTA link, note) |
| `timing` | `Partial<DropDockTiming>` | land [60,280,500], dur 680, shake 180, failsafe 3500 (ms) | the throw |
| `threshold` | number | .4 | visible fraction of the container that starts the throw |
| `id` | string | none | anchor |

N for the reveal count: `items.length` cards plus heading, kicker, lead (engine `[data-rv]`).

## Copy slots
heading 3 to 7 words, lead one sentence, label 1 to 3 words, item name 2 to 4 words, note one short line
(under ~50 chars so desktop cards stay two lines), counter noun with its plural.

## Integration
`DropDock.tsx` is a client component. Its `useEffect` holds one IntersectionObserver on `[data-drop]` (thresholds
0 and `threshold`, `rootMargin: 100000px 0px 0px 0px`, so a container above the viewport still intersects) and the
WAAPI calls; no scroll listener, no rAF loop; timers, observer and animations are cleaned up on unmount.
- In view at `threshold`: throw. Item rects are read once at the start of the throw.
- Already above the viewport (jumped past, reload lower down, anchor link): final state at once (`.drop-dock-go`,
  `.drop-dock-done`, `.snap`, counter at its total), measured under 100 ms.
- Failsafe: armed only when the throw starts, forces the final state at 3.5 s.
- `html.rm` or no IntersectionObserver: final state on mount.
Classes on the section: `.drop-dock-go` (throw started, items visible), `.drop-dock-done` (settled, desktop hover
lift enabled); on the box: `.snap`.

## Mobile
Cards stack in one column (64px min rows), mark beside the text; from 820px a grid of `min(n, 3)` columns, cards
180px tall, mark above. Throw origins are computed from the viewport, so the cards start fully off screen at
390 and 1440; body `overflow-x: clip` (app-template globals) keeps scrollWidth equal to the viewport mid-flight.

## Reduced motion / no JS
Server HTML is the final state: items docked, counter at its total. Hidden state (items at opacity 0 until the
throw, snap glow off) is gated `html.js:not(.rm)`; while `html.mo` is absent the items and the glow carry
`ls-failsafe` (3.5 s), and the boot script's `ls-static` swap also releases them. `html.rm` forces items visible.

## Verification frames (2026-10-08, port 3062)
- t=100 ms after entering: counter "0 <many>", item 1 mid-flight from the top-left, the others off screen.
- t=550 ms: "1 <one>", item 1 docked, item 2 landing, item 3 entering from the bottom (tilted, scale .94).
- t=800 ms: "2 <many>". t=1400 ms: all docked, counter at its total, border and glow on, every transform `none`.
- Jump past (load at the top, scrollTo bottom): final within 100 ms. Reduced motion, JS blocked (3.9 s) and JS off:
  final state.

## Gotchas
- Dock animating before it is on screen: observe the container itself, not the section, and arm the failsafe
  only when the throw starts.
- Jumping past in one frame does not fire a plain IntersectionObserver (not intersecting before and after); the
  root extended upwards turns "above the viewport" into "intersecting".
- Throws start at scale .94 and land at 1 (promoted layers scale down, never up); hover lift is on the inner
  `.drop-dock-card`, never on the animated `<li>`.
- The snap is opacity on two pseudo-elements, not an animated border or box-shadow (perf idle window may still
  catch the tail of that fade: 2 paints).
- The counter is written with `textContent` (no React state), so the component never re-renders mid-throw.
