# QA brief — {{BOOK_TITLE}}, chapters {{RANGE}}

The chapters were written by many agents in parallel. Each checked its own work, but some skipped the phone
or print checks, and all appended to the shared `mock.css` at the same time, so a chapter that was right
when written may have been broken later. Do a regression and consistency pass so the owner can read the
book end to end without hitting a broken page. Background: `{{PLAN_PATH}}`, `chapter-brief.md`; the pilot
`01-{{PILOT_SLUG}}.html` is the quality reference.

## Checks per chapter
1. **Automated**: `node {{SKILL}}/scripts/check-chapter.mjs <files> --shots {{SCRATCH}}/qa-{{RANGE}}/ --pdf {{SCRATCH}}/qa-{{RANGE}}/` — console errors, missing icons, overflow, flows to `data-final`, legends vs pins, links, sections.
2. **Look**: build downscaled contact sheets per chapter; inspect closely only where a sheet shows a problem: clipped/overlapping text in mocks, pins covering labels, dialogs/toasts outside the frame, flows whose picture does not change with the list, meaningless final frames — at 1440 **and** 390.
3. **Print**: the PDF breaks sections sensibly, flows show their final frame.
4. **Shared CSS**: `node {{SKILL}}/scripts/css-dupes.mjs {{BOOK_DIR}}/assets/mock.css --chapters {{BOOK_DIR}}` — look at the chapters that use any duplicated selector.
5. **Structure**: eight sections in order; top bar and footer like the pilot; prev/next point to the real neighbours with real titles (`check-links.mjs {{BOOK_DIR}}`).
6. **Copy fidelity (sample)**: 10 quoted strings per chapter from "Messages", searched in `{{CODE_DIRS}}`. Wrong → correct it or move it to Open questions. Report the hit rate.
7. **Language**: {{LANGUAGE}} throughout reader-facing text, no leftover sentences in another language, no code identifiers in prose.

## You may change
Your chapters (fix defects; do not rewrite style you merely dislike). `mock.css` only by appending at the END under `/* QA {{RANGE}} */`, narrowly scoped, re-reading the tail first. Off limits: `book.css`, `book.js`, other chapters, application code, git.

## Report
Under 300 words: table chapter → clean / fixed / still has issues; what you fixed; what you could not and why; copy-fidelity hit rate; any shared rule that is wrong for everyone; which checks you did not run. Be plain about gaps.
