# brand-pour

A pinned chapter where the page turns into another brand and comes back: the guest pours down in staggered
columns, the content switches brand with it, four groups take turns (intro + screenshot, items one at a time,
a stack of short lines, thesis + CTA), then the host pours back.

## When to use
Introducing a second brand (product, partner, sister company) inside the host's page. One per page.

**Paint budget: <= 120 paints per 2s scroll at 390 (scripts/perf.cjs).** Measured on the kit version: 22.
(Today's SPEECH original painted ~487: gradient-sliced columns and color-mix text interpolated per frame.)
Only transform and opacity move: solid columns, one static glow layer faded by opacity, host-coloured twins
cross-faded by opacity.

## Props
| name | type | default | drives |
|---|---|---|---|
| `label` | string | required | `aria-label` |
| `guest` | `GuestPalette` | required | `bg` (static glow layer, may stack gradients), `base` (solid column colour), `accent`, `accentHi`, `soft`, `pale`, `body`, `ink`, `onAccent`, optional `tints[]` (static per-column `--c`, cycled, never animated) |
| `host` | Partial<{bg, accent, accent2, ink, onAccent, pale}> | brand tokens `--bg --accent --accent-2` | colours of the out-pour and of the host twins |
| `cols` | `{desktop, mobile}` | 24 / 12 | number of pour columns (two sets rendered, switched at 820px) |
| `enter` | `[a,b]` | [0, .22] | guest pour window; glow fades in over the last .06; `--g` 1 -> 0 from a+.02 over (b-a-.04) |
| `exit` | `[a,b]` | [.8, 1] | host pour window; `--g` 0 -> 1 from a over (b-a-.02) |
| `tau` | ms | 120 | `data-tau` smoothing (cascades read better a bit lazier) |
| `len` | `{mobile, desktop}` vh | 470 / 560 | track length (`--len`, `--len-d`) |
| `windows` | `{intro, items, stack, thesis}` | [-1,.3] [.31,.59] [.6,.71] [.72,9] | group in (.05 after a) / out (.04 after b) |
| `pill`, `title`, `titleAccent`, `body` | string | | intro copy; the pill is visible from p=0 (host colours, then guest), title words rise at .07 + .008 x index (scaled with the intro end) |
| `shot` | `{src, alt, width, height, sizes?}` | none | screenshot (next/image): rises from 42vh with rotateX 14deg, scale .86 -> 1 over [.10, .24], steps back 36px at .24 |
| `itemsKicker`, `items` | string, string[] | | one at a time with "01 / 03" counters; each window = (items span - .01) / n; on desktop the old leaves upward as the new arrives, on mobile they stack and dim to .24 |
| `stack` | string[] | [] | short lines lit one by one (.035 apart) |
| `thesis`, `thesisAccent`, `cta` | | | closing line and button; the last group never leaves |

Columns: offset `d = (|j - mid| / mid)^1.7 x .1 + ((j x 37) % 5) x .003` (0 .. .112, a staircase edge). The
engine's `pour` handler moves them (translateY from -101% to 0, inout cubic). The section carries the engine's
own attributes, computed from `enter` / `exit`:

| attribute | value | meaning |
|---|---|---|
| `data-pour-in` | `"a,spread"` = `enter[0], enter[1] - enter[0] - .12` (default `"0,0.1"`) | in-column j starts at `a + dn x spread` |
| `data-pour-out` | `"a,spread"` = `exit[0], exit[1] - exit[0] - .12` (default `"0.8,0.08"`) | out-column j starts at `a + dn x spread` |
| `data-pour-len` | `.12` | progress each column takes to land |
| `data-pour-dmax` | `.112` | `dn = d / dmax`; fixed so desktop and mobile column sets share one scale |
| `data-pour-dist` | not set (engine default 101) | start offset in % of the column height |

## Copy slots
pill (1 to 2 words), title 6 to 10 words + accent 1 to 2, body <= 22 words, 3 items <= 16 words each (questions
work best), 3 stack lines of 2 to 4 words, thesis <= 14 words, CTA <= 6 words.

## Mobile
12 columns, 470vh, intro top-aligned with the screenshot under the copy, items stacked and dimming.

## Reduced motion / no JS
Pinned layout gated `html.mo:not(.rm)`. Without the engine: a section painted with the guest background, groups
stacked, all text visible, twins hidden (`display: none`), button in guest colours.

## Verification frames (top + p x (height - vh), wait 1s)
- p 0: host background, the pill already up in host colours (the pinned frame is never empty).
- p .1: columns mid-pour as a staircase (middle leads), pill and first title words visible, no hairline seams.
- p .3: guest fully in, glow visible, headline complete with the accent in guest colours, screenshot fully risen
  and inside the frame (1440x900: not cut at the bottom).
- p .5: items group, "02 / 03" alone (desktop) or 01 dimmed above 02 (mobile).
- p .65: stack lines, the third partially lit.
- p .9: host pouring back from the edges, thesis + button cross-fading to host colours.
- p 1: host background, thesis and button in host colours.

## Gotchas (from 2026-10-08)
- Repaint loops: never slice a gradient across columns (`background-size: 2400%`) and never interpolate colours
  with `color-mix(..., var(--g))`; both repaint every frame. Twins + opacity only.
- Twins of text double the whole line (grid cell, identical wrapping); in the host twin the plain words are
  `visibility: hidden` so only the accent shows. An inline-grid around just the accent would drop it to a new line.
- Seams: `margin-right: -1px` on columns; without it hairlines show at fractional widths.
- `data-px` drifts inside a sticky stage (the element's document position is measured once while the stage
  moves): the screenshot uses `--p`-driven `--pd` instead.
- `--d` is the reveal delay elsewhere in the kit; the screenshot dismiss uses `--dd`.
- `contain: layout paint style` on the stage; `will-change` on columns, twins and glow only under `.live`.
