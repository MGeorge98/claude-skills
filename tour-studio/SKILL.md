---
name: tour-studio
description: >-
  Orchestrator playbook for a guided sales demo of an existing app: a standalone, static Next.js 15
  front-end (mock data, no backend) where the visitor clicks "Următorul" through rebuilt screens,
  each step spotlighting one element with one benefit sentence, step in the URL, a start screen with
  a chapter picker and a final screen with one CTA. Ships a product-agnostic kit (spotlight engine,
  bottom sheet on phones, strings object, start/final templates) and a browser verification gate.
  Use when the user says "tur ghidat", "demo de vânzare", "onboarding de prezentare", "fă un tur
  prin aplicație", "product tour", "guided demo", "walkthrough cu next", "sales demo of this app",
  or asks for a clickable demo of an app to show or send to prospects.
---

# Tour Studio

Goal: a link a prospect opens cold and clicks through in about three minutes, understanding what the
product does for *them*, on screens that look exactly like the real app, with no real data anywhere.
Method: **inputs, read the real look, storyboard as data, rebuild only the visited screens, walk every
step in a browser at two widths, hand over.** Reference build: `~/GitHub/print-offers-demo` (12 steps,
4 chapters, 7 screens), built from a real client app in one agent run plus one polish pass.

Language: this playbook is English; the **demo's language** defaults to Romanian with correct
diacritics (ă â î ș ț, comma-below), or whatever the user asks. Engine words live in one file.

Files in this skill:
- `kit/`: a complete Next.js 15 skeleton (pinned deps, Tailwind 3). `kit/README.md` says how to drop it in
  and which file to edit for what. Engine: `kit/components/tour.tsx`. Data: `kit/lib/tour.ts`.
  Words: `kit/lib/tour-strings.ts`. Names: `kit/lib/config.ts`. Templates: `kit/app/page.tsx`, `kit/app/final/page.tsx`.

## When to use

- An app exists (or a branch of it) and the owner wants to sell the same kind of app to similar
  companies, or onboard someone by showing it, without giving access to the real system.
- Not for a marketing landing page (`landing-studio`), a documentation book (`ui-book`) or a video.

## 0. Inputs (collect in one message; proceed on defaults the user does not contest)

| Input | Default if not given |
|---|---|
| Source app path | none, ask |
| Which part to demo (module, flow, roles) | the main daily flow of the main role |
| Audience (who clicks the link, what they already know) | owner of a similar small company, non-technical |
| Product name for the demo | provisional, e.g. "<Domeniu> Demo"; one constant in `lib/config.ts` |
| Invented customer company shown in the screens | "<Domeniu> Demo" style fictitious name |
| Language | Romanian, full diacritics |
| CTA target | `mailto:` with subject "Demonstrație <produs>"; a booking URL if given |
| Length | 10-12 steps in 3-4 chapters; 5-8 steps for a cold-outreach link |
| Demo folder | `~/GitHub/<slug>-demo` (a new folder, never inside the source repo) |
| Dev port (unique per demo) | none, ask; the builder sets `-p <port>` in the `dev` script of `package.json` (kit default 3210 is a placeholder) |

Write these as the top of `<demo>/BRIEF.md` (10 lines), **except the source app path**, which goes only in `SOURCE.md`
(grep-excluded) or stays outside the project. Every agent brief quotes BRIEF.md.

## Hard rules

- **New folder.** The demo is its own project. The source repo is read-only: no edits, no branches,
  no `npm install`, no build there. Record `git status --short` of the source before starting, compare after, and report any difference (pre-existing changes are not yours).
- **No backend.** No login, API routes, server actions, DB, fetch, env vars, analytics. Static build only.
- **Mock data only, all invented.** No real names, companies, emails, domains, addresses, phone
  numbers, CUI/VAT ids, prices lists copied verbatim, logos or screenshots from the source.
  Invent plausible ones in the demo's language. Use `example.com` for every email.
- **Real-name grep before hand-off** (list built in phase 1, command in phase 4). Zero hits or not done.
- **Never push, deploy or create a remote** without the user's explicit yes in this session.
  `git init` and local commits in the demo folder are fine.

## Phases

