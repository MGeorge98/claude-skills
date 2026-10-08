---
name: landing-studio
description: >-
  Orchestrator playbook for a story-driven landing page that a brand team would ship: a Next.js 15
  app built from this skill's kit (attribute-driven motion engine, pinned scroll scenes, word masks,
  brand cascades), with a lead API and a branded confirmation email, every claim traced to a facts
  ledger, and verified by audit scripts (fold, scrollWidth, flick, paints, CLS, LCP, JS ceiling, facts
  gate) plus contact sheets you look at. Use when the user says "fă-mi un landing", "landing page cu
  poveste", "pagină de prezentare", "landing breathtaking", "scroll storytelling", "pagina din QR",
  "landing for this event / deck / product", "a page people land on from the QR code", or asks for a
  scroll-animated one-pager with a form.
---

# Landing Studio

Goal: one page, one action, told as a story in scenes, with zero visual bugs and zero invented facts.
The method is: **brief, facts, brand, storyboard, one reference scene, fan out, audit from pixels, ship
through the owner.** Reference build: the MBV Summit QR page (`~/Downloads/SPEECH`, 2026-10-08).

Language: this playbook is English; the **page's language** comes from the request or the source
deck ("fă-mi..." means Romanian copy with full diacritics). Set `<html lang>`.

Files in this skill:
- `CONTRACT.md`: the kit contract (boot classes, `[data-rv]`, `[data-scene]` and `--p`, tokens, prefixes). Agents read it.
- `kit/engine/`, `kit/css/`, `kit/react/`: the motion engine and its CSS (`kit/README.md`); `kit/scenes/<name>/` with
  `kit/scenes/INDEX.md` (the scene catalogue); `kit/backend/` (lead API, email, `.env.example`);
  `kit/app-template/` (Next.js 15 shell with the boot script) and its `sync-kit.sh`.
- `scripts/audit.cjs`, `scripts/perf.cjs`, `scripts/gate.cjs`: the audit (`scripts/README.md`, `references/audit-targets.md`).
- `gallery/README.md`: reference builds with their contact sheets.
- `references/`: `brief-template.md`, `facts-ledger.md`, `storyboard-template.md`, `motion-language.md`,
  `parts-contract.md`, `audit-targets.md`, `gotchas.md`, `cliches.md`, `handoff-template.md`.

## When to use

- A page whose job is one action (leave contact, book, download, join) and whose material is a
  story: an event, a talk, a product launch, a founder, a pitch deck turned web page.
- Not for multi-page sites, dashboards, or cold-outreach pitch packages (that is the `pitch-app`
  pipeline in this repo, with its own gate).

## Fixed decisions (write them into `brief.md`; agents obey them)

- **Every fact traces to a source line.** `facts.md` is the only place copy may take a claim from.
  INFERRED lines never ship. No invented numbers, testimonials, logos, ratings, dates or deadlines.
- **No em dashes anywhere**: copy, alt text, email, subject, code comments in shipped files.
- **One action.** The form (or the button) is the page's destination; every scene points at it.
- **One orchestrated moment beats scattered fades.** Each scene has one idea and one motion.
- **The kit is the engine.** Scenes use `CONTRACT.md` attributes; no new scroll listeners, no GSAP, no
  Lenis, no `getBoundingClientRect` in a frame. Transforms, opacity and clip-path only.
- **Finished page without motion.** No JS, reduced motion, and a dead bundle all render the settled
  composition (`html.js:not(.rm)` gates reveals, `html.mo:not(.rm)` gates pins; 3.5 s failsafe).
- **Pages that carry someone else's brand ship `noindex, nofollow`** until the owner says otherwise.
- **Nothing outward by an agent**: no deploy, no email to a real person, no push, no env on Vercel.

## Phases

Model routing: **Opus** for the facts ledger, storyboard directions, the reference scene, the
integrator and the final LOOK; **Sonnet** for brand ingest, scaffold, scene fan-out, audit runs and
fixes with a clear finding. Never rerun a failed brief on the same model unchanged: fix the brief or
escalate.

