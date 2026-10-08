# horizontal-pinned

A pinned chapter whose cards glide sideways: heading row (kicker, title, mono counter "i / N"), a thin progress
bar, and a horizontal track of N cards (kicker, title, 1 to 3 lines, optional image). Vertical scroll drives the
row in X; the card nearest the centre of the run sits at full scale and opacity.

## When to use
A sequence people read left to right: steps of a process, a short portfolio run, 3 to 7 items of equal weight.
Not for content that must be compared side by side (use a static grid) or for more than 7 cards (the flick
budget runs out).

## Props
| name | type | default | drives |
|---|---|---|---|
| `cards` | `HorizontalCard[]` | required | one `li.horizontal-pinned-card` per card, `--i` = index |
| `kicker` | string | none | mono label above the heading |
| `heading` | string | required | `h2` of the stage |
| `label` | string | required | `aria-label` of the section |
| `len` | number (vh) | 100 + 90 x (N - 1) | track length below 820px (`--len`) |
| `lenDesktop` | number (vh) | 100 + 75 x (N - 1) | track length from 820px (`--len-d`) |
| `tau` | number (ms) | 140 | `data-tau` smoothing (gotcha 8: a fast flick skips cards below 120) |
| `id` | string | none | anchor |

`HorizontalCard = { kicker?: string, title: string, lines: string[] (1 to 3, extra lines dropped), img?: { src, alt, width, height } }`.
The section carries `--n` = N for the counter and the focus math.

## How it moves (all pure functions of --p, no JS beyond the engine)
- Track: `translate3d(calc((100cqw - 100%) * var(--p)), 0, 0)`. The rail is a size container (`container-type:
  inline-size`), so `100cqw` is the rail width; `100%` in translate is the track's own width (padding included,
  `padding-inline` = gutter). p=0: card 1 at the left gutter. p=1: the last card at the right gutter. Nothing is
  measured; resizing just works.
- Rail clips with `overflow-x: clip` only, so the row never widens the page and card scale never clips in Y.
- Focus: `d = p x (N - 1) - i`, `f = clamp(0, 1 - |d|, 1)`, scale `.97 + .03 f`, opacity `.8 + .2 f`. Scale
  never rests above 1. Opacity floor is .8 (not .7) so unfocused body copy keeps 7:1 on the default ground.
- Counter: a column of digits in a 1em window, `translateY(round(nearest, p x (N - 1), 1) x -1em)`, with a
  `--ls-t-ui` transition. Browsers without CSS `round()` keep "1 / N" (the transform is dropped).
- Bar: the engine's `[data-bar]` handler (`scaleX(p)`); the CSS `scaleX(var(--p))` is the same value before the
  first write.
- `will-change` on the track and cards only under `.live`.

## Copy slots
Heading <= 8 words. Card title 1 to 2 words, lines <= 8 words each, at most 3. Images 840x520 (any ratio works,
always with explicit width and height).

## Mobile
Cards 72vw, gap 20px, one card in focus with the neighbours peeking. Default `--len` 460vh for 5 cards (desktop
min(420px, 30vw) cards, 400vh). Landscape phones under 560px tall get a 22vh image and smaller heading.

## Reduced motion / no JS
Pinned layout gated `html.mo:not(.rm)`. Before mount, without JS, under `html.rm` and `html.ls-static` the
cards are a readable column (below 820px) or a wrapped `auto-fill minmax(300px)` grid, the counter and bar are
hidden, nothing overflows.

## Verification (2026-10-08, preview at 390x844 and 1440x900)
- p 0: heading, counter "1 / 5", empty bar, card 1 at the left gutter (x 23 at 390, 86 at 1440), card 2 peeking.
- p .5: card 3 centred at full opacity, counter "3 / 5", bar half.
- p 1: card 5 at the right gutter (same gap as card 1 at p 0), counter "5 / 5", bar full.
- Audit PASS all four profiles (flick 41 at 390, 47 at 1440); perf scroll paints 2, layouts 0, idle 0, CLS 0.

## Gotchas
- `100vw` in the track math counts the scrollbar on desktop; the rail's `100cqw` does not.
- Never `overflow: hidden` on the section or an ancestor (breaks sticky); the stage and rail clip themselves.
- The focus curve assumes the run is evenly spaced (card i centred at p = i / (N - 1)); on desktop with 3 cards
  visible it reads as "the active step", not literally the centred card.