Model routing: **Opus** for the storyboard copy and the build (layout fidelity and the tour wiring are
where cheap models fail); **Sonnet or Haiku** for read-only lookups (token extraction, route inventory,
the real-name list). **One build agent per demo**; never split one demo's screens across agents (they
share tokens, mock data and the steps file). Two demos = two build agents in parallel, each in its own folder, its own port, and **its own browser**: parallel agents must not share the Playwright MCP browser, and must never kill dev servers they did not start (kill by own port only: `lsof -ti tcp:<port> | xargs kill`).

| Phase | Who | What | Done means |
|---|---|---|---|
| 0 Inputs | you | table above into `BRIEF.md` | user saw it |
| 1 Source read | 1 agent, Sonnet, read-only | look, screens, real-name list (below) into `<demo>/SOURCE.md` | every token value quoted with `file:line` |
| 2 Storyboard | you or Opus | chapters and steps written straight into `lib/tour.ts` shape, in a table in `BRIEF.md` | rules in section 2 pass |
| 3 Build | 1 agent, Opus | kit copied, look applied, screens rebuilt, steps wired | build and typecheck clean |
| 4 Verify | the build agent, then you spot-check | the gate in section 4 | every step looked at, 2 widths, console clean, grep clean |
| 5 Hand-off | you | section 5 | user has the run command and the open decisions |

### 1. Read the source app's ACTUAL look first

The reference build was briefed from a stale memory note ("navy accent, Geist") and came out in a different
colour and font than the real app. **Never take the look from a brief, a memory file or a screenshot in
a doc when the code is there.** Read, in this order, and quote values into `SOURCE.md`:
1. `tailwind.config.*` (colors, fontFamily, radius, shadows) and the global CSS (`:root` variables, `@theme`).
2. The root layout: which font loader and family, `lang`, body classes.
3. One real screen of the flow and its shared components (button, card, table, badge/pill, header):
   sizes, paddings, border style, radius, how status colours are drawn.
4. If the app has a dark mode, the demo is light only unless the user says otherwise.

If the user wants the generic product to look different from the client app, that is their explicit
choice; write it in `BRIEF.md` and still read the source for layout.

Also into `SOURCE.md`:
- **Screen inventory** of the chosen part: route, what it shows, which element proves the benefit.
- **Real-name list** for the grep: the client's company and brand names, product name, people (git
  authors, seed data, README), email domains, street/city names in seeds, phone prefixes, the repo name.
  Store it as one `grep -E` pattern line. It stays in `SOURCE.md`, which is never shipped (add to `.gitignore`).

### 2. Storyboard rules (steps are data)

- **Start screen**: one-line promise in the buyer's words, two-sentence subline, "Începe turul", chapter
  picker (chapter title, one-line description, step count). Badge: steps and minutes.
- **10-12 steps in 3-4 chapters** (cold link: 5-8). Chapters follow the buyer's day or the order's life
  (overview, create, approve/produce, money/admin), not the app's menu.
- **One highlighted element per step, one benefit per step.** Title = the benefit (max about 8 words).
  Body = one or two sentences, max about 30 words, for the buyer, never for developers: no "component",
  "state", "API", "modul". Say what stops hurting ("fără telefoane", "nu mai calculezi de mână").
- **"Se poate adapta:"** (`adaptable`) on most steps: what the buyer could have changed (statuses, price
  rules, documents, fields, emails). This is the sales argument for a generic product; skip it where nothing honest fits.
- **Targets are small.** A KPI strip, one card, one button row, one table header plus rows; never a whole
  page column. If the natural element is taller than about half the viewport, target an inner part.
- **Final screen**: one primary CTA, "Reia turul", chapter links, a short "Se adaptează la cerere" list.
- No invented performance claims ("crește vânzările cu 30%"). Benefits describe what the screen does.

### 3. Build

```
SK=~/.claude/skills/tour-studio/kit; APP=~/GitHub/<slug>-demo
mkdir -p "$APP" && cp -R "$SK/." "$APP/" && rm "$APP/README.md"
cd "$APP" && (cp -Rc ~/GitHub/print-offers-demo/node_modules . || npm install) && npm run build
```
Then, in order:
1. Look: token values from `SOURCE.md` into `app/globals.css` (keep the variable names, the engine uses
   them; add more for status tones), font into `app/layout.tsx` as `--font-sans` with `latin-ext`,
   `btn` in `components/tour-ui.tsx` restyled to the source's buttons. The engine writes text in `--accent-text` on
   `--accent-soft`: when the brand accent is fill-only (lime, yellow), set `--accent-text` to a dark value.
