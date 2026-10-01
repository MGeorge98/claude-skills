# Part IV briefs — patterns, audit, proposals

Three chapters after the screen chapters and QA. Strong model for all three. Patterns and audit run in
parallel; proposals start when the audit has IDs. Inputs: every chapter, every notes file
(`{{NOTES_DIR}}/*.md`: "Patterns used" + "Inconsistencies"), and every chapter's "Open questions" list.
All three use the book's look (copy the pilot's frame), `<body data-chapter="patterns|audit|proposals">`
(so checks skip the eight-section rule), the kit for pictures, and Part IV classes in `book.css`.

## A. Pattern library — `40-patterns.html` (name in the book's language)
Goal: the shared building blocks, each with a picture and the rule for using it.
- Sections by family: frame (menu, header, tab bar) · data on screen (tables, cards, KPIs, badges, dates, money) · windows, forms and confirmations · response and states (toasts, empty, loading, error) · vocabulary · domain-specific families · a checklist for new screens.
- One block per pattern: `div.part > div.pt-head (span.pt-k "P1" + h3)`, one line "What it is", a `div.pt-trio` showing the pattern in each app/area side by side (`figure > .pt-cap + mock + figcaption`), then `ol.pt-rules`: `li > span.pt-tag ("Rule · code" | "Recommendation", class rec) + div` with the source path in `<small>`.
- Rules describe what the code does today; recommendations are marked as such and give the reason (chapter refs).

## B. Consistency audit — `41-audit.html` + `{{PLANNING}}/CONSISTENCY-AUDIT.md`
Goal: every inconsistency and suspected defect, merged, ranked and verified.
1. Collect raw items from all notes and Open questions; count them. Merge duplicates found from different screens.
2. Severity: **Critical** (the core promise fails, someone is told something false about money, or personal data is exposed) · **High** (breaks a core flow, misleads; workaround exists) · **Medium** · **Low** (polish, copy, dead code).
3. **Verify every Critical and High finding in code** (file + line), directly or with read-only verifier agents given an exact claim list; spot-check their answers. Status: Confirmed · Not confirmed (say what the code does) · Could not determine (say what would settle it) · Reported, not verified (only outside the critical group).
4. **Stable IDs** by theme prefix, e.g. `ACC` access · `PAY` money · `SEC` security/permissions · `LEG` personal data/legal · `FUN` functional · `CON` cross-area consistency · `TXT` copy · `LOW` chapter-local. IDs never change once published.
5. Developer `.md`: how to read it (inputs, verification, severity, ID prefixes) · summary table (raw items, distinct findings, by severity, verified counts) · "what the owners should know first" (3–5 items) · sections by prefix: ID, title, severity, status, chapters, evidence (file:line), what the code does, the user impact. Describes defects; does not prescribe code. Nothing is fixed.
6. Book chapter: what was read and how it was verified · the numbers (`.au-stats`) · the worst findings, each an `article.au-f` with `.au-f-h` (severity `.tone`, status `.au-st.ok|no|und|rep`, `.au-id`), h3 in plain words, two sentences, and a before/after or side-by-side state mock · "the same thing said differently" (a `section[data-findings]` whose h3s are findings, or `table.findings`) · other defects in tables · possible initiatives · sources and limits.
Checkpoint: hand the owner the critical findings and the decisions they need to make.

## C. UI/UX proposals — `42-proposals.html`
Goal: where to take the product next, grounded in the audit and the patterns.
- Where we are (one paragraph + numbers) · 5–7 principles (`ol` with do / don't lines) · the proposals at a glance (table: code, proposal, priority, effort, type, metric it moves).
- Proposals grouped **by user journey** (before, during, after the core job; the operator's day; when something fails; the internal team; shared foundations), each an `article.px-p` with `.px-h` (`.px-id` "UX-01", h3, `.px-tag` priority `now|next|later`, type `win|bet`) and fields: problem (with finding IDs as `.px-f`), proposal, a mock of the proposed screen (clearly labelled as a proposal), effort S/M/L, dependencies, metric, risks.
- Three waves at the end (what ships together and why). Effort is relative and says so.
- Proposed UI may use new labels (it is a proposal), but must not contradict a verified finding.
