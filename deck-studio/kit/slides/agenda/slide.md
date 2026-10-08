# agenda

The chapter list as a vertical ladder. Reused mid-deck with `current`, that chapter is lit (`--ink` name,
accent number, accent rule on top), earlier chapters are marked done (check, struck number, `--muted`) and
later ones are dimmed to `--muted`. With `current` unset all chapters are equal.

## Props (`AgendaData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters |
| `point` | `string?` | 64px, visible from step 0; omit it and the ladder centres alone |
| `chapters` | `{ number?, name, line? }[]` | 3 to 6; name 48px bold, line 28px `--ink-2` on the right |
| `current` | `number?` | 1-based chapter that is lit |
| `stepped` | `boolean?` | each chapter is a step (max 6) |

## Steps
`steps = stepped ? min(6, chapters.length) : 0`. Unstepped, the rows enter with the slide on the `--i` ladder.
Stepped, row k is `<Step at={k}>`; the ladder box is laid out from step 0. The done/now/next state comes
from `current`, never from the step.

## Notes slot
One to two lines: how the talk is organised; on a reused agenda, which chapter comes next.

## Rules that bite
- Under 40 words at the final step: with 6 chapters drop most `line`s (the preview shows the stress case).
- Use the same `number` strings as the `section` dividers.
- Do not combine `stepped` with `current`: a dimmed chapter that is also hidden reads as a bug.
