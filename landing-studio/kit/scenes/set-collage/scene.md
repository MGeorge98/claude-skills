# set-collage

A set of 3 to 7 project shots in a fixed collage grid that assembles on reveal, with a mono caption on each shot and a
link out. Not pinned. Ported from SPEECH `ProjectsSet.tsx` (simplified: the tilted floating cards became a fixed grid).

## When to use
A "what we have built" proof section after the story, before the form. Needs real screenshots of the client's own work.

## Props
| name | type | default | drives |
|---|---|---|---|
| `shots` | `{ src, alt, width, height, caption, href }[]` | required | 3 to 7 shots (extras ignored); the first is the tall one on desktop and full width on mobile |
| `heading` | string | none | h2 |
| `label` | string | none | mono kicker above the heading |
| `id` | string | none | anchor |

`width` / `height` are the intrinsic pixel size of the file and are always rendered on the `<img>`; the grid cell
fixes the box, so nothing shifts when the image arrives (CLS 0).

## Motion
Wrapper `.set-collage-grid` carries `data-rv="mask"` (neutral variant: wrapper stays visible, engine adds `.in`).
The shots are clipped (`inset` from bottom, odd shots from the left) and open on `.in`; ladder `--i` capped at 5,
70 ms step, 0.9 s each: whole assembly 1.25 s. Heading and label use plain `data-rv`. N = 3 `[data-rv]` elements (label, heading, grid). No `--len` (not pinned).

## Grid
Desktop (>= 761px): 3 columns, rows `clamp(150px, 19vw, 280px)`; shot 1 spans two rows in column 1, the rest fill
columns 2 and 3 (n3: two wide; n4: last wide; n6: last full width; n7: 6th two wide, 7th single).
Mobile: 2 columns, first shot full width, square cells; with n4 and n6 the last shot goes full width so no hole remains.

## Reduced motion / no JS
Base CSS is the final state. Clip is under `html.js:not(.rm)`; failsafe animation opens the shots at 3.5 s if the
engine never mounts; the shots are not `[data-rv]`, so `html.rm` and no-JS rely on the gating alone (no hidden state exists outside `html.js:not(.rm)`).

## Seams
Transparent section on `--bg`; needs `--bg` ground at both edges. Captions sit on a solid `--bg` 90% bar.

## Gotchas
- Never put `data-rv="clip"` on the shots: a fully clipped box never intersects, the reveal would not fire.
- Always pass width and height; a missing pair lets the image decide the cell on mobile only if you remove the
  aspect-ratio, and then CLS returns.
- Real client shots: hotlink or ship them yourself; example data is SVG placeholders only.
