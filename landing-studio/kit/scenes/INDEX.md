# Scene catalog

Each scene lives in `kit/scenes/<name>/` with `scene.md`, `<Name>.tsx`, `<name>.css` (classes prefixed
`.<name>-`), `data.example.ts` (Exemplu copy) and `preview.tsx` (the scene with its example data, mounted by
`sync-kit.sh` at `/preview/<name>`). In the app: `src/scenes/<name>/`. Scenes target CONTRACT.md; pinned scenes
need the engine (their pinned layout gates on `html.mo`).

| name | one line | typical `--len` | mobile note | status |
|---|---|---|---|---|
| `hero-words` | First screen: word-mask headline, kicker, lead, CTAs, optional network backdrop and right column (form). | not pinned (min 100svh) | one column: head, form, below; 9 of 16 network nodes; the form keeps the hero tall, the net watches itself | v1 |
| `pinned-beats` | Story on one pinned screen: big number, lines revealed row by row, statements, closing quote, progress bar. | 320vh / 380vh from 820px (5 beats) | same scene, smaller type; tallest beat (quote) must fit 844px | v1 |
| `brand-pour` | Pinned chapter where the page pours into a guest brand, shows intro / items / stack / thesis, and pours back. | 470vh / 560vh from 820px | 12 columns instead of 24, screenshot under the copy, items stack and dim; <= 120 paints per 2s at 390 (demo: 63) | v1 |
| `form-popup` | Lead form with config fields, honeypot, server error mapping, success card and confirmation dialog. | not pinned | full width card, 16px inputs, 44px+ rows; dialog `min(100%, 460px)` | v1 |
| `drop-dock` | Items thrown from off-screen corners into a named container: counter ticks, shake and `.snap`; starts once at 40% visibility, final state when jumped past. | not pinned | one column of 64px rows; from 820px min(n, 3) columns | v2 |
| `dealt-cards` | Heading plus 3 cards dealt onto a pinned table; each lands tilted and nudges the pile, shadow follows the landed count. | 253vh / 276vh from 820px | drop .4vh instead of .6vh, pile under the heading; at p=0 a dashed slot keeps the stage from reading empty | v2 |
| `journey-path` | 3 to 5 steps on a line drawn segment by segment, dots spring, cards rise; the last step is the hero card (guest accent via prop). | not pinned | one column below 761px with a scaleY line; side by side above with scaleX | v2 |
| `portrait-hero` | Large clip-revealed portrait, name and role in word masks, up to 6 bio lines and a link row; `flip` swaps the columns. | not pinned (min 100svh from 820px) | one column, portrait first, capped at min(52svh, 440px), natural height | v2 |
| `set-collage` | 3 to 7 project shots in a fixed grid that opens by clip on reveal, mono captions, each links out. | not pinned | two columns, first shot full width, square cells | v2 |
| `intro-sequence` | Fixed curtain over the first scene: logo stroke draws, wordmark words rise, curtain lifts; skippable, once per session; the first scene's reveals should be delayed by about `duration`. | not pinned (1200 to 2000 ms) | same scene, logo 56px, wordmark wraps at 390 | v2 |
| `sticky-split` | Pinned split: sticky media panel (48%, `flip` for the right side) cross-fading per beat, text beats beside it, progress dots. | 300vh / 360vh from 820px (4 beats) | panel on top at 40svh, beats below; tallest beat must fit 844px | v3 |
| `horizontal-pinned` | Pinned chapter: heading, counter and bar over a card row that glides in X as a pure function of `--p`; the card in focus scales to 1. | 460vh / 400vh from 820px (5 cards) | 72vw cards with neighbours peeking; column without the engine | v3 |
| `before-after` | Two same-size images with a native range slider that opens from 0% to 50% on reveal; mono corner labels. | not pinned | full width, 44px control band, vertical scroll still works over it | v3 |
| `timeline` | Vertical spine of 4 to 10 entries, each revealing on scroll; segments draw between dots, dots spring and fill. | not pinned | left spine, one column; centre alternating from 761px | v3 |
| `number-wall` | 3 to 6 big count-up numbers with caption and mono source note, tiles laddered on reveal; every number must map to an F-id. | not pinned | 2 columns, first tile full width if odd, numbers sized to the tile | v3 |
| `logo-marquee` | Seamless looping strip of third-party logos with a mono kicker; paused off screen, on hover and under the toggle; still wrapped row under rm. | not pinned | logos 26px, same loop, edges fade over 12%; use at least 6 logos | v3 |

## v2 specs (ported 2026-10-08; kept as the behaviour reference)

**drop-dock** (source: SPEECH `git show 351c8dd:src/app/page.tsx`, Motion.tsx `[data-drop]`)
Container `[data-drop]` with `[data-ctr]` counter; items enter from off-screen corners via WAAPI (spring, 680ms,
landings 60/280/500ms), counter ticks at 60% of each landing, container shakes 180ms and gets `.snap`.
Starts once at 40% visibility; skipped straight to final if the user jumped past; failsafe 3.5s after start.

**dealt-cards** (source: SPEECH "De mâine" `[data-deal]`, `[data-deal-sh]`)
Pinned 253vh / 276vh; card i owns window [i x .33, i x .33 + .3], lands with ease-out-back from (22vw, 60vh,
18deg) to its resting tilt; cards above nudge it down 18px and scale .97; shadow opacity follows landed count.

**journey-path** (source: SPEECH "Traseu" `[data-rv=path]`)
Ordered list on a line drawn segment by segment (scaleY mobile / scaleX desktop, 160ms stagger), dots pop with a
spring, cards rise; the last step is the hero card (bigger, guest colour) and lands at 680ms with a spring.

**portrait-hero** (source: Vello landing)
Large portrait with a masked reveal, name and role in word masks, short bio lines staggered; author at final size
and scale from .2 to 1 (promoted layers scale down, never up).

**set-collage** (source: SPEECH ProjectsSet.tsx / projects-set.css)
3 to 7 project shots in a fixed collage grid that assembles on reveal (clip reveals on children, never on the
observed element), captions in mono, each shot links out.

**intro-sequence** (source: getdapost hero boot)
A 1.2 to 2s timed intro (logo draw, wordmark, curtain) painted under an opaque overlay so LCP content is already
there; skippable, never replays in the session, off under `html.rm`.
