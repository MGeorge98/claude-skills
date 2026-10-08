# timeline

Vertical timeline of 4 to 10 entries on a spine: left on mobile, in the centre from 761px with entries alternating
(or `side="right"`: left spine at every width). Each entry: mono date, title, 1 to 3 lines, optional `<img>` with
explicit size. Status v3, not pinned.

## When to use
History, process, roadmap-as-story. Fewer than 4 entries is a list; more than 10 should be split or grouped.

## Props
| name | type | default | drives |
|---|---|---|---|
| `entries` | `{date, title, lines[1..3], image?: {src, alt, width, height}}[]` | required, max 10 | one li each |
| `heading` | string | none | h2, word masks |
| `kicker` | string | none | mono line above the heading |
| `label` | string | required | aria-label of the list |
| `id` | string | none | anchor |
| `side` | "alternate" \| "right" | "alternate" | centre spine from 761px, or left spine always |

## Copy slots
kicker (~30 chars), heading (4 to 9 words), per entry: date (~12 chars, label like "Pasul 1"), title (2 to 5 words),
up to 3 lines of at most ~70 chars, image optional (explicit width/height).

## Choreography (N = entries; each li reveals on its own)
Each `<li data-rv>` gets `.in` from the kit observer as it scrolls in. Ladder inside the entry (`--i` 0..3, 80ms
steps after a 300ms base, 0 for the first entry): dot pops on `--ls-spring` and fills with `--accent`, date, title,
text rise 18px. The spine segment between entry k and k+1 (a child of entry k) scales 0 to 1 from the top, 480ms
`--ls-inout`, when entry k+1 has `.in` (`:has(+ .timeline-entry.in)`). A static `--line` track sits under every segment.

## Integration
`<Timeline {...props} />`; classes `.timeline-*`. The `<li>` keeps `data-rv` for the observer but its own hidden
state is lifted (opaque, no transform); the children carry the reveal so the spine never hides with its entry.

## Mobile
One column, spine at the left (dots 14px), padding-left 36px, images full width up to 420px.

## Reduced motion / no JS / failsafe
Hidden states gated `html.js:not(.rm)`; children carry the failsafe (3.5s) under `:not(.mo)` with scene keyframes
for dot and segment. Base CSS is the final state: spine full, dots filled, text visible.

## Gotchas
- Do not decorate the `<li>` with a transform (the kit's `.in` would flatten it); nothing here does.
- `:has()` is required for live segments; engines without it get the failsafe at 3.5s.
- Observed per entry (not the list), so a long list never fires early. Never place an entry half-visible at load.
- Ladder is 4 steps, within the 6 limit.
