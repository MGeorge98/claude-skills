# ui-book (Claude Code skill)

Installed at `~/.claude/skills/ui-book/` (user level: available in every repo). Trigger: "fă-mi o carte
despre X", "UI book", "document the app/module/flow as a book".

## How to run it
1. Open the target repo in Claude Code and say: "fă-mi o carte despre <X>" (X = app, module, flow or prototype).
2. Claude scopes X with two inventory agents and proposes chapters, demo data, language and the book folder.
3. It writes `.planning/<book>/PLAN.md` from `references/plan-template.md` and copies `assets/` into `<book>/assets`.
4. The pilot chapter 01 is built on a strong model (tokens and icons ported, kit extended).
5. **Checkpoint: you approve the style of chapter 01.**
6. Chapter waves run in parallel (2–3 chapters per agent); Claude commits per wave.
7. QA agents re-check every chapter at 1440 / 390 / print with `scripts/check-chapter.mjs`.
8. Part IV: patterns, verified audit with stable IDs, proposals. **Checkpoint: audit decisions.**
9. Optional: halving pass (`prose-count.mjs`), "ask the book" page, PDF, artifact.
10. Open `<book>/cuprins.html`.

## Requirements
Node ≥ 18. Playwright only for `check-chapter.mjs` and `print-pdf.mjs` (found in the target repo's
`node_modules`, or `PLAYWRIGHT_PATH`; otherwise the script says how to install it in a scratch folder).
