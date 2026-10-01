# Chapter brief — {{BOOK_TITLE}}

You are writing one or more chapters of {{BOOK_TITLE}}: an illustrated, animated handbook that teaches a
reader everything each screen of {{PRODUCT}} can do. It should read like a picture book — big pictures,
short sentences, one step at a time — and be complete: every section, every action, every notification.
Accuracy matters more than speed: the book is also used to audit the product.

Repo: `{{REPO}}`. Book folder: `{{BOOK_DIR}}`. Book language: **{{LANGUAGE}}** (`<html lang="{{LANG}}">`).

## Read first
1. `{{PLAN_PATH}}` — fixed decisions, the eight-section template, working rules, and under "Notes" the kit reference.
2. `{{BOOK_DIR}}/01-{{PILOT_SLUG}}.html` — the approved pilot. Match its structure, depth, tone and visual quality; copy it as your starting file.
3. The header comment of `{{BOOK_DIR}}/assets/mock.css` — kit reference + the demo data ({{DEMO_SUMMARY}}). Reuse that data; never invent another org.
4. The chapter blocks at the END of `mock.css` — pieces other chapters already built. Reuse before building.

## How to write a chapter
- Read the whole page source for your screen plus every component, dialog, drawer, hook it uses, and the API calls behind it. Server-generated text (notifications, errors, status labels) lives in `{{BACKEND_DIR}}`; read it there. UI strings: `{{I18N_DIR}}`.
- The inventory lines in your assignment are a starting point and are sometimes wrong (a "dialog" that is a card, a missing filter). Trust the code.
- Cover every state: loaded, empty, loading, error, permission-denied, plan-gated.
- One animated flow per action: every dialog, drawer, form, confirmation, quick action, filter. Forms show their validation messages and the unsaved-changes prompt where the screen has one.
- "Messages and notifications": every alert, banner, toast, badge, inline error and empty-state text, exact text from the code, when it appears, what to do.
- Detail pages named in your assignment go inside the parent chapter, with their own map and flows.
- Every label **inside a mock** must exist in the code. Only data (names, times, amounts) is fictional.
- Legends: one line per pin, saying what the part does or shows (under ~15 words). Never "Name + Details".
- No boxes or paragraphs about the book itself (its pictures, its data, its method).
- What you cannot confirm goes in "Open questions", not in the prose. Do not use `{{STALE_DIRS}}` (stale prototypes / old copies).

## Files you may create or edit
- `{{BOOK_DIR}}/NN-slug.html` for each assigned chapter (keep the eight section ids from the template).
- `{{NOTES_DIR}}/NN-slug.md` per chapter: **Patterns used** (page header, filters, tables, dialogs, confirmations, empty states, toasts, destructive actions, date/money formats) and **Inconsistencies / suspected bugs** (numbered, with file references). This feeds the audit.
- `{{BOOK_DIR}}/assets/mock.css` — only to append at the END under `/* NN Chapter title — pieces */`. Re-read the tail right before each edit; search the class name first; prefix chapter-only classes (`.m-xx-…`); never change or reorder existing rules.
Off limits: `book.css`, `book.js`, the cover, the plan, other chapters, all application code. Missing icon → inline a `<symbol id="i-name">` in your chapter. Shared-file bug → describe it in your report.
No git commands that change state.

## Done means
1. `node {{SKILL}}/scripts/check-chapter.mjs <your chapters> --shots {{SCRATCH}}/NN/ --pdf {{SCRATCH}}/NN/` exits 0 (1440 + 390: no console errors, no overflow, flows step to final, legends match pins, links resolve, eight sections).
2. You looked at the full-page screenshots and at least one per flow at both widths, and fixed overlaps, clipped text, broken flows.
3. Scratch scripts and screenshots only in `{{SCRATCH}}/NN/` (unique names; never the repo).
4. Every statement traces to a file in "Sources".

## Report
Under 150 words per chapter: file, counts (sections, flows, messages), what you verified and fixed, the top items from Open questions and your notes, anything unfinished. No file dumps.
