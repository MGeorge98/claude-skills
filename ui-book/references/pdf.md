# PDF

`book.css` already prints as a book: A4, each section on a new page, top bar and controls hidden, flows on
their final frame (book.js listens to `beforeprint`), backgrounds kept.

## Whole book
`node {{SKILL}}/scripts/print-pdf.mjs <book>/cuprins.html <book>/[0-9][0-9]-*.html --out {{SCRATCH}}/pdf`
then merge if a tool exists: `pdfunite cuprins.pdf 01-*.pdf … book.pdf` (poppler) or
`qpdf --empty --pages *.pdf -- book.pdf`. No tool → hand over the folder; do not install without asking.
Check: open 2–3 chapter PDFs and look at a flow page and a table page.

## One-page PDF (one-pager, poster, a single chapter summary)
`node {{SKILL}}/scripts/print-pdf.mjs page.html --one-page --screen --out page.pdf [--width 1240]`
lays the page out at `--width` CSS px with screen CSS and prints it on one 210 mm wide page of its full
height. Animations must be on their final frame (book.js does it on `beforeprint`; other pages need
`@media print` rules or a static variant).

## Gotchas
- Fonts load from the network: wait for `document.fonts.ready` (the script does) or the PDF falls back.
- Very wide mocks: print uses the page width; a `.stacked` flow prints better than a side-by-side one.
- Huge PDFs (> 5 MB per chapter) come from many large mocks with shadows; acceptable, but say so.
