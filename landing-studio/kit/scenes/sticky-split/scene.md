# sticky-split

A pinned chapter with a sticky media panel and text beats: on desktop the panel holds the left 48% of the
screen (right with `flip`) and the text column beside it shows one beat at a time; on phones the panel sits on
top at 40svh and the beats take the rest. Panel i belongs to beat i and cross-fades at each handover; dots in
the panel corner track the active beat.

## When to use
3 to 6 steps that each need a picture: a product walkthrough, a process, before / after shots. Not for
content people need to compare side by side (use a static grid).

## Props
| name | type | default | drives |
|---|---|---|---|
| `beats` | `{ kicker?, title, lines: string[] }[]` | required | one `[data-beat][data-a][data-b]` text layer per beat (engine handler; first has `data-a="0"`, last `data-last`) |
| `panels` | `{ src, alt, width, height }[]` or `ReactNode[]` | required | one per beat; an `<img>` with explicit size (cover-fitted in the pin, natural ratio in the column), or a node that fills the panel |
| `label` | string | required | `aria-label` of the section |
| `len` | number (vh) | 300 | track length below 820px (`--len`) |
| `lenDesktop` | number (vh) | 360 | track length from 820px (`--len-d`) |
| `windows` | `[a,b][]` | auto | explicit beat windows; default `splitWindows(n)`: equal slices overlapping .02, first at 0, last ends at 1 |
| `flip` | boolean | false | panel on the right, text on the left (desktop only) |
| `tau` | number (ms) | engine 80 | `data-tau` smoothing |
| `id` | string | none | anchor |

4 beats give [0,.265] [.245,.51] [.49,.755] [.735,1]; handovers (the overlap centres) at .255, .5, .745.

## Motion (all pure functions of `--p`)
- Text beats: the engine's beat handler (in over .07 after `a`, out over .06 before `b`, 46px rise).
- Panel i: `--on` = smootherstep in over .05 centred on the previous handover (`--pi`, -1 for the first) times
  smootherstep out over .05 centred on the next (`--po`, 9 for the last); `opacity: var(--on)`.
  Scale .96 to 1 linearly across the beat window `[--sa, --sb]`, clamped (never above 1).
- Dots: the same `--on` per dot, accent fill opacity and scale .6 to 1.
- A static mat (`.sticky-split-frame`) sits behind the panels so the cross-fade passes through a neutral tone.

## Copy slots
kicker 1 to 3 words (mono caps), title <= 6 words, lines 1 to 3 rows of <= 12 words.

## Mobile
Panel at the top (12px from the edge, 40svh), beats centred in the lower 60%; the tallest example beat ends
at 681px of 844 (mid-rise included). Dots bottom left of the panel.

## Reduced motion / no JS
Pinned layout gated `html.mo:not(.rm)`. Without the engine (no JS, `html.rm`, `ls-static`) the scene is a
720px column: each panel at its natural ratio with its beat under it; mat and dots hidden.

## Verification frames (top + p x (height - vh), wait 1s)
- p 0: panel 1 at scale .96, beat 1 and dot 1 lit (no dead frame).
- p .3: panel 2, beat 2. p .5: handover 2 to 3, both panels half, beat 3 rising.
- p .7: panel 3, beat 3. p .9 and 1: panel 4 at scale 1, last beat holds, last dot lit.

## Measured (2026-10-08, kit preview, 4 beats)
audit PASS (flick 42 at 390, 45 at 1440); perf: 9 paints, 0 layouts per 2s scroll at 390, idle 0, CLS 0.

## Gotchas
- `--on` is computed on the panel and on each dot `li` (they carry `--pi --po` inline); a child reading
  `--on` inherits the parent's resolved value.
- Panels are absolutely positioned against the sticky stage; the `article` wrappers stay static, so the
  same DOM serves the pinned screen and the static column (panel above its beat).
- With an even beat count a `--p` of .5 is a handover: the frame shows two half panels. Expected.
- `will-change` only under `.live`; the stage has `contain: layout paint style`.
- The engine's beat handler eases with easeOut, not smootherstep (see the report for the engine note).
