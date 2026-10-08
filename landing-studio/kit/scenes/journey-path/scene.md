# journey-path

Ordered list of 3 to 5 steps on a line that draws itself segment by segment (scaleY on mobile, scaleX from 761px,
160ms stagger). Dots pop with a spring, cards rise. The last step is the hero card: bigger, optionally in a guest
colour, lands at 680ms on the spring. Source: SPEECH "Traseu". Status v2, not pinned.

## When to use
Closing "what next" chapter: from the smallest step to the biggest one. Fewer than 3 steps is a list, not a path.

## Props
| name | type | default | drives |
|---|---|---|---|
| `steps` | `{kicker, title, lines[1..2], hero?}[]` | required, max 5 | one li each; the last is the hero card unless `hero: false` |
| `heading` | string | none | h2, word masks (60ms step) |
| `label` | string | none | mono line above the heading |
| `id` | string | none | anchor |
| `guest` | `{accent: string}` | none | sets `--journey-path-guest` on the section; hero dot, border, tint use it, else `--accent` |

## Copy slots
label (max ~30 chars), heading (4 to 9 words), per step: kicker (~12), title (2 to 5 words, the hero up to ~28
chars at 390), 1 to 2 lines of at most ~70 chars.

## Choreography (after `.in` on the list)
dot i at 100 + 160i ms (spring), segment after step i at 220 + 160i ms (ease), card i at 150 + 160i ms rising 28px,
hero card at 680ms from 40px / .92 on the spring. Everything is done by about 1.4s. Heading and label use plain `data-rv`.

## Integration
`<JourneyPath {...props} />`; classes `.journey-path-*`; `--n` (step count) is set inline for the desktop grid.
Guest colour travels only through the scene-local property; the CSS never holds a literal colour.

## Mobile
One column, line on the left (scaleY), dots left of the cards. From 761px: side by side, cards grow left to right
(min-heights 250 to 400), `100svh` section, centred.

## Reduced motion / no JS
Hidden states are gated `html.js:not(.rm)` and carry the failsafe (3.5s). Base CSS is the final state.

## Gotchas
- The `<ol>` is the observed element and is never clipped; the hidden state sits on its children.
- Decoration (the hero scale) lives on `.journey-path-card`, a child, so `.in { transform: none }` cannot flatten it.
- The kit's `[data-rv="path"]` only keeps the list itself opaque; the stroke rules apply to SVG shapes and are inert here.
- Nothing partly visible at load should carry this reveal: place it below the fold or the observer fires at once.
- Ladders: 5 steps use `--i` 0..4; at most 6.
