# cascade-list

A kicker, the point, then 3 to 6 rows revealed one per click, and an optional closing line as the last click.
The workhorse for "here are the N things". Space is reserved: every row is laid out from step 0.

## Props (`CascadeListData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters (gotcha 12) |
| `point` | `string` | the slide's one point, 64px, visible from step 0 |
| `rows` | `{ text, sub? }[]` | 3 to 6; `text` 40px bold, `sub` 28px `--ink-2`; over 4 rows: two columns |
| `numbered` | `boolean?` | `01 02 ...` in mono in front of each row, default true |
| `closing` | `string?` | 52px accent, revealed after the last row |

## Steps
`steps = rows.length + (closing ? 1 : 0)`. Step 0: kicker and point (`at={0}`, they enter with the slide).
Step k (1..rows): row k; its `sub` is a second `<Step at={k} i={1}>`, so it trails the row by one `--stagger`.
The row's card frame (border, tint) is hidden with the row via `:has()`. Last step: the closing line.

## Notes slot
What you say before the first row; one bullet per row if the rows need a sentence each.

## Rules that bite
- Under 40 words at the final step: 4 rows of 5 words, a 6 word point and a 6 word closing is about the limit.
  Six rows with subs is a preview stress case, not a slide.
- Six rows with subs and a closing fill 1080; do not add a second paragraph to the point.
