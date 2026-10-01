# "Ask the book" page

A static page that answers questions from the book, with chapter citations and the live figure
(animated flow or screen map) embedded in the answer.

## Build
1. Copy `assets/build-index.mjs` to `<book>/scripts/` and `assets/chat.html` to `<book>/chat.html`.
2. Run `node <book>/scripts/build-index.mjs`. It adds missing `id`s to chapters (idempotent — commit the change), then writes `assets/book-index.json|.js` (one record per summary, section block, legend, flow, flow step, message row, role rule, tip, open question, finding, proposal, pattern rule) and `assets/book-figures.json|.js` (figure HTML + sprite symbols + inline chapter CSS). Re-run after any chapter edit.
3. Edit only the CONFIG block of `chat.html`: `book`, `about` (one sentence for Claude), `suggestions` (6–8 real questions, tagged by part), `parts` (words that name a part → part name from `<body data-part>`), `cover`. Set `<html lang>`; UI strings exist for `en` and `ro` — add a language by adding a `STR`, `STOPS` and `SUFS` entry, or override strings in `CONFIG.strings`.
4. Test offline: open `chat.html` from `file://`, ask 3 questions; results must show cards and the first figures must animate.

## How it answers
- **On claude.ai** (published as an artifact with the `sample` capability — load the `artifact-capabilities` skill first): the page retrieves the top 8 fragments with BM25, sends them with the question, and Claude answers in the book's language citing `[[id]]` markers, which render as chapter chips. With tools it may call `search_book`, `show_figure` (≤ 2 figures) and `get_chapter_outline`. Errors fall back gracefully (not granted → search mode).
- **Elsewhere**: lexical search results with highlighted terms, "show picture" and "open in chapter".
- Conversation is kept in `localStorage` per viewer only (convenience).

## Publish
- Publish `chat.html` as the page and everything else through `files` (chapters, cover, `assets/*`). The page is served at the root: no supporting file may be called `index.html` — keep the cover as `cuprins.html`/`contents.html`.
- Size: the index/figures JSON grows ~2–3 MB per 40 chapters each; `.js` twins are only for `file://` and can be left out of the artifact. Large books: publish in several batches to the same URL.
- Republish after rebuilding the index.
