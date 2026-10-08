# Gallery: reference builds

## MBV Summit QR page (`~/Downloads/SPEECH`, 2026-10-08), the reference build

The page people reached from the QR code on stage at MBV Summit: leave name, email and phone, get the
agent by email, then read the story. Run it with `npm run dev` on port 3040 (read only: do not edit it).
Contact sheets of that day (`speech-2026-10-08-m.png`, `speech-2026-10-08-d.png`) are kept out of the public repo: they show a client page.

| # | Section on the page (`src/app/page.tsx`) | Kit scene | Status in the kit |
|---|---|---|---|
| 1 | Hero: logos, kicker, word-mask headline, form on the right, agent card under the headline, network backdrop (`HeroScene.tsx`) | `hero-words` (split mode, `right` = form, `below` = card, `NetworkBackdrop`) + `form-popup` | v1 |
| 2 | Traseu: four steps on a drawn line, smallest to biggest | `journey-path` | v2 (ported 2026-10-08) |
| 3 | De mâine: three cards dealt onto a pile, pinned (`[data-deal]`) | `dealt-cards` | v2 (ported 2026-10-08) |
| 4 | Povestea: five beats on one pinned screen with a progress bar | `pinned-beats` | v1 |
| 5 | Firmio: the page pours into the guest brand and back | `brand-pour` | v1 (paints cut from ~487 to ~63 per 2s scroll at 390) |
| 6 | Cine sunt: portrait hero (`AboutHero.tsx`) | `portrait-hero` | v2 (ported 2026-10-08) |
| 7 | Proiecte: project shots collage (`ProjectsSet.tsx`) | `set-collage` | v2 (ported 2026-10-08) |
| 8 | Footer: company, terms, privacy | none (plain markup) | |
| - | Agent card dock (`git show 351c8dd`), removed before ship | `drop-dock` | v2 (ported 2026-10-08) |

## Kit demo (integrator, 2026-10-08)

Sections 1, 4 and 5 rebuilt from the kit alone, the rest left out: `kit-demo-2026-10-08-audit.png` is its
`audit.cjs` sheet (d and m frames of both pinned scenes, folds for m, d, rm and js-blocked). Results: build
clean, audit PASS on all four profiles (flick 41 to 46 states), perf PASS (pinned-beats 64 paints,
brand-pour 63, idle 0, CLS 0, JS 115,468 B), gate 0 failures and 0 unsourced against its facts ledger.

## Kit v2 scenes (2026-10-08)

The six v2 scenes (drop-dock, dealt-cards, journey-path, portrait-hero, set-collage, intro-sequence) were ported
from the pages above, one agent per scene, each checked alone at `/preview/<name>` at 390x844 and 1440x900:
audit.cjs PASS on all four profiles, perf.cjs PASS (dealt-cards 4 paints per 2 s scroll, idle 0, CLS 0 everywhere).
`kit-v2-2026-10-08-dealt-cards-audit.png` is the audit sheet of the pinned one. The flow scenes have no audit frames
(audit.cjs frames pinned scenes only): their entrances were checked from hand-shot frames at 0 to 1400 ms.

The same day the brand-pour paint fix went back to the live SPEECH page on branch `perf/firmio-paints` (53fde9c,
not pushed): Firmio paints per 2 s scroll at 390 dropped from 492 to 41 to 50; the owner merges and deploys.

## Kit v3 scenes (2026-10-08, same day)

Six scenes with no page to port from, built from written specs: sticky-split, horizontal-pinned (pinned),
before-after, timeline, number-wall, logo-marquee (flow). Same method as v2, ports 3071 to 3076. Audit PASS on all
four profiles for every preview; perf PASS (sticky-split 9 paints per 2 s scroll, horizontal-pinned 2, idle 0, CLS 0).
Sheets of the pinned ones: `kit-v3-2026-10-08-sticky-split-audit.png`, `kit-v3-2026-10-08-horizontal-pinned-audit.png`.
Found from the frames, not from the reports: before-after shipped with its corner labels inverted against the images
(the agent's own report described the frame and did not notice); sent back and fixed.

Also that day: `perf.cjs` measures LCP under the Lighthouse mobile profile (1.6 Mbps, 150 ms RTT, CPU x4), threshold
2500 ms. The demo hero measured 2868 ms: not the JS chunk, the hero choreography (lead at 1450 ms plus a 900 ms fade;
Chrome records a fading element when the fade ends). The hero timing was compressed (lead 800) and the demo reads
1364 ms throttled. The opacity .01 trick that games the metric was declined.
