# pinned-beats

A story on one pinned screen: big number, lines (optionally revealed row by row), statements with a dimmed tail,
a closing quote. A thin progress bar tracks the scene.

## When to use
The "problem" chapter: 3 to 6 short beats that must be read in order, one at a time. Not for content people need
to scan or come back to (put that in a static section).

## Props
| name | type | default | drives |
|---|---|---|---|
| `beats` | `Beat[]` | required | one absolute layer per beat (`[data-beat][data-a][data-b]`, last gets `data-last`) |
| `label` | string | required | `aria-label` of the section |
| `len` | number (vh) | 320 | track length below 820px (`--len`) |
| `lenDesktop` | number (vh) | 380 | track length from 820px (`--len-d`) |
| `windows` | `[a,b][]` | auto | explicit progress windows, overrides `beatWindows` |
| `overlap` | number | .02 | overlap between consecutive windows |
| `tau` | number (ms) | engine 80 | `data-tau` smoothing |
| `id` | string | none | anchor |

`Beat = { kind: 'big-number' | 'lines' | 'quote', lines: string[], sub?: string[], attribution?: string, stagger?: boolean, weight?: number }`
- big-number: `lines[0]` is the outlined number (aria-hidden, drifts), `lines[1..]` the statement, `sub` dimmed.
- lines: statement rows; `stagger` (default when 3+ rows) turns them into a list of `[data-sub]` rows the engine
  reveals one at a time (opacity .08 -> 1, x 18px -> 0); even rows `--ink-2`, last row `--accent-2`.
- quote: blockquote with an accent quote mark, `attribution` as a mono caption.
- `*word*` in any string paints those words with the accent gradient.

Automatic windows: weights big-number 1.1, quote 1.45, staggered lines 1 + .11 x rows, plain lines 1; scaled so
windows overlap by .02 and the last ends at 1. Today's 5 beats give exactly
[0,.2] [.18,.44] [.42,.6] [.58,.76] [.74,1]. Engine fades in over .07 after `a`, out over .06 before `b`.

## Copy slots
Each beat <= 12 words of statement; staggered lists 3 to 5 rows of 2 to 5 words; quote <= 14 words.

## Mobile
Same scene, shorter track (320vh) and smaller type (clamp(32px, 9.4vw, 44px)). Landscape phones under 560px tall
get vh-based type so the tallest beat fits.

## Reduced motion / no JS
The pinned layout is gated `html.mo:not(.rm)` (engine mounted), not `html.js`: without the engine `--p` never
moves, so a `.js`-gated pin would freeze on beat one. Before mount, without JS, or under `html.rm` the beats are a
readable column with all rows at full opacity.

## Verification frames (scroll to top + p x (height - vh), wait 1s for smoothing)
- p .1: beat 1 fully visible from the first frame (number + statement), bar ~10%.
- p .3: list beat with the first 2 to 3 rows lit, the rest at .08.
- p .5: beat 3 alone (no overlap ghosting).
- p .9 and 1: last beat holds, bar full, caption visible, nothing cut at 390x844.

## Gotchas (from 2026-10-08)
- Dead first frame: the first beat is visible by class (`.pinned-beats-first`), not `:first-of-type` (the bar is
  the first div, so `:first-of-type` never matched the beat).
- IO firing early: do not reveal beats with `[data-rv]`; they are pure functions of `--p`.
- The bar: the engine's built-in `data-bar` handler drives it (inline `scaleX(p)` on `<i data-bar>`, every frame the
  scene moves). The CSS `scaleX(var(--p))` is the same value, kept as the fallback before the first engine write.
- `will-change` only under `.live`; long tracks with permanent layers blow the GPU budget on phones.
- Fold: the tallest beat (quote at 76px) must fit 900px at 1440 and 844px at 390; trim copy, not type.
