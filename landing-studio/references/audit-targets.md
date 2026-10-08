# Audit targets

Run on a production build (`next build && next start`), headless Chromium. Numbers are relative
before/after measures on an unthrottled local machine, not field data; the owner's phone check is the
real one. Each row says which script measures it; rows marked **manual** have no script yet (do them by
eye or with the app's own e2e, and say so in the report).

Scripts and their real flags (`--help` on each):
- `audit.cjs [--config ls-audit.json] [--url URL] [--out audit] [--min-flick 8] [--scene SEL|index]`:
  profiles m (first viewport, touch), d (second viewport), rm (reduced motion), js (chunks blocked).
- `perf.cjs [--config ls-audit.json] [--url URL] [--idle-sel SEL] [--baseline perf-baseline.json]`:
  390x844 DPR3 touch, thresholds from `ls-audit.json` `perf` (defaults below).
- `gate.cjs [dir=src] [--facts facts.md] [--banned banned.txt] [--strict]`: source text, not the rendered page.
- `kit/backend/preview/render-email.mjs` (run from the app root): `preview-out/email-{640,390}-{light,dark,invert}.png`.

| Check | Target | Script, how | Provenance |
|---|---|---|---|
| Console | 0 `pageerror`, 0 console errors (a failed request logs one) | audit m, d, rm | every contract |
| scrollWidth | equals `innerWidth` at both viewports | audit m, d, rm (after load) | SPEECH 402 px at 390; Twinproof check 2 |
| Fold boxes | every `hero.fields` selector ends inside the first viewport | audit m | SPEECH hook cut by fold |
| Hidden after scroll | 0 `[data-rv]:not(.in)` after a glide to the bottom | audit m, d | Vello reduced-motion check; template opacity traps |
| Scene frames | at each `frames` value, scene `--p` within .03 of it; one shot per frame | audit m, d | SPEECH frame sheets |
| Flick | >= 8 distinct `--p` states (delta > .02) in a 2 s scroll through each scene | audit m, d (`minFlick`) | SPEECH cascade skipped on flick; healthy 38 to 47 |
| Reduced motion | every `[data-rv]` opacity >= .99 | audit rm | Vello quiet modes |
| JS blocked | every `[data-rv]` visible at 3.9 s (failsafe 3.5 s) | audit js | CONTRACT failsafe |
| Scroll paints | <= 120 per scene in a 2 s scroll at 390 | perf (`scrollPaintsPerScene`) | ~2x a healthy scene; SPEECH brand pour painted 487 |
| Layouts during scroll | <= 30 per scene | perf (`layouts`) | SPEECH healthy scenes 1 to 7 |
| Long frames | <= 8 frames over 50 ms per scene | perf (`longFrames`) | Vello §5 |
| Idle paints | <= 3 in 2 s parked at the first scene's end | perf (`idlePaints`) | SPEECH hero loops; Vello idle 0 writes |
| CLS | <= .02, load plus every scene scroll (no input) | perf (`cls`) | Vello and Twinproof `perf.spec.ts`; the house uses .02 |
| LCP | <= 2500 ms unthrottled (smoke test); <= 2500 ms throttled (Lighthouse mobile: 1.6 Mbps, 150 ms RTT, CPU x4, cache off; lower it per project, never raise) | perf (`lcpMs`, `lcpThrottledMs`) | Vello, getdapost, Twinproof perf gates |
| JS ceiling | encoded `/_next/static/chunks/*.js` on load <= `perf-baseline.json` x 1.15; first run writes the baseline; **never raised** | perf (`jsGrowth`) | Vello (590,000 home), getdapost (174,000) |
| Em dash, placeholders, fake urgency | 0 | gate (fails) | repo rule 6 |
| Facts | 0 unsourced capitalised names / 2+ digit numbers / % in `src` strings | gate `--facts` (warns; `--strict` fails) | repo rule 1 |
| Email | readable in light, dark, inverted; logos on dark pills visible in all three | render-email.mjs shots, looked at | SPEECH Gmail iOS inversion |
| Sheets | every frame of `audit/sheet.png` looked at, one line per frame in the report | you | house rule "look at every sheet" |
| Scene shift, per-frame beat delta, LoAF at 1440, floating CTA overlap, contrast, head CSS weight | targets as in Vello / Twinproof (scene shift <= .001, beat delta < .08, 0 LoAF, no overlap, 7:1 / 4.5:1) | **manual** | Vello §5, Twinproof check 5, getdapost 2026-10-01 |

A failing check names the scene. Only that scene is regenerated; frozen scenes are not touched.
Never raise a threshold to make a red run green.
