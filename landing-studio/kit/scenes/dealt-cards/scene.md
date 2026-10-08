# dealt-cards

A short list dealt onto a table: a section heading on a pinned screen and three cards that drop in one after
another, land on their resting tilt with a small overshoot, and push the cards below down. A soft shadow under the
pile darkens as cards land. Ported from the SPEECH "De mâine" section (2026-10-08).

## When to use
"What you can do tomorrow", three steps, three takeaways: 3 short items with equal weight that read better one at
a time than as a grid. Not for more than 3 cards (the engine's default windows are for 3) or for long text.

## Props
| name | type | default | drives |
|---|---|---|---|
| `cards` | `DealtCard[]` | required | one `li[data-deal=i][data-r]` per card, `--r` = resting tilt for the static column |
| `heading` | `{ kicker?, title }` | required | mono kicker + h2 above the pile; `*stars*` paint accent words |
| `label` | string | required | `aria-label` of the section |
| `len` | number (vh) | 253 | track length below 820px (`--len`) |
| `lenDesktop` | number (vh) | 276 | track length from 820px (`--len-d`) |
| `tau` | number (ms) | engine 80 | `data-tau` smoothing |
| `id` | string | none | anchor |

`DealtCard = { kicker: string, title: string, lines: string[], r?: number }`: mono kicker, title (`*stars*` in
`--accent-2`), 1 to 3 short lines in `--ink-2`; `r` defaults to [-4, 3, -1.5][i] deg.

## Motion (engine built-in `deal` handler, no scene JS)
Card i owns [i x .33, i x .33 + .3]; lands with ease-out-back from (22vw, .6vh desktop / .4vh mobile, 18deg,
scale .9) to its tilt; opacity reaches 1 at 20% of its window. Each later card nudges the ones below 18px down and
scales them by .97. `[data-deal-sh]` opacity = landed / n, scale .7 + .12 x landed. Tunables on the section (not
exposed as props; set them in the TSX if a project needs them): `data-deal-r0 data-deal-x data-deal-y
data-deal-y-sm data-deal-nudge`.

## Copy slots
Heading <= 6 words. Card kicker 1 word; title <= 7 words; lines 2 to 10 words each, at most 3.

## Mobile
Heading on top, the pile below at min(78vw, 360px), drop .4vh. From 820px: heading left, pile right (360px).
Short landscape phones (height under 560px): two columns, card sized from the frame height.

## Reduced motion / no JS
Pinned layout gated `html.mo:not(.rm)`. Before mount, without JS, under `html.rm` or `ls-static` the heading
and the cards are a readable column (desktop: three cards in a row), each card at its resting tilt, all opaque.

## Verification frames (scroll to top + p x (height - vh), wait 1s)
- p 0: heading + an outlined dashed slot where the pile lands (no empty stage).
- p .15: card 1 in flight, slot fading. p .35: card 1 resting, card 2 dropping in.
- p .5 / .7: card 2 resting over card 1 (card 1 nudged and scaled .97), card 3 dropping.
- p .9 / 1: three cards piled, card 3 on top, shadow full, nothing cut at 390x844 or 1440x900.

## Gotchas
- Dead first frame: the engine writes card 1 at opacity 0 for p = 0 (window starts at 0), so the stage shows the
  heading and `.dealt-cards-slot`, a pure function of `--p` that fades out over p .18 to .3 as card 1 covers it.
- No `contain: paint` on the table (the SPEECH original had it): it clips the dropping card at the table's edge
  on desktop, a hard vertical cut mid-screen. The stage's own `overflow: hidden` is enough.
- Promoted layers scale down, never up: cards are authored at final size and start at scale .9; the back
  overshoot peaks near 1.01 for a few frames mid-landing, every rest state is <= 1.
- `will-change` only under `.live`.
