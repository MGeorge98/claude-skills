# portrait-hero

Portrait-led hero (Vello style, ported from the SPEECH "Cine sunt" section, simplified to the kit's flow
conventions). A large portrait clip-reveals, name and role rise out of word masks, a short bio staggers in, and an
optional row of links closes it. Not pinned.

## When to use
The "who is behind this" opening or about section of a personal-brand or speaker page. One per page.

## Props
| name | type | default | drives |
|---|---|---|---|
| `portrait` | `{src, alt, width, height}` | required | plain `<img>` with explicit size (CLS 0); never a real photo in examples |
| `name` | string | required | word-mask `h2`, 1 to 4 words |
| `role` | string | none | mono word-mask line under the name |
| `bio` | string[] | `[]` | lines, at most 6 shown, ladder `--i` 0..5 |
| `links` | `{label, href}[]` | none | plain `<a>` pills, external opens in a new tab |
| `label` | string | none | mono kicker above the name |
| `flip` | boolean | false | desktop: portrait right, text left |
| `id` | string | none | anchor |

## Copy slots
label (max ~30 chars), name (1 to 4 words), role (max ~45 chars), bio lines (3 to 6, one sentence each, from facts),
links (2 to 5, short labels).

## Reveal
N = 1 portrait clip + name mask + role mask + label + bio lines (<= 6) + link row. Everything is `[data-rv]`, so
the kit IO adds `.in`; all of it fires on arrival and ends within 1.4 s (portrait 0.95 s, bio lines at 220 ms + 70 ms
per step, 0.7 s each). The portrait's clip-path sits on `figure[data-rv=clip]`, whose parent wrapper is the observed
element; the figure scales from .94 to 1 (never above 1, no `will-change`). The `img` itself is never hidden.

## Mobile
One column, portrait first, `max-height: min(52svh, 440px)` with `object-fit: cover`; natural height section.
Two columns from 820px (`.9fr | 1.1fr`), `min-height: 100svh`, portrait capped at `min(74svh, 700px)`.

## Reduced motion / no JS
Hidden states only exist under `html.js:not(.rm)` through `[data-rv]`; failsafe at 3.5 s is the kit's.

## Gotchas
- Observe the wrapper, clip the child (a clipped observed element never intersects).
- Scale from below 1 only; a rotated or scaled-up promoted portrait paints a soft raster.
- Name words stay under ~11 characters at 390 (clamp 40 to 56px); long names wrap by word, never inside one.
- Seams: needs `--bg` ground at top and bottom.
