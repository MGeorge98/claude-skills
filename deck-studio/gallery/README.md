# Gallery: reference decks

## MBV Summit deck (`~/Downloads/SPEECH/slide-uri`, 2026-10-08), the reference build

Seventeen slides presented on stage, Vite plus React, single-file `dist/index.html` that opens offline. Keys and
hash navigation as in CONTRACT.md; steps reveal with space reserved (`R`); a real PDF embedded in a slide; a demo
slide where the speaker switched to the live app tab. `speech-deck-2026-10-08.png` shows slides 1, 2, 3, 5, 7, 9
and 12 at step 0; that sheet shows a client deck and stays out of the public repo.

| Slide pattern on stage | Kit type | Status |
|---|---|---|
| title with logos and date | `title` | wave 1 |
| rows of "haos" revealed one per click | `cascade-list` | wave 1 |
| chapter openers | `section` | wave 2 |
| the big number ("14 proiecte") | `big-number` | wave 2 |
| the AI quote | `quote` | wave 2 |
| Firmio screenshot with zoom-ins | `screenshot-zoom` | wave 2 |
| embedded PDF brief | `demo` (iframe) or `image-full` | wave 2 |
| closing with QR to the landing | `closing-qr` | wave 2 |

## Kit demo, every type (2026-10-08)

`kit-demo-2026-10-08-all-types-audit.png`: the audit sheet of a 14-slide deck with every type once, in talk order
(title, agenda, section, big-number, cascade-list, quote, two-up, image-full, screenshot-zoom, video, code,
timeline, demo, closing-qr), placeholder copy. Audit PASS at 1920 and 1280 on every slide and step, reduced
motion, no JS (prerendered document) and print; `deck.pdf` 14 pages. Built the same day as the skill, wave 2
by six agents (two types each), integrated and re-audited by the main session.
