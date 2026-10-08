# timeline

A horizontal line across the stage with a dot per moment, 3 to 7 moments. Each click draws the segment before the
next dot and reveals that moment; the last moment is the hero (larger, accent). Space is reserved: every column
is laid out from step 0, so nothing moves as moments enter.

## Props (`TimelineData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters (gotcha 12) |
| `point` | `string` | the slide's one point, 64px, visible from step 0 |
| `moments` | `{ label, title, line? }[]` | 3 to 7; `label` mono 24px (e.g. "Luna 1"), `title` 40px bold, `line` 28px `--ink-2` |
| `hero` | `boolean?` | last moment larger (title 56px, dot 48px, column 1.35x) and in `--accent`; default true |

## Steps
`steps = moments.length`. Step 0: kicker, point, the faint rail. Step k: the segment before dot k draws (`scaleX`,
480 ms on `--inout`), the dot pops on `--spring` (340 ms delay), then label, title and line rise on `--i` 1, 2, 3.
Moment 1 has no segment. Over 5 moments the type drops one size step (title 32px, hero 44px).

## Notes slot
What the line shows before the first click; one bullet per moment only if a moment needs a sentence.

## Rules that bite
- Under 40 words at the final step: 7 moments fit only with label and a 1 to 2 word title and no `line`.
  Five moments with lines on two of them is about the limit. Use a `line` sparingly.
- Titles wrap inside their column (about 230 px at 7 moments, 320 px at 5): keep them to one or two words.
- Column widths are computed in `Timeline.tsx` from the 1696 px row so each segment can reach the previous dot;
  do not restyle `.timeline-col` widths in CSS.
- Segment and dot override the default step states in `timeline.css` (`.timeline-root` prefix beats `deck.css`).
