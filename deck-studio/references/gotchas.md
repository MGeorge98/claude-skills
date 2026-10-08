# Gotchas: symptom → cause → rule (seeded from the MBV Summit deck, 2026-10-08, and the landing-studio builds)

1. **A slide looks different on the projector** → the layout used viewport units → design at 1920x1080 px, let the
   runtime scale the stage; never `vw`/`vh` inside a slide.
2. **Elements jump when a step appears** → the hidden step had `display: none` → opacity and transform only, the
   box is reserved (`R` in the SPEECH deck did this).
3. **Click on the stage skips a slide during a demo** → the iframe or PDF viewer ate the click, then the stage got it
   → `data-no-nav` on embeds; the next click outside the embed navigates.
4. **The demo tab lost the deck position** → no hash → `#n.k` written on every move; refresh lands on the same step.
5. **Fonts swap on stage with no internet** → webfonts from a CDN → `@fontsource` packages, local, in the bundle.
6. **Videos autoplay with sound or not at all** → autoplay policy → muted, playsInline, poster, play on enter.
7. **The PDF shows the first step only** → export at the live route → `?print` renders every step in.
8. **A 320px number clips at the top** → line-height 1 on a glyph with ascenders → `line-height: .92` and
   `padding-top` on big numbers; audit the rect.
9. **Presenter window and stage drift apart** → two sources of truth → one state, BroadcastChannel, either
   window drives.
10. **Em dash in a quote from the deck draft** → the gate fails → quotes are copied from facts.md, which has none.
11. **Reveal never fires on a clipped element** → `clip-path` on the observed element (landing-studio) → not an
    issue here (steps are state-driven), but keep clip reveals on children for the mask variants.
12. **A tracked-out kicker wraps** → letter-spacing on a long mono line → under 32 characters, or two lines by design.
