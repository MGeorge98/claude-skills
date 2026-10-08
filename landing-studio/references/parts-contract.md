# Parts contract (parallel authorship)

Merged from getdapost (`getdapost/ops/LANDING-PARTS-CONTRACT.md`), Twinproof v3
(`vera/landing/rebrand/v3/PARTS-CONTRACT.md`) and the SPEECH clone-per-agent practice. The kit
contract (`CONTRACT.md`) is frozen; this file says who writes what during Phase 5.

## 1. Ownership

| Who | Writes | Port |
|---|---|---|
| Integrator (main session or one Opus agent) | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/styles/tokens.css`, backend, `next.config.ts`, git | 3050 |
| Reference scene agent (Opus) | `src/scenes/<ref>/`, `src/app/preview/<ref>/` | 3051 |
| Scene agent n (Sonnet) | `src/scenes/<name>/`, `src/app/preview/<name>/` | 3051 + n |
| Nobody in a wave | `kit/**`, `src/kit/**`, `src/styles/motion.css`, `facts.md`, `brief.md`, `storyboard.md`, other scenes | |

- One writer per file. A scene agent that needs a kit or token change writes it as a note in its
  report; the integrator applies it after the wave.
- A scene folder holds `scene.md` (what it is, N for the reveal count, `--len` tested), `<Name>.tsx`,
  `<name>.css`, optional `data.ts`. Copy lives in `data.ts` as quotes of `facts.md` lines, each with
  its F-id in a comment.
- Every selector is scoped under `.<name>-` classes. No bare element selectors, no `:root`, no `body`.
- The scene's CSS holds base (final state), the `html.js:not(.rm)` running state (reveals; pinned layouts and engine-driven states under `html.mo:not(.rm)`), its
  `@media (max-width: 760px)` block placed after the base rules it overrides, and nothing else.
- Use brand tokens only (`--bg --ink --ink-2 --muted --accent --accent-2 --line`) and kit tokens
  (`--ls-*`). No literal colours, no brand colours of third parties, platform names as plain text.

## 2. Clones and ports

```
cp -Rc "$APP" "$TMP/<name>"            # APFS clone incl. node_modules; never symlink node_modules
cd "$TMP/<name>" && npx next build && npx next start -p <port>
```
- Never the integrator's port, never a port another agent holds, never the owner's dev server.
- Scratch scripts and screenshots go to `$TMP/<name>/.shots/` with unique names.
- Run tests in the foreground with a timeout; never a `pgrep -f` wait loop. Stop your server.
- The integrator copies back only `src/scenes/<name>/` and `src/app/preview/<name>/` from each clone.

## 3. Preview route

`src/app/preview/<name>/page.tsx` (generated once by `sync-kit.sh` from the scene's `preview.tsx`) renders the scene alone between two `100svh` spacers, with the kit's
`Motion` mount, so pins enter and leave as on the page. Add `?rm=1` handling only through the boot
script (it reads the media query; emulate reduced motion in playwright instead).

## 4. Acceptance checklist per scene (all items, at 390x844 and 1440x900)

1. Zero console errors and zero failed requests, on `next start`, after a full reload.
2. `document.documentElement.scrollWidth === clientWidth`.
3. Ten steps through p (0, .1 ... 1): revealed count rises 0 to N monotonically, and an earlier p
   reproduces the earlier state exactly (scroll back and compare).
4. First frame at p=0 shows the first group (no empty stage).
5. Flick test: a 1.2 s wheel flick through the pin shows each beat in at least 8 frames.
6. Quiet modes: JS off, reduced motion, and the failsafe (block `/_next/static/chunks/*`) each render
   the whole scene; nothing computes to `opacity: 0`.
7. No transform rests at a scale above 1. `will-change` only under `.live`.
8. Infinite loops pause off-screen: idle paints in 2 s with the scene out of view are 0.
9. Contrast: body 7:1 on its ground, captions and kickers 4.5:1.
10. Fold: any hook or CTA in this scene that is meant to be visible on arrival sits fully inside the
    viewport box.
11. `grep -rn $'\u2014'` (the em dash) on the scene folder: zero. No banned clichés (`cliches.md`).
12. Facts: every number, name and claim in the rendered text maps to an F-id in `facts.md` with
    status `verified`. Examples labelled "Exemplu" if a placeholder is unavoidable.
13. Sheets: the agent looked at its own contact sheet (390 and 1440, three scroll points each, plus
    reduced motion) and says what each frame shows.

## 5. Handover line

One line per scene: what it is, N for the reveal count, `--len` tested, which ground it needs at its
top and bottom edges (so the integrator can join seams), notes for kit or token changes.

## 6. Integrator after each wave

Copy scenes back, wire `src/app/page.tsx` in storyboard order, check every seam (background, first frame,
floating CTA visibility), run `scripts/audit.cjs` on the whole page, commit with a pathspec:
`git add <app>/src/scenes/<a> <app>/src/scenes/<b> <app>/src/app/page.tsx`. Never `git add -A`.
