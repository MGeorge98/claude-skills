# image-full

A full-bleed image with a gradient scrim and, over it, a kicker plus a title (word masks) and an optional
mono caption on the next click. For the moment where the picture is the argument.

## Props (`ImageFullData`)
| prop | type | notes |
|---|---|---|
| `image` | `{ src, alt, width, height }` | local file in `public/` (the owner supplies the photo), 16:9 at 1920 x 1080 or larger; the example is an SVG data URI placeholder |
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters |
| `title` | `string?` | 88px, word masks, under 12 words |
| `caption` | `string?` | mono 24px, enters at step 1; credit or one line of context |
| `scrim` | `"bottom" \| "left" \| "none"` | default `bottom`; the gradient sits where the text sits |
| `fit` | `"cover" \| "contain"` | default `cover`; `contain` letterboxes on `--bg` |

## Steps
`steps = caption ? 1 : 0`. Step 0: image, scrim, kicker and title. Step 1: caption.

## Notes slot
What the picture shows and why it is on screen; the caption's one line if it needs a sentence.

## Scrim rule (slide-rules 8)
- Text never sits on bare photo: `bottom` for text along the lower edge, `left` for a long title in a left column
  (900px wide), over a photo whose busy part is on the right. Pick the side where the photo is calm.
- `none` only when the photo is dark and calm where the text sits; check kicker 4.5:1 and title 7:1 in the sheet.
- The scrim is `--bg` at 94% at the text edge, so contrast does not depend on the photo.
- Under 40 words: a 12 word title and a caption of about 10 words is the limit.
- Crop: `cover` cuts the edges of a non-16:9 photo; keep the subject in the middle two thirds.
