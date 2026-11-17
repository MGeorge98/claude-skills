---
name: tour-studio
description: >-
  Orchestrator playbook for a guided sales demo of an existing app: a standalone, static Next.js 15
  front-end (mock data, no backend) told as ONE story in time. An animated cursor glides to each element,
  clicks it, the mocked screen reacts, then a caption grows out of the cursor; a ring outlines the whole
  block. Story first (from the product's landing page, approved by the user), screens second. Ships a
  product-agnostic kit (cursor engine, state per step, phone bottom sheet, strings, start/final templates)
  and a browser gate. Use when the user says "tur ghidat", "demo de vânzare", "onboarding de prezentare",
  "fă un tur prin aplicație", "product tour", "guided demo", "walkthrough cu next", "sales demo of this app",
  or asks for a clickable demo of an app to show or send to prospects.
---

# Tour Studio

Goal: a link a prospect opens cold and watches/clicks through in about two minutes, recognising **their own
day** in it, on screens that look exactly like the real app, with no real data anywhere.
Method: **inputs, story from the landing (approved), read the real look, build with the kit, gate at two
widths, hand over.** The worked example (before/after copy, time arc) is in `references/story-example.md`.

Language: this playbook is English; the **demo's language** defaults to Romanian with correct diacritics
(ă â î ș ț, comma-below), or whatever the user asks. Engine words live in one file.

Files in this skill:
- `kit/`: a complete Next.js 15 skeleton (pinned deps, Tailwind 3). `kit/README.md` says which file to edit for what.
  Engine: `kit/components/tour.tsx`. Steps: `kit/lib/tour.ts`. Mock state: `kit/lib/demo-state.ts`.
  Words: `kit/lib/tour-strings.ts`. Names + CTA: `kit/lib/config.ts`. Example screen: `kit/components/example.tsx`.
  Fallback walk: `kit/scripts/shots.py`.
- `references/story-example.md`: a full worked example of phase 2 (load it when writing the story).

## When to use

- An app exists (or a branch of it) and the owner wants to sell it to similar companies, or show it to
  someone, without giving access to the real system.
- Not for a marketing landing page (`landing-studio`), a documentation book (`ui-book`) or a video.

## 0. Inputs (collect in one message; proceed on defaults the user does not contest)

| Input | Default if not given |
|---|---|
| Source app path | none, ask |
| Landing / sales material | the source repo's marketing copy if present, else the live site; if none, ask (phase 2) |
| Audience (who clicks the link) | owner of a similar small company, non-technical |
| Product name | the product's real brand if the user sells it, else provisional; one constant in `lib/config.ts` |
| Invented customer shown in the screens | "<Domeniu> Demo" style fictitious name |
| Language | Romanian, full diacritics |
| CTA | the landing's own demo/contact form (route + anchor found in its source) and wording; else `mailto:` |
| Length | 5-8 steps, one story; about 2 minutes |
| Demo folder | `~/GitHub/<slug>-demo` (a new folder, never inside the source repo) |
| Dev port (unique per demo) | none, ask; set it once at creation: `npm pkg set config.port=<port>` (dev and start read it) |
| Positioning | "product" (sold as is) or "built to order"; decided in phase 2 |

Write these as the top of `<demo>/BRIEF.md`, **except the source app path**, which goes only in `SOURCE.md`
(git-ignored, grep-excluded).

## Hard rules

- **New folder.** The source repo is read-only: no edits, no branches, no `npm install`, no build there.
  Record `git status --short` of the source before starting, compare after, report any difference.
- **No backend.** No login, API routes, server actions, DB, fetch, env vars, analytics. Static build only.
- **Mock data only, all invented.** No real names, companies, emails, domains, addresses, phone numbers,
  VAT ids, price lists copied verbatim, logos or screenshots from the source. `example.com` for every email.
  Check invented person names against the source's seed/fixture files too: a shared first name is a hit.
- **No invented claims.** No result figures (hours saved, % more revenue), testimonials or prices that the
  landing does not state.
- **Real-name grep before hand-off** (pattern from phase 1). Zero hits or not done.
- **Never push, deploy or create a remote** without the user's explicit yes in this session.

## Phases

Model routing: **Opus** for the story and the build; **Sonnet/Haiku** for read-only lookups (tokens, routes,
real-name list). **One build agent per demo**. Two demos = two build agents, each with its own folder, its own
port and **its own browser**: parallel agents never share the Playwright MCP browser, and never kill a server
they did not start (`lsof -ti tcp:<own port> | xargs kill`, nothing else).

| Phase | Who | What | Done means |
|---|---|---|---|
| 0 Inputs | you | table above into `BRIEF.md` | user saw it |
| 1 Source read | agent, read-only | look, screens, real-name list into `SOURCE.md` | every token quoted with `file:line` |
| 2 Story | you or Opus | section 2, as a table in `BRIEF.md` | **user approved it** |
| 3 Build | 1 agent, Opus | kit copied, look applied, screens rebuilt, steps wired | typecheck + build clean |
| 4 Gate | the build agent, then you spot-check | section 4 | every item reported with evidence |
| 5 Hand-off | you | section 5 | user has the run command and the open decisions |

### 1. Read the source app's ACTUAL look first

Never take the look from a brief, a memory file or a doc screenshot when the code is there. Read, in order, and
quote values into `SOURCE.md`: `tailwind.config.*` and global CSS (colours, font, radius, shadows); the root
layout (font loader, `lang`); one real screen of each visited route and its shared components (button, card,
table, badge, header, drawer). Dark mode: the demo is light only unless asked.
Also into `SOURCE.md`: the **screen inventory** (route, what it shows, which element proves which promise) and
the **real-name list** as one `grep -E` pattern (company/brand names, people from git and seed data, email
domains, streets/cities in seeds, phone prefixes, repo name).

### 2. Story before screens (mandatory; show it to the user and wait for approval)

Phases 0 and 1 come first: the story is written from what the source and the landing actually contain.

1. **Read the landing first**: the source repo's marketing copy files (messages/*.json, content/, pages), then the
   live site. Extract: the **promise** (headline), the buyer's **pains** as the landing names them, the buyer's
   **own words** (verbs and nouns the landing repeats), the **CTA** wording and target, any "before/after" image.
   No landing: ask the user for 3 pains and the promise in their words. Never invent them.
2. **Pick 5-8 moments, not features.** Only what the landing promises; drop admin screens, settings tables,
   rules editors, unless the landing sells them. Each moment is one thing the buyer sees change.
3. **Arrange them as ONE story in time**: a day (night → morning → evening), a week, an order's life, a month.
   Every step gets a `moment` label ("Marți, 22:40", "Luni, 08:30", "Sfârșit de lună"). Chapters are parts of
   that time ("Cât dormi", "Peste zi", ...), not the app's menu.
4. **Start screen = the pain in one concrete image** (a time, a place, a detail the buyer recognises, taken from
   the landing), beside the same moment with the product. **A named step pays that pain off visibly, as early as
   the time order allows**; the start screen may point at that moment ("vezi la pasul 3, joi 23:04"). Then the
   promise (the landing's headline) and the start button; a compact step list with moments. It must read as a
   story opening, not a menu.
5. **Copy rules** (per step):
   - Title = an **outcome** for the buyer ("Rezervarea a intrat singură"), never a screen name ("Calendar").
   - Body ≤ 30 words = what you see + what it changes for them; reuse the landing's words.
   - Customisation lines depend on the **positioning** chosen here: "product" = none at all (a product is not
     custom work); "built to order" = say it explicitly at most 3 times (first step, one middle step, final screen).
   - No figures, testimonials or prices the landing does not state.
6. **Final screen** = a 3-line recap of what the tour proved + **one** CTA (the landing's wording and form) +
   "Reia turul" + the step list. Nothing else.
7. Write the story into `BRIEF.md` as a table: `# | moment | screen | what the cursor does | ring block | title`,
   plus the start image and the final recap. **Show it to the user; build only after their yes.**

Worked example with the before/after copy and the time-arc table: `references/story-example.md`.

### 3. Build

```
SK=~/.claude/skills/tour-studio/kit; APP=~/GitHub/<slug>-demo
mkdir -p "$APP" && cp -R "$SK/." "$APP/" && rm "$APP/README.md"
cd "$APP" && npm pkg set config.port=<port> && (cp -Rc <sibling-demo>/node_modules . 2>/dev/null || npm install)
npm run typecheck && npm run build
```
Copy the kit with the shell (as above), never by writing its files one by one; then change each file with
an edit tool after reading it (edit tools refuse to overwrite a file they have not read).
Then, in order:
1. **Look**: token values from `SOURCE.md` into `app/globals.css` (keep the names; set `--pointer` to the app's
   ink and `--pointer-edge` to its bright fill colour or white; `--accent-text` dark when the accent is
   fill-only), the source font in `app/layout.tsx` as `--font-sans` (latin-ext), `btn` in `components/tour-ui.tsx`.
2. **Names**: `lib/config.ts` (product, invented company, `CTA_HREF`). Nothing else hard-codes them.
3. **Mock data**: one file `lib/mock.ts`, typed, invented, consistent (see build rules).
4. **Screens**: one static route per visited screen plus a shared shell like the source's. Rebuild the look;
   do not port the source architecture (no data layer, stores, auth, i18n). A page that needs state = a server
   `page.tsx` (exports `metadata`) rendering a client view. Delete `app/exemplu` and `components/example.tsx`.
5. **State**: `lib/demo-state.ts` holds what changes on screen (open panel, paid, sent, toggled, the story's
   `clock`). Reserved for typing: `typed[<field's data-tour id>]` (one buffer per field; bind each input's
   `value` to its own) and `typing` (the id being typed into). Every control the cursor clicks is a real button
   that calls `setDemo`, so it works for a visitor too.
6. **Steps**: `lib/tour.ts` from the approved table: `moment`, `route`, `before` beats (`hover`, click, `typing`),
   the clicked `target`, the `ring` block, `setup` (the screen state + clock at that moment). `data-tour` on both.
   To wait for the screen's own animation or reply, give the beat (or the step, for its final click)
   `until: "<data-tour id or CSS selector>"` (+ `timeout`, default 4000 ms); `wait` is only a fixed pause.
7. **Start and final**: fill the templates' placeholders from the story; keep the structure.

**Build rules learned the hard way** (each one broke a real build):
- **Ring = a whole logical block** (a whole card, table, panel, drawer), never a slice of one (4 of 7 rows of a
  board read as a bug). The clicked `target` is separate and small. If the block leaves no room for the
  caption, change the layout (narrower block, compact rows) or let the engine lift the block; never shrink the ring.
- **State from the step number.** `setup` must fully describe the screen at that moment; the engine resets to
  `INITIAL + setup` on every step. Back, refresh and `?pas=N` opened cold must show the same screen.
- **The story's clock drives the mock.** Nothing is visible before it happens in the story (a booking made at
  18:30 is absent at 07:00; a walk-in is absent the night before). Keep a `clock` (or date) in the state per step.
- **Figures are computed from the mock records** (totals, counts, occupancy, per-item sums), so every screen
  agrees; monthly/report numbers are scaled to the daily ones. Weekday and date labels match the story.
- **The product looks healthy**: busy but believable (e.g. occupancy around 65 %, a few items pending, no red
  alarms unless the step is about them). Invented, never borrowed from the source.
- A control the click replaces (a "Send" that turns into "Sent") is fine: the engine keeps the click-time box.
- Horizontal panes (boards, wide calendars on phones): mark the sticky label column `data-sticky`; the engine
  scrolls the pane so the target sits in its visible part.
- A drawer/panel that opens on desktop as a side sheet must sit **above** the tour's bottom sheet on phones
  (top sheet, max ~50vh), or the two collide.
- **Two roles** (e.g. the customer, then the staff): flip perspective once, at a step boundary, with the route
  and a visible label in the screen header ("Vezi ca: client / operator"); keep one story clock across both.
- **One signature moment per demo** (optional): one custom animation that makes the promise physical (a page
  morphing between variants, a ticket travelling to a board). Keep the block's height stable while it plays,
  swap statically under reduced motion, wait for it with `until`, and leave it playable by hand after the cursor.

Engine facts (kit, do not re-implement): one fixed cursor (`aria-hidden`, `pointer-events:none`, own SVG) that
persists across routes and starts each tour at the visitor's click point; glide time scales with distance
(capped < 0.9 s), X and Y eased differently so the path curves; press + ripple; caption anchored to the cursor,
grown from it, placed beside the cursor, else beside the ring block (cursor moves there), else with the block
lifted to the top; never over the target or the ring; bottom sheet under 640 px; focus to the caption; ← → Esc;
"Reia turul" when closed; optional auto-play (off by default); `prefers-reduced-motion`: jumps, no ripple,
typing appears at once. No dark mask. (The older spotlight-and-mask mode was removed from the kit.)

Pitfalls (one line each):
- framer-motion logs a dev-only warning under reduced motion for every motion element (the kit engine uses none);
  if your screens use it, check the console on a production build (`npm run build && npm start`).
- Client pages cannot export `metadata`; `<Tour />` stays inside `<Suspense>` in the root layout.
- Measure the viewport with `document.documentElement.clientWidth`, not `innerWidth`.
- Tables on phones: hide secondary columns below `sm`, keep phone numbers and names `whitespace-nowrap`.
- Header on phones: one row; hide floating buttons while a step is active.
- Ship `app/icon.svg`; `devIndicators: false`; pass `data-tour` through shared components (`...rest`).
- Deterministic fake data from hashes: use `>>>`, not `>>` (a signed shift printed "-652" in a phone number).

### 4. Gate (non-negotiable; report every line with evidence)

Use a server on the demo's own port (`npm run dev`, which reads `config.port`; if one is already running there, reuse it). Walk in a real
browser (Playwright MCP) at **1440x900** and **390x844**: open `/`, start, "Următorul" to `/final`. After each
step **wait for that step's caption** (`[role=dialog][aria-hidden=false]` containing "N din M"), then screenshot.

1. `npm run typecheck && npm run build`: zero errors, all routes static (○).
2. **Every click lands on its target**: record which `data-tour` sits under each ripple (`shots.py` does it).
3. **The caption never covers its ring block** at 1440 (rect overlap = 0); on phones the sheet does not hide
   the clicked target.
4. **Nothing the caption talks about is cut off or off-screen** (a detail line clipped, a name truncated to "P.").
5. **No horizontal scroll** on phones (`scrollWidth === clientWidth`).
6. **Console clean** (no errors, no warnings) on every route, also with reduced motion emulated; judge
   library dev-only warnings (framer-motion) on a production build (`npm run build && npm start`).
7. **State checks**: Back restores the previous step's screen; refresh mid-tour and a cold `?pas=N` link show the
   right state; Esc closes and "Reia turul" resumes; the cursor starts at the start button.
8. **Forbidden-names grep** from the demo folder → nothing:
   `grep -rniE "<pattern>" --exclude-dir={node_modules,.next,.git} --exclude=SOURCE.md .`
9. **Screenshots saved and LOOKED at**, every one, both widths. Read each caption once more as the buyer.
10. Motion smoothness cannot be judged from screenshots: say how timing was checked (durations logged) or that it was not.

**Fallback when the Playwright MCP browser is busy or unavailable**: `python3 scripts/shots.py <port> <folder>`
from the demo root (needs `pip install playwright`). It loads every `?pas=N` cold at both widths, waits for the
caption, screenshots, and prints click hits, caption/ring overlap, scrollWidth and console. Keyboard, Esc,
resume and Back are NOT exercised: report them as not checked.

**Playwright quirk**: MCP screenshots land in `.playwright-mcp/` (or the given filename) relative to the
session's working directory, often another repo. Pass absolute paths in the scratchpad, then move
`.playwright-mcp/` out and confirm that repo's `git status` is unchanged.

### 5. Hand-off to the user

In the user's language, product terms not git terms:
- Run it: `cd ~/GitHub/<slug>-demo && npm run dev`, then `http://localhost:<port>`.
- The story in one line per step (moment + title) and what the cursor does.
- Gate results, both widths; what was not checked (real devices, Safari, motion feel, anything skipped).
- Open decisions: product name, CTA target, deploy (nothing deployed), copy the owner should re-read.

## Sub-agent brief skeleton (build agent)

```
Goal: guided sales demo of <part> of <source app>, for <audience>, in <language>. BRIEF.md (with the APPROVED
  story table) and SOURCE.md in <demo>.
Scope: write only in <demo>. Source <path> is read-only. Never push or deploy. Port <port> only.
Do: tour-studio SKILL.md sections 3 and 4. Kit: ~/.claude/skills/tour-studio/kit (copy, do not redesign the
  engine; a kit bug is reported back). Look = SOURCE.md values, not memory. Copy = BRIEF.md verbatim.
Done means: every line of the section 4 gate reported with evidence at 1440 and 390, screenshots looked at,
  grep clean, source git status unchanged, own server stopped.
Report under 150 words: run command, steps (moment + title), gate results, screenshot folder, deviations, open issues.
```

## Done means

A stranger opens `/`, recognises their own pain in the first image, watches the cursor solve it in step 1, and
reaches the CTA on a laptop and a phone without a ring around half a block, a caption over its subject, a
number that contradicts another screen, a console error, a real name, or a sentence written for developers.
Re-run the gate yourself on two or three steps before you believe an agent's "done".
