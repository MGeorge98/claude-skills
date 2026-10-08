# demo

A live page inside the slide: an `<iframe data-no-nav>` in a framed card with a mono address bar and a small badge
top right, the point above, an optional note below. A local screenshot (`fallback`) covers the frame until the page
is confirmed live, and stays for good if it is not.

## Props (`DemoData`)
| prop | type | notes |
|---|---|---|
| `kicker` | `string?` | mono 26px uppercase accent, under 32 characters |
| `point` | `string` | 64px, one line |
| `url` | `string` | the page to embed, printed in the bar; a prop, never hardcoded |
| `fallback` | `{ src, alt, width, height }` | a screenshot of the same page, local in `public/`, captured at 2x; its aspect sets the frame (max 1696 x 690) |
| `badge` | `string?` | default `demo live`; its dot turns grey when the fallback took over |
| `note` | `string?` | 24px `--ink-2`, one line under the frame |

## Steps
`steps = 0`: kicker, point, card and note enter with the slide.

## Live or fallback (`data-live` on `.demo-view`)
- `wait`: the fallback shows. The iframe is created the first time the card is on screen (an IntersectionObserver on the card, so a dead address on slide 20 costs nothing on slide 1), never in `?print` or the prerendered document.
- `live` when the iframe fired `load` AND a `fetch(url, { mode: "no-cors" })` probe answered: the fallback fades out.
  The probe is needed because Chrome fires `load` on its own error page for a dead or offline address.
- `off` if the probe fails, or nothing confirmed within 4 s of the frame being created: the fallback stays for good.
- `?print`, no JS and the failsafe (`html.deck-static`): always the fallback, never the frame.

## Notes slot
What the audience should look at, then the moves you will make in the page.

## Rules that bite
- A live demo needs internet on stage. Put a `video` slide with a recording of the same demo right after it, and
  say so in the notes: if the fallback shows, skip to the video.
- Clicks inside the card (frame and fallback) never advance the deck (`data-no-nav`). After clicking into the page,
  the keyboard belongs to the iframe: click outside the card (the point) before using the arrow keys.
- Sites that send `X-Frame-Options: DENY` or a `frame-ancestors` CSP never render in a frame; the probe still
  answers, so they would show an empty frame. Check the URL in the frame before the talk; use a video slide if it refuses.
- The kit example embeds the work app's own preview (`/?preview=title`) so it runs offline. That inner deck shares
  the preview deck id, so until the runtime skips the sync inside an iframe, a click in it moves the outer deck too.
- A dead address costs one failed request and one console error (the probe); the audit reports them on that slide.
