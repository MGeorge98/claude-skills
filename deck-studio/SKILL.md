---
name: deck-studio
description: >-
  Orchestrator playbook plus a code kit for a web deck a speaker would present from: one Vite app, one
  URL, keys and clicks, steps inside slides, a presenter window with notes and a timer, a PDF export,
  built from a catalogue of slide types on a 1920x1080 stage, every claim traced to a facts ledger, and
  verified by an audit script (overflow, step counts, console, reduced motion, no JS, em dash gate) plus
  contact sheets you look at. Use when the user says "fă-mi o prezentare", "slide-uri pentru", "deck
  pentru speech / pitch / workshop", "prezentare web", "deck web", "slides for this talk", or wants a
  presentation that runs in the browser and exports to PDF. Not for .pptx (use the pptx skill).
---

# Deck Studio

Goal: one talk, one deck, slides that each make one point, presented from a URL with no surprises, with a
PDF for the organisers. The method: **brief, facts, outline, one tone direction, one reference slide, fan
out, audit from pixels, rehearse, ship through the owner.** Reference build: the MBV Summit deck
(`~/Downloads/SPEECH/slide-uri`, 2026-10-08; see `gallery/README.md`).

Language: this playbook is English; the deck's language follows the request ("fă-mi..." means Romanian
with full diacritics). Set `<html lang>`.

Files in this skill:
- `CONTRACT.md`: stage, steps, navigation, presenter, print, tokens, slide type shape. Agents read it.
- `kit/runtime/`, `kit/react/`, `kit/css/`: the deck runtime and its CSS (`kit/README.md`);
  `kit/slides/<type>/` with `kit/slides/INDEX.md` (the catalogue); `kit/app-template/` and `sync-kit.sh`.
- `scripts/audit.cjs`, `scripts/export.cjs`, `scripts/gate.cjs`, `scripts/sheet.cjs` (`scripts/README.md`).
- `references/`: `brief-template.md`, `facts-ledger.md`, `outline-template.md`, `tone-directions.md`,
  `slide-rules.md`, `gotchas.md`, `cliches.md`, `handoff-template.md`.
- `gallery/README.md`: reference decks with their sheets.

## When to use
- A talk, a pitch, a workshop, a demo day, a lecture: something presented live or sent as a link.
- Not for: .pptx deliverables (pptx skill), a page people scroll (landing-studio), a document (docs).

## Fixed decisions (write them into `brief.md`; agents obey them)
- **Every fact traces to a source line** in `facts.md`. INFERRED lines never ship. No invented numbers,
  logos, quotes, dates. Third-party logos never recoloured.
- **One point per slide.** Title says the point, not the topic ("Un singur blocker: tu", not "Context").
  Under 40 words on a slide. If a slide needs more, it is two slides.
- **Steps reveal, they never rearrange.** Space is reserved; nothing jumps. Max 6 steps per slide.
- **No em dashes anywhere.** Human voice, no clichés (`references/cliches.md`).
- **The deck works without motion and without JS** (stacked readable document) and prints to PDF with
  every step in.
- **The stage is 1920 x 1080**; design at that size, the runtime scales it. Font sizes in px.
- **Nothing outward by an agent**: no deploy, no sending, no push, no env.

## Phases

Model routing: **Opus** for facts, outline, the reference slide, integration and the final LOOK;
**Sonnet** for brand ingest, scaffold, slide fan-out, audit runs and fixes with a clear finding.

| Phase | Who | What | Done means |
|---|---|---|---|
| 0 Brief | you | `brief.md`: audience, room (projector? laptop? sent as link?), length in minutes, the one thing people must remember, the one action at the end, sources, language | the owner read it |
| 1 Facts | Opus | `facts.md` per `references/facts-ledger.md` | every line sourced, INFERRED flagged |
| 2 Brand | Sonnet | `tokens.css` values, logo as SVG, fonts local (`@fontsource`), one glow or texture if the brand has it | contrast checked on the stage (body 7:1) |
| 3 Outline | Opus | `outline.md` per `references/outline-template.md`: slide list with type, point, F-ids, steps, notes; about 1 slide per minute, under 1.5; three **tone directions** per `references/tone-directions.md` (rhythm, density, imagery), not three palettes | the owner picks a direction and edits the outline |
| ✋ | owner | picks the direction, edits points and order | written into `outline.md` |
| 4 Scaffold | Sonnet | commands below; `src/deck.tsx` from the outline with every slide as a placeholder of its type and its notes | `npm run build` clean, the deck navigates end to end with placeholders |
| 5 Build | Opus ref + Sonnet fan-out | the hardest slide first (usually the demo or a zoom), then one agent per group of slides of the same type, each in its own clone and port; new slide types go back into the skill | each slide passes `references/slide-rules.md` at its final step and at step 0 |
| 6 Audit | you + Sonnet fixes | `scripts/audit.cjs`, `scripts/export.cjs`, `scripts/gate.cjs`; look at `audit/sheet.png` and `deck.pdf` | audit PASS, pdf opened and read, no slide over 40 words unless the owner said so |
| 7 Rehearse | owner, you watch | the owner clicks through once from the real URL in the real browser with the presenter window open; you note every hesitation | the list of fixes is empty or applied |
| 8 Ship | you | commit per wave with a pathspec, handoff from `references/handoff-template.md` | owner-only commands handed over |

