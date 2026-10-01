# {{BOOK_TITLE}} — PLAN

An illustrated, animated handbook of {{SCOPE}} ({{SCOPE_KIND}}: app / module / flow / prototype), plus
patterns, a consistency audit and proposals. Requested {{DATE}}. Picture-book style: big pictures, short
sentences, one step at a time. Every agent working on the book reads this file first.

## Fixed decisions
- **Source of truth is the shipped code** under `{{CODE_DIRS}}`. `{{STALE_DIRS}}` are stale ({{WHY}}) and are not a source. Specs give intent; when spec and code differ the code wins and the difference is logged.
- **Nothing invented.** Every label, message, button and state — in prose and inside mocks — exists in the code, quoted exactly ({{LANGUAGE}}, as written). Unconfirmed → "Open questions".
- **Language:** {{LANGUAGE}}. Tone: warm, plain, second person. No code identifiers in reader-facing text.
- **Format:** static HTML, no build, opens from `file://`, prints as a book. Location `{{BOOK_DIR}}/`: `cuprins.html` (cover + contents), `NN-slug.html` per chapter, `assets/` (book.css, mock.css, book.js), `scripts/build-index.mjs`, optional `chat.html`.
- **Visuals are hand-built animated mocks**, not screenshots. Tokens from `{{TOKENS_PATH}}`; look reference `{{LOOK_REFS}}`. Light theme.
- **Demo data** (defined by the pilot; in the `mock.css` header): {{DEMO_DATA}}.

## Chapter template (section ids in brackets)
1 Summary [summary] · 2 Screen map [map] · 3 Each section [sections] · 4 What you can do here [actions] · 5 Messages and notifications [messages] · 6 Getting the most out of it [tips] · 7 Who sees what [roles] · 8 Sources and open questions [sources]. Headings in {{LANGUAGE}}: {{HEADINGS}}. Detail pages live inside their parent chapter.

## Animated mock contract
Defined in `assets/mock.css` (header = reference) and `assets/book.js`. Mocks are em-sized (`--w` = app width; 1em = 16 app px). Animation = CSS + `data-on` / `data-swap` / `data-state` ranges per step; book.js autoplays in view, syncs the step list, click-a-step freezes, print and reduced motion show `data-final`. Missing kit pieces are appended to mock.css under a chapter comment.

## Working rules
- Each agent edits only its chapter files and notes file; shared files only by appending, re-reading first. `book.css`, `book.js`, cover, this plan: orchestrator only (agents tick only their own checkboxes, if told to).
- No application code changes; bugs are logged, not fixed. Nobody commits; the orchestrator commits per wave with a pathspec.
- Notes per chapter: `{{NOTES_DIR}}/NN-slug.md` (patterns used + inconsistencies) — input of Part IV.
- Check before "done": `check-chapter.mjs` at 1440 + 390 + PDF, screenshots looked at. Scratch: `{{SCRATCH}}/NN/`.

## Chapters
### Wave 0 — pilot (sets the style)
- [ ] Scaffold: cover, assets, tokens + icons ported, demo data
- [ ] 01 {{PILOT_TITLE}} — `{{PILOT_ROUTE}}`
### Part I — {{PART_1}}
- [ ] 02 {{TITLE}} — incl. {{DETAIL_PAGES_DIALOGS}}
### Part II — {{PART_2}}
- [ ] 20 …
### Part IV — Patterns and consistency
- [ ] 40 Patterns · [ ] 41 Audit · [ ] `CONSISTENCY-AUDIT.md` · [ ] 42 Proposals
### Optional
- [ ] Halving pass · [ ] chat.html · [ ] PDF · [ ] artifact

## Notes
(agents append dated notes; the pilot writes the kit reference here: sizing, frames, pieces, static map, animated flow, demo data, how to check)
