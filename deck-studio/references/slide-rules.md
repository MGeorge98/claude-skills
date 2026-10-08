# Slide rules (acceptance per slide, at step 0 and at the final step, 1920x1080 and 1280x720)

1. Zero console errors, zero failed requests after a reload at `/#<n>`.
2. Nothing outside the stage box: every element's rect inside 0..1920 x 0..1080 (audit checks it).
3. Under 40 words visible at the final step (title, body, captions), unless `brief.md` allows more for this slide.
4. The title states the point; a reader of the PDF alone understands the slide.
5. Steps: `data-steps` equals the highest `[data-step]` value (`at={0}` steps enter with the slide); step k shows exactly the elements with
   `at <= k`; going back reproduces the earlier frame; nothing moves when a step enters (space reserved).
6. Reduced motion: final frame identical, no transition. No JS: the slide is readable in the stacked document.
7. Transforms, opacity, clip-path only; no transform rests above scale 1; no `will-change` outside transitions.
8. Contrast: body 7:1 on its ground, captions and kickers 4.5:1; text never over a busy image without a scrim.
9. Media: images with width and height, local; videos muted with a poster; iframes with a fallback.
10. Facts: every number, name, quote and logo maps to a `facts.md` line with status verified.
11. `grep -rn $'\u2014'` on the slide folder: zero. No clichés (`cliches.md`).
12. Presenter notes present for every slide that is spoken over (1 to 3 lines), none for pure dividers.
13. Sheet: the agent looked at its own frames (step 0, final step, rm) and says what each shows.