2. Names: `lib/config.ts`. Nothing else may hard-code the product or company name.
3. Mock data: **one file** `lib/mock.ts` with every record the screens show (typed, invented, internally
   consistent: totals add up, dates in the recent past, statuses spread across the flow).
4. Screens: one static route per visited screen, plus a shared shell (header with tabs like the source,
   sticky 56px, content column). Rebuild the look with plain components fed by `lib/mock.ts`. **Do not
   port the source architecture**: no data layer, stores, hooks, auth guards, i18n framework. Inputs may
   be inert. Only the screens the tour visits; tabs to other screens may exist but point to visited ones.
5. Steps: `lib/tour.ts` from the storyboard; `data-tour` attributes on the targets. Delete `app/exemplu`.
6. Start and final screens: rewrite the promise, final line, `ADAPT` list, CTA.

Engineering rules (the kit already does the first block; keep it that way):
- Steps target `data-tour` attributes; the step lives in the URL (`?pas=N`), so refresh and shared links land on it.
- Same-route step: `router.replace(url, { scroll: false })`; new route: `router.push(url)` so the page starts at its top;
  then scroll only as much as needed (in view stays put; below the fold moves up just enough; too tall aligns the top).
- Show the popover only after the scroll settles (5 still frames or 2.5 s); the cut-out chases the target meanwhile.
- Full-screen SVG mask (even-odd path) with a rounded cut-out, moved with an **ease-out tween**. A spring overshoots and folds the path.
- Popover tries below, above, right, left, else bottom-right; wide targets anchor it to their right edge.
  Under 640 px it becomes a bottom sheet (max 46vh) and the body gets 45vh bottom padding so low targets can rise above it.
- Focus moves to the popover when it appears; ← → step; Esc closes; "Reia turul" on every page but `/` and `/final`
  resumes the last step seen on this page, else this page's first step.
- Reduced motion: tweens 0 ms, `scrollTo` with `behavior: "auto"`, CSS transitions 0 s.

Pitfalls the reference build hit (one line each; obey them in the screens you write):
- **Console error from the spotlight**: give `motion.path` / `motion.rect` `initial={false}` and always the same
  path command list, so framer-motion never interpolates from a missing or differently shaped `d`.
- **Hydration mismatch with reduced motion**: `useReducedMotion()` is null on the server; never branch `initial`
  on it (`initial={reduce ? false : ...}`). Keep `initial` constant and set `duration: reduce ? 0 : x`.
- **Popover over the scrollbar**: measure the viewport with `document.documentElement.clientWidth`, not `innerWidth`.
- **Squeezed tables on phones**: hide secondary columns below `sm` (`hidden sm:table-cell`), move the status pill
  under the name in the first cell, make row buttons icon-only below `sm` with an `aria-label`, shorten labels ("Ex.").
- **Target too tall to fit beside the popover or above the sheet**: move `data-tour` to an inner element; cap
  scrollable panes on phones (`max-h-[220px] md:max-h-none`).
