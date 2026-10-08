# number-wall

A grid of 3 to 6 tiles, each a big count-up number (accent gradient), a caption and an optional mono source note.

## FACTS ONLY
Every `value`, `pre`, `suf` and caption must quote a `verified` line of `facts.md` (put the F-id in a comment
in `data.ts`). Count-up only numbers that are in the ledger; a placeholder never ships. `data.example.ts` is
all Exemplu filler and says so on every tile.

## When to use
Proof or scale after the story: 3 to 6 figures the client can source. Fewer than 3, use pinned-beats `big-number`.

## Props
| name | type | default | drives |
|---|---|---|---|
| `items` | `{ value, pre?, suf?, caption, note?, decimals?, ms? }[]` (max 6, extra dropped) | required | tiles |
| `label` | string | required | `aria-label` of the section |
| `heading` / `kicker` | string | none | head block (one reveal) |
| `id` | string | none | anchor |

`decimals` fixes the digits (`value: 4, decimals: 1` gives "4.0"); without it the decimals are those of `value`.

## Reveal (N = 7 max: head + 6 tiles)
Not pinned, no `--len`. The head and every tile carry `data-rv`; tiles ladder with `--i` 0..5 (`--ls-stagger`).
Each number is a `<Count>` (`[data-count]`) and the engine observes it itself (`rv = q("[data-rv],[data-count]")`
in `mountMotion`), so the count starts when that number enters, not when the wrapper does. The kit hides a
`[data-count]` without `data-rv` until `.in`; the scene gives it the same `--i` delay on its opacity.
No JS, `html.rm`, `ls-static` and the failsafe (3.5 s): final numbers, no count (SSR renders the target).

## Layout
- Desktop (761px and up): 3 columns; 4 items make 2x2; 5 items make 3 + 2 (left aligned).
- Mobile: 2 columns; with 3 or 5 items the first tile spans the row.
- Number: `nowrap`, `clamp(28px, 22cqi, 76px)` of the tile width (container query), tabular nums. A 7 character
  figure fits a 127px tile at 390 (28px). Keep `pre` + digits + `suf` under about 8 characters.
- Captions 1 to 3 short lines (`--ink-2`), source note optional (`--muted`, mono, pinned to the tile bottom).

## Ground
Needs the page ground (`--bg`) at both edges; tiles are outlined by `--line` only. 72px / 104px vertical padding.

## Verified 2026-10-08 (390x844, 1440x900)
Counts monotonic, exact final text ("4.8/5", "~8900", "6.7 ore"); scrollWidth equals viewport; no
`will-change`, no scale above 1; rm and blocked chunks show every tile opacity 1.
