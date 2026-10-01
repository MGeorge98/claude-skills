---
name: ui-book
description: >-
  Orchestrator playbook for writing a "UI book" of an application, module, flow or prototype
  straight from its code: per-chapter illustrated documentation with hand-built animated mock-ups,
  exact UI strings, a pattern library, a consistency audit, UI/UX proposals, an optional
  halve-the-prose pass, an optional "ask the book" chat page and an optional PDF. Use when the user
  says "fă-mi o carte despre X", "carte de documentație", "UI book", "documentează aplicația /
  modulul / flow-ul ca o carte", "book with animated mocks", "document every screen", or asks for
  an illustrated handbook of a product's screens.
---

# UI Book

A static HTML book, written from the code, that teaches a reader everything a product's screens can do:
every section, action, state and message, drawn as animated mock-ups. The reference build was a
42-chapter book over three apps (~40 agents). This skill is mainly an **orchestrator playbook**: you plan,
decide and delegate, agents write chapters, and you commit per wave.

Language: everything below is English; the **book's language** comes from the request ("fă-mi…" → Romanian)
or the product's UI language. Set `<html lang>` everywhere; the kit, chat and scripts follow it.

Files in this skill:
- `references/plan-template.md` — the plan file you create in the target repo
- `references/chapter-brief.md` — brief for chapter agents (incl. lessons learned)
- `references/qa-brief.md`, `references/short-brief.md`, `references/part-iv-briefs.md`
- `references/chat-page.md`, `references/pdf.md`
- `assets/` — `book.css`, `mock.css` (kit), `book.js` (icons + flow engine), `chapter-template.html`,
  `cover-template.html`, `chat.html`, `build-index.mjs`
- `scripts/` — `check-chapter.mjs`, `check-links.mjs`, `print-pdf.mjs`, `prose-count.mjs`, `css-dupes.mjs`

## When to use

- The user wants documentation of what a product *does on screen*, readable by non-developers, complete
  enough to audit the product against.
- Not for API references, architecture docs or marketing pages.

## 1. Scoping: decide what X covers before writing anything

X can be a whole application, one module ("rezervări și plăți"), one flow ("checkout"), or a prototype.
Work it out from the code, never from the request's wording alone.

Run 2 inventory agents in parallel (read-only, standard model):
1. **Navigation and pages**: routes / page files, navigation menus and tab bars, feature flags,
   modules and RBAC / plan gating, redirects, detail pages, dialogs, drawers, emails and push
   notification templates, and the backend endpoints and server-generated texts each screen uses.
