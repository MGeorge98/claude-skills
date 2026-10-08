# two-up

Two columns on the stage for before/after, us/them, problem/solution. The left column is there from step 0,
the right one enters on click 1, an optional verdict line on click 2. Space is reserved: both columns and the
verdict are laid out from step 0.

## Props (`TwoUpData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters (gotcha 12) |
| `point` | `string` | the slide's one point, 64px, visible from step 0 |
| `left`, `right` | `{ label, title?, lines, image? }` | `label` mono; `title` 44px; `lines` 2 to 4 at body size; `image` `{ src, alt, width, height }` shown in a 760 x 230 frame, `object-fit: cover` |
| `verdict` | `string?` | one accent line, 48px |
| `mode` | `"side" \| "swap"` | default `side`; `swap` puts the right column in the left one's place |

## Steps
Side: `steps = 1 + (verdict ? 1 : 0)`; step 0 kicker, point, left column; step 1 right column; step 2 verdict.
Swap: `steps = 1`; step 1 shows the right column in place of the left (`<Step swap="g">` members in a
`.deck-swap`) and the verdict, if any. The no-JS document and print show the last member (the right one).

## Notes slot
What you say about the left column before the first click; one bullet for the right column, one for the verdict.

## Rules that bite
- Under 40 words at the final step: two lines per column and a short verdict is the limit; images carry no text.
- With images in both columns, keep the line counts equal or the cards differ in height.
- Images are local (`public/`) with width and height; the example uses data URI placeholders. Do not put a
  screenshot with small text in the 230px frame; use `screenshot-zoom` for that.
- Swap mode: both columns should have a similar number of lines, the cell takes the taller one.
