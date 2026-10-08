# video

A framed 16:9 card holding a muted clip that the runtime plays when the slide enters and pauses when it leaves.
With a kicker or a point: text column (520px) on the left, frame 1112 x 625 on the right. Without both: the frame
alone, 1440 x 810, centred. Caption in mono under the frame.

## Props (`VideoData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters |
| `point` | `string?` | 64px, wraps in the 520px column: keep it under about 45 characters (3 lines) |
| `src` | `string` | local mp4 in `public/` (H.264, yuv420p, `+faststart`), never hotlinked |
| `poster` | `{ src, width, height }` | local PNG/JPG in `public/`, the clip's first frame or a chosen one; its size is the video's `width`/`height` |
| `caption` | `string?` | 24px mono `--muted`, one line (ellipsis past the frame width) |
| `loop` | `boolean?` | default false: the clip stops on its last frame |
| `controls` | `boolean?` | default false. The only way to sound: a visible native bar; the video gets `data-no-nav` |
| `fit` | `"contain" \| "cover"?` | default contain (letterboxed in the frame); cover crops to fill |

## Steps
`steps = 0`. Kicker, point, frame and caption enter with the slide (`at={0}`, laddered by `i`).

## Media behaviour
- Markup: `<video muted playsInline preload="none" poster width height>`, no `autoPlay`. The runtime's `media()`
  plays every muted video in the current slide (and in a `.in` step) and pauses the rest on every move.
- `preload="none"` on purpose (CONTRACT says metadata): with `metadata`, Chrome reads every video in the deck on
  load and then aborts the open range request, which logs `net::ERR_ABORTED` on every other slide (rule 1 fails).
  The poster carries the frame until `play()` loads the file; local files start in a frame or two.
- Leaving pauses at the current time; coming back resumes from there (no rewind).
- `?print`: nothing plays, the poster shows, the native bar and loading ring are hidden.
- No JS and `deck-static`: the poster shows; Chrome draws its own control bar when scripting is off (useful there).
- Reduced motion: the wave 1 runtime still plays the clip under `html.rm` (see the runtime note in the handoff);
  until it checks `rm()`, use `controls: true` for clips that must not move on their own.

## Example media
`public/exemplu-video.mp4` (4 s, 1280 x 720, 24 fps, about 90 KB) and `public/exemplu-poster.png` (frame 0), rendered
with playwright frame by frame and encoded with `ffmpeg -framerate 24 -i %03d.png -c:v libx264 -pix_fmt yuv420p
-crf 26 -movflags +faststart -an`. They live in `kit/slides/video/public/` and `sync-kit.sh` copies them into the app `public/` when missing.
The example `src` is root-absolute (`/exemplu-video.mp4`): fine under
`vite preview` and a host, broken when `dist/index.html` is opened from disk (use `exemplu-video.mp4` there).

## Notes slot
What to watch for in the clip, and what you say while it runs (1 to 3 lines).

## Rules that bite
- One clip per slide; under 20 seconds, or the room waits on it.
- Text inside the clip is not on the slide's word budget, but a PDF reader only sees the poster: pick a poster that
  states the point.
