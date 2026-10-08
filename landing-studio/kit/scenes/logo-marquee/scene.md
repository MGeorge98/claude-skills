# logo-marquee

A strip of third-party logos on a seamless loop, with an optional mono kicker. Pure CSS: the logo list is
rendered twice and the track moves `translate3d(-50%)` over `--speed` seconds, linear.

## When to use
Social proof row (partners, clients, press) between two story scenes. Not for brand-owned marks that need
recolouring: logos keep their own colours, only opacity changes (.75, 1 on hover or focus).

## Props
| name | type | default | drives |
|---|---|---|---|
| `logos` | `{ src, alt, width, height, href? }[]` | required | each an `<img>` with explicit width and height (CLS-safe); `href` wraps it in a link (new tab, noopener) |
| `label` | string | required | aria-label of the section |
| `kicker` | string | none | mono line above the strip |
| `speed` | number (s) | 28 | one full loop; px/s scales with the number of logos |
| `pauseOnHover` | boolean | true | pause on hover and on focus-within |
| `id` | string | none | anchor |

## Copy slots
Kicker (max ~30 chars, e.g. "parteneri"), logo alt texts (the brand name). Only logos the facts ledger allows.

## Integration
Section carries `data-watch="marquee"`: the engine adds `.off` while it is off screen. Needs `<Motion />` on the
page; without it the loop would still run (only the pause is missing). Place on `--bg`; the edge mask is
transparent, so the section needs no ground of its own. 4 logos or fewer: the set is narrower than the screen at
1440, the loop then shows gaps; use at least 6.

## Mobile
Logo height 26px, gap 36px, same loop. Edges fade over 12% each side.

## Reduced motion / no JS
Loop, mask and the second copy only exist under `html.js:not(.rm)`. Otherwise one still, centred, wrapping row
(no overflow). The duplicate list is `aria-hidden`, its links `tabindex=-1`.

## Verification frames
- On screen: the track `transform` differs between two samples 500 ms apart.
- Off screen, under `html.paused`: two samples are identical; idle paints in 2 s off screen: 0.
- rm at 390: still wrapped row, scrollWidth equals innerWidth.

## Gotchas
- The loop distance is exactly half the track only if each item carries its own `padding-right` (no flex `gap`
  between items), so the pad lives on the item.
- Hover pause is sticky on touch after a tap; harmless, the next tap elsewhere clears it.
- `--len`: not pinned.
