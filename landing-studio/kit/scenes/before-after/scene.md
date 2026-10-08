# before-after

Compare slider: two same-size images stacked, "după" on top and clipped on its left side by `--x` (inset from the left, so it shows right of the handle), a native range input laid over the
frame. Not pinned. v3, written from the spec (no source to port).

## When to use
A single proof moment: old site vs new, raw vs finished, before vs after a process. Needs two images with the same
pixel size and framing (the frame takes its aspect ratio from `before`).

## Props
| name | type | default | drives |
|---|---|---|---|
| `before`, `after` | `{ src, alt, width, height }` | required | the two images; width and height always rendered (CLS 0) |
| `label` | string | required | accessible name of the slider (and of the section when there is no heading) |
| `id` | string | none | anchor |
| `labels` | `{ before, after }` | "Înainte" / "După" | mono corner tags |
| `caption` | string | none | figcaption under the frame |
| `heading`, `kicker` | string | none | h2 and mono kicker |
| `start` | number 0..100 | 50 | resting `--x` (handle position, percent from the left; "before" shows to its left) |

## Motion
`.before-after-frame` carries `data-rv="mask"` (neutral variant, never hidden, engine adds `.in`). On `.in`, `--x`
travels from 100% to `start` over `--ls-t-reveal` with `--ls-ease` (a CSS transition on `--x`, registered with
`@property` so it animates). The clipped element is the top image and the handle moves by `translateX(var(--x))`,
so only clip-path and transform run. N = 3 `[data-rv]` elements (kicker, heading, frame). No `--len` (not pinned).

## Control
One `<input type="range" min=0 max=100>`; its React `onInput` writes `--x` on the frame and sets `data-moved`
(which drops the transition so the drag has no lag). No other listeners. Keyboard (arrows, Home, End, PageUp/Down)
is native. The input is transparent, full width and 44px tall, centred on the knob; thumb width is 0 so value and
`--x` line up exactly. `touch-action: pan-y`: vertical page scroll still works over the band.

## Reduced motion / no JS / failsafe
Base `--x` is `start`, both halves visible, control usable. The 100% start exists only under `html.js:not(.rm)`; the
failsafe animation moves `--x` to `start` at `--ls-failsafe` when the engine never mounts; `html.rm` pins it.
Without `@property` support (Firefox < 128, Safari < 16.4) the value jumps instead of gliding; it never sticks at 0.

## Seams
Transparent section on `--bg`; needs `--bg` ground at both edges.

## Gotchas
- Clip the image, observe the frame; never put the clip on the observed element.
- Both images must share size and framing or the comparison looks like a jump.
- Do not set `--x` inline from props: it would beat the reveal rules. Use `start`.
