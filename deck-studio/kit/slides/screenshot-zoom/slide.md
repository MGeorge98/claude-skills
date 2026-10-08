# screenshot-zoom

A screenshot in a fixed frame, the point above it, a side column listing the regions. Step 0 shows the whole
screen; step k zooms the frame onto region k and shows its label pill and note; going back zooms out.
For "look here" moments on a real product screen. The owner supplies the screenshot; the kit example
(`/exemplu-captura.png`, a neutral fake app window with four zones) exists only in a work app.

## Props (`ScreenshotZoomData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters |
| `point` | `string` | 64px, one line (about 45 characters): the frame needs the height |
| `image` | `{ src, alt, width, height }` | local file in `public/`, natural pixel size. Capture at 2x (a 1600 px window as 3200 px) so zooms stay sharp |
| `regions` | `{ x, y, w, h, label, note? }[]` | 1 to 4, in the image's own pixels; `label` 1 to 3 words (pill), `note` one short sentence |
| `chrome` | `boolean \| string?` | a browser bar over the frame: `true` dots only, a string is printed as the address (mono) |

## Steps
`steps = regions.length` (max 4). Step 0: kicker, point, frame with the whole image (scale k <= 1), and the list of
labels beside it. Step k: cap k (`<Step at={k} swap="zoom">`: count `0k / 0N`, pill, note) replaces the list in the
side column, and the frame zooms to region k over 600 ms `--inout`, with region k outlined.
The transforms are computed in TSX from the data only (`zoomGeometry`) and set as `--z0..--z4` on the root;
`:has(.screenshot-zoom-cap[data-r="k"].in)` picks one. No step prop, no listeners.
Zoom scale is capped at 1 (natural size at 1920, never an upscale): a 1600 px capture over a 1075 px frame can only
zoom 1.5x, a 3200 px capture 3x. A region larger than the frame does not zoom at all.

## Modes
- Live stage: as above.
- `?print`, `?rm`, no JS, failsafe: the frame shows the whole image with every region outlined and numbered, and the
  list beside it carries every label with its note. Under rm a step lights its row (accent) and dims the other marks.

## Notes slot
What the screen is, said at step 0; one bullet per zoom.

## Rules that bite
- The zoomed layer extends past the frame (clipped by `overflow: hidden`); `audit.cjs` counts its rect as outside
  the stage at steps 1..N unless the audit clips rects by overflow ancestors.
- A screenshot with text over 1:1 cannot be made sharper by zooming: capture it larger.
- Regions near the edge zoom off centre (the frame never shows past the image edge).
- Under 40 words: 4 labels of 2 words plus a 6 word point at step 0; notes appear one at a time.
