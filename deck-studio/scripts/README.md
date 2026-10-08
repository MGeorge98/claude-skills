# deck-studio scripts

All scripts resolve Playwright through `PW_PATH`, then `NODE_PATH`, then `./node_modules`, then
`/Users/novamatter/GitHub/Landing Page Portfolio/getdapost/node_modules` (`lib.cjs`). Run them against the built deck:
```
npm run build && npx vite preview --port 5190 < /dev/null &
export PW_PATH="/Users/novamatter/GitHub/Landing Page Portfolio/getdapost/node_modules"
```

## audit.cjs
`node audit.cjs --url http://localhost:5190/ [--out audit] [--slide n] [--strict] [--words 40]`

Per slide, per step, at 1920x1080 and 1280x720 (stepping with `window.__deck.next()` after a fresh load at `#n`,
waiting for every finite animation and transition to finish):
| check | fails when |
|---|---|
| console and network | any console error, page error, failed request or HTTP >= 400 during the slide |
| deep link and hash | the load at `#n` does not land on slide n, step 0; the hash after a step is not `#n.k` (or `#n` at 0) |
| current | `.is-current` is not on exactly this slide |
| step count | `data-steps` differs from the highest `[data-step]` |
| gating | the set of `.in` steps differs from `at <= k` (swap groups: newest member only) |
| back | `prev()` from the final step down to 0 gives a different `.in` set than the way forward |
| stage box | a visible element (not inside a hidden step) has a rect outside the scaled stage rect, 1px tolerance |
| scale | the stage scale differs from `min(w/1920, h/1080)` by more than 0.01 |
| words | over `--words` (40) at the final step, counted from the slide's `innerText`: warning; `--strict`: failure |

Profiles: **reduced motion** (`reducedMotion: 'reduce'`, 1920): `html.rm` set, zero entries in
`document.getAnimations()` after each step, `.in` steps at opacity 1 and the rest at 0, gating as above.
**No JS** (`javaScriptEnabled: false`, 1280x800): `html` has no `js`, every slide is in the document, displayed,
has text, every step fully visible, no horizontal scroll. **Print** (`?print`, 1920): every slide box 1920x1080,
every step `.in`, no hud, a PDF of exactly N pages with 1440x810 pt (1920x1080 px) media boxes, no errors.

Output in `--out`: `<nn>-s<k>-<1920|1280>.png` for every step, `<nn>-s<N>-rm.png`, `nojs.png` (full page),
`report.json` (`slides`, `profiles`, `failures`, `warnings`), `sheet.png` (one row per slide: step 0 at 1920, final at
1920, final at 1280, final under rm). `--slide n` audits one slide at both sizes and rm, skips the no-JS and print
profiles and writes `sheet-<nn>.png`. Exit 1 on any failure. Look at the sheet: every automated check here has
passed a blank slide at least once.

## export.cjs
`node export.cjs --url http://localhost:5190/ [--out .]`: loads `?print`, waits for `deck-ready`, fonts and images,
writes `<out>/deck.pdf` (one 1920x1080 px page per slide, backgrounds printed) and `<out>/slides/<nn>.png`
(element screenshots of each section). Exit 1 if the page count differs from the slide count or the console errored.
Open the PDF (or `pdftoppm -r 40 -png deck.pdf p` and read the PNGs).

## gate.cjs
`node gate.cjs src --facts facts.md [--banned banned.txt] [--strict]`: em dashes, placeholders, fake urgency, banned
words fail; numbers and capitalised names in copy that are missing from `facts.md` are warnings (`--strict` fails).
Expect `UNSOURCED` warnings on the kit's own "Exemplu" copy until `src/deck.tsx` is written from facts.

## sheet.cjs
`node sheet.cjs <folder> [--out sheet.png] [--cols 6] [--w 240] [--title text]`: a labelled contact sheet of every
PNG/JPG in a folder. Also `require('./sheet.cjs').buildSheet(browser, files, out, opts)`.
