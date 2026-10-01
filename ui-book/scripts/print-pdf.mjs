#!/usr/bin/env node
// print-pdf.mjs — print pages to PDF with the book's print CSS (flows on their final frame).
//
//   node print-pdf.mjs <page.html ...> --out DIR            one A4 PDF per page
//   node print-pdf.mjs <page.html> --one-page --out file.pdf  the whole page on ONE tall page
//                                                            (a one-pager / poster; width 210mm)
//   [--width 1240]   viewport width used to lay out a --one-page render (CSS px)
//   [--screen]       use screen CSS instead of print CSS (for one-pagers designed for screen)
//   [--repo DIR]     where to look for Playwright
//
// Merging chapter PDFs into one book needs a PDF tool; if `pdfunite` (poppler) or
// `qpdf` is installed: pdfunite cover.pdf 01-*.pdf … book.pdf. Otherwise hand over the folder.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadPlaywright, argv } from "./_pw.mjs";

const a = argv({ out: "str", "one-page": "bool", width: "str", screen: "bool", repo: "str" });
const files = a._.map((f) => path.resolve(f));
if (!files.length || !a.out) { console.error("usage: node print-pdf.mjs <page.html ...> --out DIR|file.pdf [--one-page] [--screen]"); process.exit(64); }
const { chromium } = await loadPlaywright(a.repo, path.dirname(files[0]));
const browser = await chromium.launch();
const done = [];
for (const file of files) {
  const width = Number(a.width || 1240);
  const ctx = await browser.newContext({ viewport: { width, height: 1200 } });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  if (!a.screen) await page.emulateMedia({ media: "print" });
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  await page.waitForTimeout(400);
  let out;
  if (a["one-page"]) {
    out = a.out.endsWith(".pdf") ? a.out : path.join(a.out, path.basename(file, ".html") + ".pdf");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const h = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    // keep the layout width; scale to 210mm wide (≈ 794 CSS px at 96 dpi)
    const scale = Math.min(1, 794 / width);
    await page.pdf({ path: out, width: "210mm", height: Math.ceil(h * scale + 2) + "px", scale, printBackground: true, pageRanges: "1" });
  } else {
    fs.mkdirSync(a.out, { recursive: true });
    out = path.join(a.out, path.basename(file, ".html") + ".pdf");
    await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  }
  done.push({ file, pdf: out, bytes: fs.statSync(out).size });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(done, null, 2));