2. **Reusable assets**: design tokens (colours, radii, fonts, shadows), the component library, icon set,
   i18n message files, existing visual snapshots, design prototypes (with dates: prototypes are often
   stale; compare against the app's last change and say which is newer).

Output: an inventory (screen → route → files → roles) and a proposed chapter list. Rules:
- **Whole app**: one chapter per top-level screen; detail pages live inside their parent chapter;
  one chapter for the cross-cutting frame (menu, header, login, roles and plans, toasts, global prompts).
  Group into parts by app or audience. Number parts with gaps (01–19, 20–29, …) so chapters can be added.
- **Module**: every screen, detail page, dialog, notification and email that belongs to the module,
  wherever it lives (a "payments" dialog inside the calendar belongs to a payments book), plus the
  cross-cutting frame as one chapter.
- **Flow**: one chapter per step, plus one chapter per failure branch that has its own screen
  (payment failed, link expired), plus the frame.
- **Prototype**: document the prototype as shipped; mark in every chapter what is not real
  (hard-coded data, dead buttons, missing back-end) in a callout and in "Open questions".
- Part IV (patterns, audit, proposals) is on for apps and modules; for a single flow, fold it into one
  short chapter or drop it.

Show the user the chapter list and the demo-data proposal (one line each) and go on unless they object.

## 2. Fixed decisions (write them into the plan; agents follow them)

- **Source of truth = the shipped code.** Specs give intent only; when they differ from the code, the
  code wins and the difference is logged. Inventory lines are often wrong: trust the code.
- **Nothing invented.** Every label, button, state and message in prose *and inside mocks* exists in the
  code. Only demo data (names, times, amounts) is fictional. Unconfirmed → "Open questions".
- **Exact strings**, quoted as written (including diacritics and punctuation), from the i18n files or the
  component; server texts from the backend.
- **Language** of the book: one, chosen at the start. Plain, warm, second person, no code identifiers in
  reader-facing text (they belong in Sources / Open questions).
- **Static HTML, no build step**, opens from `file://`, prints as a book. Location: a `docs/<book>/` folder
  the user agrees to. The cover is `cuprins.html` / `contents.html`, not `index.html` (see §7).
- **Light theme** by default.
- **Mocks are hand-built on the kit, not screenshots**: apps rarely have a demo-data mode, so captures
  show empty states; screenshots go stale, cannot animate step by step, do not scale or print well, and
  leak real data. Tokens are ported 1:1 from the app into `mock.css`, so the drawings stay faithful.
- **Demo data defined once** by the pilot (an org, people, records, customers, one "now", currency format)
  in the `mock.css` header and the plan; every chapter reuses it. No real people or customers.

## 3. The chapter template (eight sections, stable ids)

| # | id | Section | Content |
|---|----|---------|---------|
| 1 | `summary` | Summary | what the screen is for, who uses it — 3 sentences max |
| 2 | `map` | Screen map | full mock with numbered pins + a legend: one line per pin saying what that part *does* |
| 3 | `sections` | Each section | one block per card/section: what it shows, where numbers come from, states (loaded, empty, loading, error, denied, plan-gated) as small state mocks |
| 4 | `actions` | What you can do here | one animated flow per action: every dialog, drawer, form (with validation + unsaved-changes prompt), confirmation, quick action, filter |
| 5 | `messages` | Messages and notifications | table: exact text · kind · when it appears · what to do — every alert, banner, toast, badge, inline error, empty-state text, email/push |
| 6 | `tips` | Getting the most out of it | practical tips, one line each |
| 7 | `roles` | Who sees what | role / plan / flag gating table |
| 8 | `sources` | Sources and open questions | file paths read; numbered open questions |

Adapt only with reason: a flow chapter can merge 2 and 3; a frame chapter has many small maps;
Part IV chapters have their own structure (`references/part-iv-briefs.md`). Keep the ids: scripts rely on them.

## 4. The pipeline

Model routing: **strong model** for scoping, the pilot, Part IV (patterns, audit, proposals) and final
polish; **standard model** for chapters, QA, halving, inventory. Use a **worktree per agent** when agents
commit or when the main tree is dirty; otherwise agents never commit and you commit per wave with a
pathspec (`git add docs/<book> .planning/<book>` — never `git add -A`).

| Phase | Who | What | Done means |
|---|---|---|---|
| 0 Scope | 2 inventory agents → you | §1 | inventory + chapter list + demo data in the plan |
| 1 Plan | you | create `.planning/<book>/PLAN.md` from `references/plan-template.md`, with one checkbox per chapter; copy assets to `<book>/assets`, `build-index.mjs` to `<book>/scripts/` | plan committed |
| 2 Pilot | 1 agent, strong | port tokens + icons, build the cover and chapter 01 (the most representative screen) from `chapter-template.html`, extend the kit, write the kit notes into the plan's Notes | passes `check-chapter.mjs` at 1440 + 390 + PDF; you looked at the screenshots |
| ✋ | user | **style approval** of chapter 01 (send the file path and 3 screenshots) | approved or changes applied |
| 3 Waves | parallel agents, 2–3 chapters each, ≤ 8 at a time | `references/chapter-brief.md` | each chapter passes `check-chapter.mjs`; notes file written; you tick boxes, link chapters on the cover, run `css-dupes.mjs`, commit the wave |
| 4 QA | agents per range of ~8 chapters | `references/qa-brief.md` — redo phone + print checks, flows to final frame, legends vs pins, links, copy-fidelity sample, duplicate selectors | table chapter → clean/fixed/open; `check-links.mjs` clean |
| 5 Part IV | 3 agents, strong (patterns ∥ audit; proposals after audit) | `references/part-iv-briefs.md` | patterns chapter, audit chapter + developer audit `.md` with stable IDs, proposals chapter |
| ✋ | user | **audit decisions**: the critical findings and which proposals to take | answered or parked in the plan |
| 6 Polish | you or 1 agent | cover statuses, prev/next, colophon, final check run over all pages | everything green |
| 7 Halving (optional) | agents per range | `references/short-brief.md` | prose ≤ 50% (measured) on every chapter, checks green |
| 8 Extras (optional) | 1 agent | chat page (`references/chat-page.md`), PDF (`references/pdf.md`), artifact | link handed to the user |

Parallelism rules (each was learned the hard way):
- Chapter files and notes files are disjoint per agent. Shared files (`mock.css`, the plan) are edited
  **only by appending** under a per-chapter comment block, **re-reading the tail right before each edit**.
  `book.css`, `book.js`, the cover: you only (agents report needed changes).
- Kit classes: search before adding; reuse another chapter's piece; chapter-only pieces get a chapter prefix
  (`.m-bil-row`). Run `css-dupes.mjs --chapters <book>` after each wave.
- Scratch files (scripts, screenshots) go to a per-agent folder outside the repo with unique script names.
- Nobody but you touches git. "Done" reports are claims: QA redoes phone and print checks.
- Give each agent its neighbours' file names and titles for prev/next links.

## 5. Quality bar (what "good" looks like; QA checks it)

- Opens from `file://` with no console errors, no missing icons, no sideways page scroll at 1440 and 390.
- Every flow steps 1 → `data-final`, the picture changes in step with the list, the final frame means
  something; print shows final frames.
- Every map: pins 1..N inside the element they label, one legend line per pin, each line says what the
  part **does or shows** in under ~15 words — never "Name + Details".
- Labels inside mocks exist in the code; copy-fidelity sample ≥ 90% (search 10 quoted strings per chapter).
- No boxes or paragraphs about the book itself (its pictures, data or method). Content callouts
  ("If it fails", "On a phone", "Known mismatch") are fine.
- Every statement traces to a file in Sources. Open questions are real questions for the product owner.

## 6. The halving pass (optional, after the user has read the book)

Target: reader-facing prose ≤ 50% of the current count, measured by `scripts/prose-count.mjs`
(`--save` before, `--base` after; same exclusions as the Romanian detector). Cutting alone stalls at
60–70%: facts must **move** into legends, tables, callouts, captions and small state mocks; nothing factual
is dropped; the messages table, roles table, sources and open questions stay complete. Expect two passes.
Halve chapter 01 first and get it approved as the model. For Romanian books use the `text-uman` skill and
its detector (`scripts/detect.mjs`) if installed: aim for 0–1 tells per 1,000 words. For other languages
use `humanizer` / `avoid-ai-writing` if available.

## 7. Optional outputs

- **Ask the book** (`references/chat-page.md`): `build-index.mjs` turns chapters into retrievable records
  + figures; `chat.html` answers with Claude via the artifact `sample` capability, citing chapters and
  embedding live flows; offline it falls back to BM25 search.
- **PDF** (`references/pdf.md`): one A4 PDF per chapter via `print-pdf.mjs`, merged with `pdfunite`/`qpdf`
  if present; `--one-page` for a single tall page (one-pagers).
- **Publishing as an artifact**: publish the chat page (or the cover) as the page and the rest through
  `files`. The published page is served at the root, so a supporting file named `index.html` collides:
  keep the cover as `cuprins.html`/`contents.html`. Chapters + assets can exceed one publish's limits —
  publish in batches to the same URL; the index/figures JSON can be several MB (prefer the `.json`, the
  `.js` twins exist only for `file://`).

## 8. What to tell the user (checkpoints)

Keep each message short, action first.
1. After scoping: the chapter list (parts + one line each), demo data, language, and where the book will
   live. Proceed unless they object.
2. After the pilot: "Chapter 01 is ready for your eye" + path + 3 screenshots (map, one flow, phone).
   Ask only: approve the style, or what to change. **Do not start waves before approval.**
3. After each wave: chapters done, anything not finished, the top 3 open questions.
4. After the audit: the critical findings (verified in code) and the decisions needed; proposals grouped
   by journey with effort/priority. Ask which to take.
5. At the end: how to open it (`cuprins.html`), what is optional next (halving, chat, PDF), the link if published.
