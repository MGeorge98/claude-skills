# hero-words

First screen: kicker, a headline that rises word by word out of masks (accent words last, one sheen), lead, CTAs,
an optional backdrop and an optional right column (the lead form). All motion is CSS from the first paint.

## When to use
Every page opens with it. Use split mode (`right`) when the conversion happens on the first screen (QR traffic
that wants the thing now); single mode for a manifesto-style opener followed by a story.

## Props
| name | type | default | drives |
|---|---|---|---|
| `title` | string | required | headline words (split on spaces, SplitWords) |
| `titleAccent` | string | none | words appended after `title`, accent gradient + one sheen 1s after their rise |
| `kicker` | ReactNode | none | mono line above the headline |
| `lead` | ReactNode | none | paragraph under the headline; a string keeps its last two words on one line (no orphan); pass a node to control it yourself |
| `primary` / `secondary` | `{label, href, external?}` | none | CTA buttons; external auto when href starts with http |
| `right` | ReactNode | none | enables split mode from 1024px: grid `head | right`, `below | right` |
| `below` | ReactNode | none | under the headline (left column in split mode) |
| `top` | ReactNode | none | header row (logos, author) |
| `children` | ReactNode | none | backdrop layer behind everything, e.g. `<NetworkBackdrop/>` |
| `timing` | Partial<HeroTiming> | kicker 200, title 420, step 90, lead 800, ctas 1000, right 600, below 1000 (ms); lead + --ls-t-reveal is the hero LCP | the choreography |
| `id` | string | none | anchor |

`NetworkBackdrop`: `nodes` (16), `labels` (index -> word, labelled nodes drawn bigger), `mobile` (indices shown
below 1024px; default today's 9-node subset for 16, else even + labelled).

## Copy slots
kicker (max ~45 chars), title + titleAccent (3 to 7 words total, accent 1 to 3), lead (one sentence), 2 CTA labels
(2 to 3 words), up to 6 network labels (one short noun each, from the facts ledger).

## Integration
`import SplitWords from "@/kit/react/SplitWords"`: `SplitWords({ text, start?, step?, base? })` emits
`<span class="w"><i style="--d;--i">word</i></span>` with `--d = base + index x step`; the accent run passes
`start={words(title)}` so the ladder continues. The `.w` mask styles come from `src/styles/motion.css`.
Fonts: `--font-mono` / `--font-sans` from `src/styles/tokens.css`.

Engine vars on the section (`data-watch="hero"`, written by the engine's hero handler):
`--hx` 0..1 = scrollY / (0.8 x vh), the backdrop fades and scales with it; `--mx` / `--my` in [-1, 1] pointer
position from 1024px wide on a fine hover pointer (the headline drifts 6px). Off on touch and under `html.rm`;
`.off` pauses the loops while the hero is off screen.

## Mobile
One column: head, right (form), below. Headline clamp(40px, 10.5vw, 52px), net full width behind the title, masked
to the bottom. Split from 1024px (headline clamp(64px, 6.2vw, 96px)); 820 bumps the lead and header padding.

## Reduced motion / no JS
Hidden states live only in keyframes (`fill: backwards/both`), gated `html.js:not(.rm)`: without JS or with
`html.rm` the hero is complete on the first paint and the network is drawn in its final state, loops off.

## Verification frames
- t=0 (first paint, before hydration): header and right slot may be faded, but nothing must be cut; layout final.
- t=1200ms: network mesh visible, core gone, first title words up.
- t=3200ms: everything settled; at 390x844 the kicker, full headline, lead and the first CTA (or the form top)
  are above the fold; at 1440x900 the form's submit button is above the fold.
- scrollWidth equals viewport width at 390 and 1440.

## Gotchas (from 2026-10-08)
- Dead first frame: never gate the hero on the engine or an IntersectionObserver; it animates from CSS.
- Fold cut: a form taller than the viewport in split mode is fine (sticky not needed), but the submit must be
  inside 900px at 1440; shorten the consent text or drop optional fields before shrinking type.
- Column slicing: a headline with `max-width: 11ch` and long Romanian words (e.g. "documentația") can break inside
  a word at 390; keep words under ~11 chars or lower the clamp.
- Repaint loops: `.hero-words-lp` stroke-dashoffset loops repaint every frame. They pause on `.off` (the net
  carries its own `data-watch="net"`, the section `data-watch="hero"`) and under `html.paused`; the net is
  `visibility: hidden` when off. Watching only the section was not enough: on a phone the form keeps the hero
  on screen long after the net has scrolled away (482 idle paints in 2s, kit demo 2026-10-08).
- Accent gradient sits on each word `<i>` (not on a wrapper): background-clip text on a parent of transformed
  inline-blocks does not paint reliably.
- `--hx`, `--mx`, `--my` are read with 0 fallbacks: without the engine the hero is simply still.
