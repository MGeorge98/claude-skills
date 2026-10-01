# Halving brief — {{BOOK_TITLE}}, chapters {{RANGE}}

The owner asked for half the text and more UI, and for the remaining text to read as written by a careful
person. Chapter 01 went through this pass and was approved ({{BEFORE_01}} → {{AFTER_01}} prose words);
compare its old and new versions before you start.

## Measure
`node {{SKILL}}/scripts/prose-count.mjs <files> --save {{SCRATCH}}/short-{{RANGE}}/before.json` before,
`--base …/before.json` after. It counts reader-facing prose only (excludes mocks, quoted UI strings, tables,
top bar, sources). Target **≤ 50%** per chapter. Stop above 50% only when every remaining sentence carries a
fact that fits nowhere else; say so. Keep a copy of each original in the scratch folder.
{{IF_RO}} Romanian: follow the `text-uman` skill and run its detector (`detect.mjs`, `--prose` to see what it reads); aim for 0–1 tells / 1,000 words.

## Cut without losing facts (cutting alone stalls at 60–70%)
- Explanation moves into the picture: a fact the map or a flow shows becomes a legend line, a caption, a callout or a small state mock — add a pin if needed.
- Legend line: one line, under ~15 words, what the part shows or does. Never a bare name + "Details".
- Flow steps: one short action per step; `<small>` only when the picture cannot show it.
- Summary: 3 sentences max. Tips: a list, one line each.
- Keep intact: the messages table, roles table, sources, every condition, role rule, number, state, chapter/step reference. Open questions stay complete (tighter wording only).
- Remove any box or paragraph about the book itself. Content callouts stay, shortened.
- Part IV chapters: halve prose the same way but keep every rule (patterns), every finding ID and status (audit), every proposal field (proposals) and their tables.
- Nothing invented, nothing factual dropped. Then read only the result and ask: would a person write this?

## Verify and report
`check-chapter.mjs` exits 0 for each chapter (both widths, flows, legends 1..N). Report per chapter (≤ 120 words): words before → after (%), detector before → after if used, how many paragraphs became legend lines / callouts / mocks, what you refused to cut, the check result. Edit only your chapters; append to `mock.css` only under `/* short {{RANGE}} */`; no git.
