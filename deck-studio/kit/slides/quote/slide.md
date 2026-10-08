# quote

A quote in large type with an accent quotation mark, then the attribution. Optional round portrait left of the
attribution.

**The quote is copied from a verified facts.md line, at most 24 words (more does not fit at 64px and breaks the 40 word rule).** The examples are placeholders ("Exemplu"); the example portrait is an inline SVG silhouette, never a real person.

## Props (`QuoteData`)
| prop | type | notes |
|---|---|---|
| `text` | `string` | 64px bold, word mask reveal at step 0; max 24 words |
| `attribution` | `string` | mono 32px, the name |
| `role` | `string?` | mono 24px `--muted`, one short line |
| `portrait` | `{ src, alt, width, height }?` | round 160px; local file in `public/`, explicit size |
| `immediate` | `boolean?` | attribution at step 0 instead of step 1 |

## Steps
`steps = immediate ? 0 : 1`. Step 0: the accent mark (`pop`) and the quote (`mask`). Step 1: attribution, role and
portrait as one block. Space is reserved, so the quote does not move when the attribution enters.

## Notes slot
A pause cue, and who the person is if the room does not know.

## Rules that bite
- The quote never changes a word from facts.md; an em dash in the source is a facts.md bug (gotcha 10).
- The mark is the typographic opening quote U+201C, drawn in the accent colour.
- Without a portrait the attribution sits flush left; with one it is vertically centred on the portrait.
