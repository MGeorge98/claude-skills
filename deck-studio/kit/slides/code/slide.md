# code

A mono block with line numbers. Step 0 shows the code dimmed; each step lights one line range (full opacity rows,
an accent-tinted band with a left bar) and shows its caption under the block. No syntax highlighting.

## Props (`CodeData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters |
| `point` | `string` | 64px, one line (about 45 characters): two lines plus 18 code rows overflow 1080 |
| `lang` | `string?` | mono label at the top right (`tsx`, `sql`, `bash`) |
| `code` | `string` | tabs become 2 spaces, trailing newlines dropped, long lines clipped with a fade, never wrapped |
| `ranges` | `{ from, to, caption }[]` | one per step; `from`/`to` are line numbers as shown (startLine based), inclusive; at most 18 lines each; caption one line |
| `startLine` | `number?` | number of the first line, default 1 |

## Steps
`steps = ranges.length`. Step 0: kicker, lang, point, block (`at={0}`); every row at opacity .55, no band, the
caption row empty (its 34px are reserved). Step k: rows `from..to` of range k at opacity 1 (their numbers in
accent), band k (`<Step at={k} swap="band">`) and caption k (`swap="caption"` in a `.deck-swap`).

## Window and transform
At 1920: 30px mono on 39px rows, at most 18 rows visible. Longer code moves every row and band by
`translateY(-offset x 39px)` (never `scrollTop`). The offset is 0 while the range ends inside the first 18 rows,
else the range is centred and clamped; it depends on the step only, so going back reproduces each frame. Rows
outside the window turn `visibility: hidden` after the move ends (so the audit's stage box check holds). Each row
clips its own text (no inner spans), so nothing rests outside the block. Row highlight and offset come from the
`step` prop (README rule 4); band and caption are `.in` driven.

## Print and no JS
`?print`, the stacked document and `deck-static`: every row, undimmed, no band; the rows shrink (down from 39px) so
the whole snippet plus the list of ranges (`from-to caption`, one per line) fits under 1080.

## Notes slot
What the code does before the first click; one line per range if the caption needs a sentence.

## Rules that bite
- The audit counts code as words: expect the "words at the final step" warning on every code slide; the brief
  should allow it. The caption and point carry the slide's actual message.
- Keep snippets under about 30 lines: in print 30 lines render at about 17px.
- No tokenizer by choice: coloured spans inside a row would report rects past the block on clipped lines.
- The snippet is quoted code: it needs a facts.md line like any quote (whose code, which file).