- **Header on phones**: must stay one 56px row (the engine's `TOP` offset assumes it): hide secondary header items (account chip, company name) below `sm` so tabs fit; tabs scroll horizontally without a scrollbar.
- **Floating buttons** (resume, help, chat bubble): hide them while a step is active (the kit's resume button already does), or they sit inside the spotlight on phones.
- **KPI grids**: an odd last tile in a 2-column phone grid spans both columns (`last:odd:col-span-2`).
- **Headlines**: `text-balance`; glue short words that orphan (`<span className="whitespace-nowrap">într-un</span>`).
- **Client pages cannot export `metadata`**: put the title in a sibling `layout.tsx`.
- **`<Tour />` inside `<Suspense>`** in the root layout (useSearchParams), or the static build fails.
- **Console noise counts**: ship `app/icon.svg` (else favicon 404); `devIndicators: false` (the dev badge sits under the sheet).
- **Pass `data-tour` through shared components** (`...rest` on Card/Section) or wrap in a `div`; check the attribute exists in the DOM.

### 4. Verification gate (non-negotiable; "done" without it is not done)

1. `npm run typecheck && npm run build`: zero errors, zero warnings worth reading, all routes static (○).
2. Start a server: `npm run build && PORT=3299 npx next start -p 3299 < /dev/null &` (kill a stale one first:
   `lsof -ti tcp:3299 | xargs kill`).
3. Walk **every** step in a real browser (Playwright MCP) at **1440x900** and **390x844**: open `/`, start, click
   "Următorul" through to `/final`. For each step take a screenshot and **look at it**: cut-out on the right
   element, popover not covering it, target fully above the phone sheet, text not clipped, no horizontal
   scroll (`scrollWidth === 390`), diacritics render. **After a route change the old popover is still at opacity 1:
   wait for the counter text ("N din 12") of the step you navigated to, then screenshot**; never wait on "popover visible". Also: Esc closes, "Reia turul" resumes, ← → work,
   refresh on `?pas=7` lands on step 7, chapter links on `/` and `/final` land on the right step,
   reduced motion (`browser_emulate_media`) shows no animation and no hydration warning.
4. Read the console (`browser_console_messages`, level warning) after every route: zero errors, zero hydration warnings.
5. Fix, rebuild, repeat from 3 for the affected steps until clean.
6. Real-name grep from the demo folder, excluding `SOURCE.md`, `node_modules`, `.next`:
   `grep -rniE "<pattern from SOURCE.md>" --exclude-dir={node_modules,.next,.git} --exclude=SOURCE.md .` → nothing.
7. Read every step's title and body once more as the buyer: one benefit, under about 30 words, no jargon, diacritics correct.

**Fallback when the Playwright MCP browser is busy or unavailable** (e.g. two demos in parallel): run
`python3 scripts/shots.py <port> <folder>` from the demo root (needs `pip install playwright`). It screenshots start, every step
and final at 1440x900 and 390x844 and prints scrollWidth, overlap and console errors; look at every image. Keyboard, focus,
Esc and close/resume are NOT exercised then; report them as not checked.

**Playwright quirk**: MCP screenshots and snapshots land in `.playwright-mcp/` of the session's working
directory, which is often the *source* repo. After the walk, move them to the scratchpad
(`mv <cwd>/.playwright-mcp/* <scratchpad>/shots/ && rmdir <cwd>/.playwright-mcp`) and confirm
`git -C <source> status --short` equals the one recorded at the start. Stop the server at the end.

### 5. Hand-off to the user

In the user's language, product terms not git terms:
- Run it: `cd ~/GitHub/<slug>-demo && npm run dev` then `http://localhost:<port>` (the demo's own port).
- What was checked: steps walked at desktop and phone width, console clean, real-name grep clean, build clean.
- What was not checked: real devices, Safari, slow networks, anything you skipped (say it).
- Open decisions: final product name (one constant), CTA target, deploy (where, which domain; nothing deployed),
  any copy the user should read (benefit claims).

## Sub-agent brief skeleton (build agent)

```
Goal: guided sales demo of <part> of <source app>, for <audience>, in <language>. BRIEF.md and SOURCE.md in <demo>.
Scope: write only in <demo>. Source <path> is read-only (no install, no build, no git there). No network
  unless node_modules is missing. Never push or deploy.
Do: tour-studio SKILL.md sections 3 and 4, in order. Kit: ~/.claude/skills/tour-studio/kit (copy, do not redesign;
  a kit bug is reported back, not silently forked). Look = SOURCE.md values, not memory.
Done means: section 4 gate passed at 1440 and 390, every screenshot looked at, console clean, grep clean,
  source `git status --short` same as at start (report any difference), server stopped (own port only).
Report in under 150 words: run command, routes, step count per chapter, gate results (n/n steps OK per width),
  screenshot folder, deviations from the storyboard, open issues. No code.
```

## Done means

A stranger opens `/`, clicks through to the CTA on a laptop and on a phone without a misplaced spotlight,
a console error, a real name, or a sentence written for developers. Re-run step 3 of the gate yourself on
two or three steps before you believe an agent's "done".
