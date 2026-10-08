# title

The talk's first slide: the title in word masks, the speaker line, event and date in mono, an optional logo
and an optional glow. Everything enters with the slide (no clicks).

## Props (`TitleData`)
| prop | type | notes |
|---|---|---|
| `title` | `string[]` | one string per line; 2 or 3 lines at 124px fit 1560px |
| `accentLine` | `number?` | 0-based line drawn in `--accent` |
| `speaker` | `string?` | "Nume · Rol", 36px `--ink-2` |
| `event`, `date` | `string?` | mono 26px, uppercase, bottom left; copy the date exactly from facts.md |
| `logo` | `{ src, width, height, alt }?` | a file in `public/` (default `logo.svg`), drawn 56px high, top left; never recolour a third-party logo |
| `glow` | `"center" \| "left" \| false` | radial accent glow, inside the slide |

## Steps
`steps = 0`. All elements are `<Step at={0}>`: the headline uses `rv="mask"` (45 ms per word), the speaker
and the meta line follow on the `--i` ladder after the last word.

## Notes slot
One to three lines: the first sentence you say, who you are.

## Rules that bite
- Word masks need the `.w` padding for diacritics (deck.css has it); do not set `overflow: hidden` on `.title-h`.
- Over 3 lines at 124px the block reaches the meta line: shorten the title, do not shrink the type.