| Phase | Who | What | Done means |
|---|---|---|---|
| 0 Brief | you | `brief.md` from the template below: 10 lines, the three dials, the one action, the sources | the owner has read it (✋ only if a line is a guess) |
| 1 Facts | 1 agent, Opus | `facts.md` per `references/facts-ledger.md`: every claim the page could use, one line each, with `file:line` or URL | every line has a source and a status; INFERRED lines flagged |
| 2 Brand | 1 agent, Sonnet | `tokens.css` (`--bg --ink --ink-2 --muted --accent --accent-2 --line`, fonts), logos as SVG plus dark-pill PNGs for email, font files local | tokens contrast-checked (body 7:1, small 4.5:1); logo renders on light, dark and inverted |
| 3 Storyboard | 1 agent, Opus | three directions per `references/storyboard-template.md`, differing in **metaphor**, not palette; scene order from `kit/scenes/INDEX.md`; copy slots filled with fact ids; self-review against `references/cliches.md` | three tables plus one still per direction |
| ✋ | owner | **picks a direction** (and edits copy) | choice written into `brief.md` |
| 4 Scaffold | 1 agent, Sonnet | copy the template, `sync-kit.sh` with the scenes and `--backend` (commands below), brand values into `src/styles/tokens.css`, facts into `src/config.ts` | `npm run build` green, `/preview/<scene>` renders at 390 and 1440, form posts to `data/leads.jsonl` |
| 5 Build | Opus (reference) then 3-4 Sonnet agents | the reference scene first, then one scene folder per agent (clones, ports, prefixes below); the integrator alone writes `src/app/page.tsx` | each scene passes its acceptance list in `references/parts-contract.md`; integrated page builds |
| 6 Audit | 1-2 agents, Sonnet; LOOK by you or Opus | `audit.cjs`, `perf.cjs`, `gate.cjs --facts facts.md`, email preview, contact sheets; regenerate **only failing scenes** | all targets in `references/audit-targets.md` green; every sheet looked at; findings table closed |
| ✋ | owner | review the live local page and the email preview | approved or a change list |
| 7 Ship | you | commit per wave (pathspec), handoff note, owner-only list | `HANDOFF.md` written; commands handed over, none run |

### Phase 0: the brief (copy into `<app>/brief.md`)

```
1  Page:        <name>, <one line: who lands here, from where (QR, link, ad)>
2  Audience:    <who, what they already know when they land>
3  One action:  <the single thing they do: leave name+email+phone / book / download>
4  Promise:     <what they get for it, in their words>
5  Story:       <the arc in one sentence: from X to Y>
6  Tone:        <three words>, voice <tu / dumneavoastră / you>
7  Dials:       DESIGN_VARIANCE <1-10> · MOTION_INTENSITY <1-10> · VISUAL_DENSITY <1-10>
8  Sources:     <deck path, site URL, bio doc, brand files> (facts come only from these)
9  Constraints: <deadline, hosting, language, noindex, what must not appear>
10 Done:        <the owner's own test, e.g. "scan the QR on a phone, submit, get the email">
```
Dials: VARIANCE 3 = familiar grid, 8 = a layout nobody has seen; MOTION 3 = reveals only, 8 = pinned
scenes that carry the story; DENSITY 3 = one idea per screen, 8 = a dense editorial page. Write the
numbers before the storyboard; agents read them as constraints. Details: `references/brief-template.md`.

### Phase 1: facts and reconciliation

When a source changes (new deck, edited bio), do not patch copy by memory. Diff old source against
new, then produce a table `file:line in the app | current text | source line | action` and apply it.
Re-run `gate.cjs --facts facts.md` after. The SPEECH build needed this twice in one day.

### Phase 3: storyboard self-review (before any code)

Each direction is a table (order | scene | copy slots to fact ids | mobile note | frames to verify).
The storyboard agent checks every direction against `references/cliches.md` and rewrites hits before
you see it. The hero frame states the hook above the fold at 390x844. If the form is the action and
the audience arrives warm (QR at an event), put the form in the first screen.

### Phase 4: scaffold commands

```
SK=~/.claude/skills/landing-studio; APP=<repo>/<slug>          # brief.md, facts.md already in $APP
mkdir -p "$APP" && cp -R "$SK/kit/app-template/." "$APP/" && rm "$APP/sync-kit.sh"
"$SK/kit/app-template/sync-kit.sh" "$APP" --scenes hero-words,pinned-beats,form-popup --backend   # any of the 16 names in kit/scenes/INDEX.md
cd "$APP" && npm install && xattr -dr com.apple.quarantine node_modules 2>/dev/null; npm run build
```
- `sync-kit.sh` lays out `src/kit/{engine,react}`, `src/styles/{tokens,motion}.css`, `src/scenes/<name>/`,
  `src/app/preview/<name>/page.tsx` (the scene alone between two 100svh spacers, with its `data.example.ts`)
  and, with `--backend`, `src/app/api/lead/route.ts`, `src/lib/{leads,email}.ts`, `src/config.ts`, `.env.example`.
  It is safe to re-run after a kit fix: kit code is overwritten, app-owned files (`tokens.css`, `config.ts`,
  previews) are written only when missing. Always run it from the skill, never from a copy.
- `node_modules`: when another local app has the same `package.json` dependency set, `cp -Rc <that>/node_modules .`
  (APFS clone) instead of `npm install`, then `npm ls --depth=0` to confirm.
- Brand (Phase 2 values): edit the brand block of `src/styles/tokens.css` (`--bg ... --font-mono`) and
  `THEME_COLOR` in `src/app/layout.tsx` (same as `--bg`). Facts for the backend go into `src/config.ts`.
- Already in the template: `robots: { index: false, follow: false }` and an `X-Robots-Tag: noindex, nofollow`
  header in `next.config.ts`; remove both only when the owner says the page may be indexed.
