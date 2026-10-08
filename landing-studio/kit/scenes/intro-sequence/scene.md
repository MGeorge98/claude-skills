# intro-sequence

A short timed intro painted over the page's first scene: a logo draws as an SVG stroke, the wordmark rises word by
word out of masks, a mono label fades up, then the curtain lifts (one accent hairline on its lower edge). The page
underneath is already rendered and painted the whole time, so LCP and layout never wait for it.

## When to use
Brand-led openers where a 1.2 to 2 s beat of identity is worth it (launch pages, a studio, a product reveal). Not for
QR or ad traffic that wants the form now: that page should open on hero-words. One per page, mounted before the
first scene (`<IntroSequence .../><HeroWords .../>`).

## Props
| name | type | default | drives |
|---|---|---|---|
| `wordmark` | string | required | the big line, split into word masks (SplitWords, 70 ms apart, from 30% of the duration) |
| `logo` | string or ReactNode | none | a string is an SVG path `d` in a 64 x 64 box, drawn as a stroke with a soft accent fill after; a node is rendered as is (give its strokes `pathLength="1"` so the draw works) |
| `duration` | number (ms) | 1600 | the whole intro, clamped to 1200..2000 |
| `label` | string | none | small mono line under the wordmark |
| `id` | string | `"intro"` | element id and the sessionStorage key `ls-intro:<id>` |

Timeline as fractions of `duration`: logo stroke .04 to .49, fill .40 to .60, words from .30 (each .40 long), label
.45 to .75, contents leave .70 to .88, curtain lifts .72 to 1.00 and ends `visibility: hidden`; the script then sets
`display: none`. Not pinned, no `--len`.

## Copy slots
wordmark (1 to 4 words, the brand name as it is written), label (max ~40 chars, a fact from facts.md or nothing),
logo (the brand's own mark as a path, or a neutral shape; never another company's mark).

## Behaviour
- Skip: pointerdown, keydown, wheel or touchmove before the lift starts sends the curtain up in 60% of the lift time
  (the exit twin); after the lift has started a skip just lets it finish.
- Never replays in the session: the inline script sets `ls-intro:<id>` in sessionStorage on the first run; a second
  load hides the overlay before the first paint (the script runs while the document parses, right after the overlay).
- Scroll is not locked; the overlay is `position: fixed` (CLS 0).
- The script lives in `dangerouslySetInnerHTML` (same pattern as the getdapost hero), so React never diffs or re-runs
  it; the overlay carries `suppressHydrationWarning` because the script adds classes before hydration.

## Mobile
Same scene: logo 56 px (72 px from 820), wordmark clamp(34px, 9.4vw, 76px), balanced wrap, side gutter `--gut`.
Long wordmarks wrap to two lines; nothing is cut at 390x844.

## Reduced motion / no JS / failsafe
The overlay is `display: none` unless `html.js:not(.rm):not(.paused)`: no JS, reduced motion, Pause motion
(MotionToggle) and `ls-static` never show it, not even for a frame. The lift is pure CSS and ends at `duration`
whether or not the script or the engine runs; a second animation (`intro-sequence-failsafe`, at `--ls-failsafe`)
hides it in any case. With `/_next/static/chunks/*` blocked the intro plays (inline script and CSS) and is gone by
1.6 s.

## Composition notes
- The first scene's own entrance (hero-words keyframes, `[data-rv]`) plays under the curtain: with the default
  1600 ms the placeholder's reveals are done by about 800 ms, before the lift at 1150 ms. A hero whose choreography
  should play after the lift needs its own delays (hero-words `timing`) pushed by about `duration`.
- LCP: the overlay is not the LCP candidate (its words start inside their masks); the first scene's headline is, and
  it paints at the first frame under the curtain. Keep the first scene's LCP element off `opacity: 0` (gotcha 16).
- Client-side navigation to a page with the intro (not a full load) does not run the inline script: the CSS still
  plays it and lifts it at `duration`; skip and the session flag do not apply there.

## Verification frames (preview, default 1600 ms)
- 0 ms: opaque `--bg` curtain, logo stroke starting.
- 300 ms: logo partly drawn.
- 800 ms: logo with fill, wordmark up, label, hairline across the bottom.
- 1300 ms: curtain about 80 px up, contents fading out, page visible under the hairline.
- 1900 ms: overlay `display: none`, the first scene settled.
- Second load in the same tab: no overlay at the first frame. Click at 200 ms: gone by about 560 ms.
  Reduced motion and JS disabled: no overlay at all. Chunks blocked: gone by 3.9 s (in fact at 1.6 s).

## Gotchas
- Every hidden state here is inside a keyframe and only while the overlay exists; the overlay itself is the only thing
  that hides the page, and both its own lift and the failsafe end it.
- The lift is a translate of a full-screen fixed layer, never a scale (promoted layers scale down, never up); the
  hairline grows with scaleX from 0 to 1.
- Do not put a reveal on the first scene's LCP element expecting the curtain to hide it: it is measured anyway.
