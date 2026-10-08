# big-number

One number at 320px, what it means, and a mono source note. The number counts up from 0 in 1500 ms when its
step enters. Space is reserved: the number's box is laid out from step 0.

**The `value` must come from a verified facts.md line. The example numbers are placeholders ("Exemplu"); never present one as a fact. Put the F-id in `note`.**

## Props (`BigNumberData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters (gotcha 12) |
| `value` | `number` | the number, from facts.md |
| `pre`, `suf` | `string?` | text before / after the number, same size and gradient: `+`, `~`, `%`, `x` |
| `decimals` | `number?` | digits after the decimal comma (`3,7`); the count-up follows it |
| `unit` | `string?` | 96px `--ink-2` beside the number: `ore`, `lei`; keep it one short word |
| `meaning` | `string` | h2 size, what the number means; one line of about 8 words |
| `note` | `string?` | mono 24px `--muted`: `sursa: facts.md F-012` |
| `immediate` | `boolean?` | everything at step 0, no count-up (the PDF and `html.rm` already show the final value) |

## Steps
`steps = immediate ? 0 : 1`. Step 0: the kicker (the number's box is reserved, invisible). Step 1: the number
(count-up starts when `.in` lands, via a MutationObserver on that element only), the meaning (`--i` 1) and the
note (`--i` 2). Going back removes `.in` and restores the final text. Under `html.rm`, `?print` and
`html.deck-static` the final value shows at once.

## Notes slot
Say the number, then what it means; one line on where it comes from.

## Rules that bite
- Gotcha 8: the 320px number uses `line-height: .92` plus `padding-top: 40px`; do not shrink the padding.
- Four characters at 320px is about 1000px; `1250` plus `lei` fits, seven characters does not. Shorten with `suf` ("k") only if facts.md allows.
- Under 40 words: kicker, meaning, note together stay near 20.