- Assets the scenes reference (`public/<shot>.png`, `public/email-logo-<id>.png`) are copied by hand.

### Phase 5: build

- **Reference scene first, Opus**: the hardest scene in the storyboard (usually the hero or the first
  pinned scene), built to the full acceptance list. Its file becomes the example in every later brief.
- **Fan-out**: one agent per scene folder `src/scenes/<name>/` (new scenes go back into the skill as
  `kit/scenes/<name>/` with `scene.md` and `preview.tsx`), classes prefixed `.<name>-`, nothing else
  touched. Each agent works in its own clone: `cp -Rc "$APP" "$TMP/<name>"` (APFS clone, node_modules
  included; never a symlink, Turbopack refuses it) and runs on its own port: `PORT=3051 npm run dev < /dev/null`
  (3052, 3053...; `next dev` exits when stdin closes). The integrator runs on 3050. Each scene is checked
  alone at `/preview/<name>`.
- **Integrator** (you or one Opus agent) copies finished scene folders back, writes `src/app/page.tsx`,
  resolves seams between scenes (background handoffs, first frame of each pin visible at p=0).
- A kit bug is fixed in the skill (`kit/...`) and re-synced with `sync-kit.sh`, never patched in the app only.
- Rules: `references/parts-contract.md`. Motion: `references/motion-language.md`.

### Phase 6: audit

Run against a production build: `npm run build && PORT=3050 npm start < /dev/null &`. Kill an old server by
port first (`lsof -ti tcp:3050 | xargs kill`): a stale server answers with the old build and every script
measures it. Write `ls-audit.json` in the app (format in `scripts/README.md`: url, each pinned scene's
selector and frames, hero fields that must sit in the first fold). Then, from the app folder:

```
SK=~/.claude/skills/landing-studio; K=$SK/scripts
node $K/audit.cjs                  # profiles m 390, d 1440, rm, js-blocked; --scene <sel|i> to rerun one scene
node $K/perf.cjs                   # paints per scene <= 120, idle <= 3, CLS <= .02, LCP, JS vs perf-baseline.json
node $K/gate.cjs src --facts facts.md   # em dash / placeholders fail; unsourced names and numbers warn (--strict fails)
node --experimental-strip-types $SK/kit/backend/preview/render-email.mjs   # preview-out/: 640 and 390, light, dark, invert
```
Playwright comes from `PW_PATH` / `NODE_PATH` (scripts/README.md). The first `perf.cjs` run writes
`perf-baseline.json`; commit it, never raise it. **Look at `audit/sheet.png` and every scene frame** plus the
email shots. `audit.cjs` frames **pinned** scenes only; a flow scene (reveal-driven) is checked from hand-shot frames
(`scripts/shoot.cjs <url> --full`, or a playwright script sampling 0 to 1400 ms after it enters the viewport).
Every automated check here has passed a blank section at least once. Failing scenes go back to
their own agent with the finding; passing scenes are frozen. Last gate: the category audit (would this page
stand next to the three best pages in its category; name the gap or say none). Before ship:
`rm -r src/app/preview` (and the `data.example.ts` files the page does not import).

### Phase 7: ship

Main session alone touches git: `git add <app>/src/scenes/<name> ...` per wave, never `-A`. Handoff from
`references/handoff-template.md`. Then hand over, never run:

## Owner-only (hand over the exact commands)

- Env vars on Vercel (SMTP, notify address, any key) and `vercel env pull` (it can carry a real DB URL).
- `vercel deploy` / `--prod`, domains, DNS. Auto mode denies deploy; do not work around it.
- The real submit test on a phone from the real URL, and the first real email to a real person.
- `git push`, unless the owner asked for it in this session. Deleting worktrees and clones.

## Sub-agent brief skeleton

```
Goal: <one sentence + why it matters to the page>
Scope: you own src/scenes/<name>/ and src/app/preview/<name>/ in your clone <path>, port <30xx>.
  Off limits: src/kit/, src/styles/, src/app/page.tsx, facts.md, every other scene. Never git, deploy or send.
Known facts: CONTRACT.md; storyboard row <n>; copy slots -> F-ids <list> (quote facts.md exactly);
  dials <V/M/D>; reference scene <path>; gotchas that bite this scene: <3 lines from gotchas.md>.
Done means: acceptance list in references/parts-contract.md, all items, at 390x844 and 1440x900;
  you looked at your sheets; server stopped.
Report in under 150 words: files, acceptance results (n/n), sheet paths, open issues. No code.
```

## Done means

A brand team would ship it; the audit is green; you looked at every sheet. Short of that, it is not
done, whatever the reports say. "Done" in an agent report is a claim: re-run `audit.cjs` yourself.

## Talking to the owner

1. After Phase 0: the brief, ten lines. Proceed unless they object.
2. ✋ After Phase 3: three directions, one still and one paragraph each, your recommendation.
3. ✋ After Phase 6: local URL, the sheets, the email preview, the audit summary.
4. At the end: what is committed, the owner-only commands, what is still open.