### Phase 4: scaffold commands
```
SK=~/.claude/skills/deck-studio; APP=<repo>/<slug>           # brief.md, facts.md, outline.md already in $APP
mkdir -p "$APP" && cp -R "$SK/kit/app-template/." "$APP/" && rm "$APP/sync-kit.sh"
"$SK/kit/app-template/sync-kit.sh" "$APP" --slides title,section,agenda,big-number,cascade-list   # any names in kit/slides/INDEX.md
cd "$APP" && npm install && xattr -dr com.apple.quarantine node_modules 2>/dev/null; npm run build
```
- `sync-kit.sh` lays out `src/kit/{runtime,react}`, `src/styles/{tokens,deck}.css`, `src/slides/<type>/` and a dev
  `src/preview-deck.tsx` made from every `data.example.ts` (one slide per type, in catalogue order), served at
  `/?preview`. Re-run after any kit fix; app-owned files (`tokens.css`, `deck.tsx`) are written only when missing.
- Brand: edit the brand block of `src/styles/tokens.css`; put the logo in `public/logo.svg`.
- `npm run dev` on port 5180 (`PORT=5181 npm run dev < /dev/null` to change); `npm run build` makes `dist/`
  (single file, opens by double click, works offline).

### Phase 5: build
- Reference slide first, Opus, to the full `references/slide-rules.md`. Its file is the example in every brief.
- Fan-out: one agent per group of slides of one type; each in its own clone (`cp -Rc "$APP" "$TMP/<group>"`,
  never a symlink) on its own port; off limits: `src/kit`, `src/styles`, `src/deck.tsx`, other groups.
  Each slide is checked alone at `/?preview#<n>` and inside the deck at `/#<n>`.
- The integrator writes `src/deck.tsx` (order, transitions, notes) and resolves seams: background handoffs
  between consecutive slides, a section divider before every chapter, the closing slide's QR and URL.

### Phase 6: audit
```
SK=~/.claude/skills/deck-studio; K=$SK/scripts
npm run build && npx vite preview --port 5190 < /dev/null &
node $K/audit.cjs --url http://localhost:5190/        # every slide, every step, 1920x1080 and 1280x720, rm, no-JS
node $K/export.cjs --url http://localhost:5190/       # deck.pdf + slides/<nn>.png
node $K/gate.cjs src --facts facts.md
```
**Look at `audit/sheet.png` and open `deck.pdf`.** Every automated check has passed a blank slide at least once.
Then the category audit: would this deck stand next to the three best talks in its field; name the gap or say none.

### Phase 7: rehearse
The owner presents once, for real, in the browser they will use, with `P` open on a second screen. You take notes:
a slide that needs explaining is a slide that failed. Fix, re-audit, re-export.

## Owner-only (hand over the exact commands)
- Deploy (`vercel deploy`, static hosting), domains, the QR printed on anything.
- Sending the PDF or the link to organisers or attendees.
- `git push`, unless asked for in this session.

## Sub-agent brief skeleton
```
Goal: <slide group, the point of each slide, why it matters to the talk>
Scope: you own src/slides/<type>/ and the slides <ids> in your clone <path>, port <51xx>.
  Off limits: src/kit, src/styles, src/deck.tsx, every other slide. Never git, deploy or send.
Known facts: CONTRACT.md; outline rows <n..m>; copy slots -> F-ids (quote facts.md exactly); tone direction <x>;
  reference slide <path>; three lines from gotchas.md that bite this type.
Done means: references/slide-rules.md, every item, at step 0 and at the final step, 1920x1080 and 1280x720;
  you looked at your sheet; server stopped.
Report in under 150 words: files, rule results (n/n), sheet path, open issues. No code.
```

## Done means
A speaker could walk on stage with it; the audit is green; the PDF reads on its own; you looked at every slide.

## Talking to the owner
1. After Phase 0: the brief, ten lines. 2. ✋ After Phase 3: three tone directions and the outline, your pick.
3. ✋ After Phase 6: the URL, the sheet, the PDF, the audit summary. 4. Rehearsal notes. 5. Handoff.
