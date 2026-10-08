# section

Chapter divider: the chapter number in large mono, the chapter name at display size in word masks, one line
under it. Everything enters with the slide (no clicks). Recommended `transition: "wipe"` on the SlideDef
(the transition lives there, not in the data).

## Props (`SectionData`)
| prop | type | notes |
|---|---|---|
| `number` | `string?` | as written, "01"; mono 160px in `--accent` |
| `name` | `string` | 124px in word masks; 1 or 2 lines fit 1560px |
| `line` | `string?` | 36px `--ink-2`, one sentence |
| `outline` | `boolean?` | the number as a 4px accent outline instead of solid |
| `align` | `"left" \| "center"` | default left |
| `glow` | `"center" \| "left" \| false` | radial accent glow, inside the slide |

## Steps
`steps = 0`. The number, the name (`rv="mask"`) and the line are `<Step at={0}>`; the line follows on the
`--i` ladder after the last word.

## Notes slot
None for a pure divider, or one line that bridges to the chapter.

## Rules that bite
- Keep the number the same style across all dividers of a deck (all solid or all outline).
- Over 2 lines at 124px the block grows toward the edges: shorten the name, do not shrink the type.
- Pair with `agenda` (same `number` values) so the chapters read as one system.
