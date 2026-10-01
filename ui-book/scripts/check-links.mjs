#!/usr/bin/env node
// check-links.mjs — every local href/src in every .html of a book folder resolves,
// including #anchors (same page or other page). No dependencies, no browser.
//
//   node check-links.mjs <bookDir> [--json]
//
// Also reports chapters missing from the cover (files NN-*.html that no page links to)
// and prev/next footers that skip a chapter. Exit 1 on any broken link.
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] || ".");
const asJson = process.argv.includes("--json");
const pages = fs.readdirSync(dir).filter((f) => /\.html?$/i.test(f)).sort();
const ids = {};
const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "");
for (const p of pages) ids[p] = new Set([...strip(fs.readFileSync(path.join(dir, p), "utf8")).matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]));

const broken = [], linked = new Set();
for (const p of pages) {
  const src = strip(fs.readFileSync(path.join(dir, p), "utf8"));
  for (const m of src.matchAll(/\s(href|src)=["']([^"']+)["']/g)) {
    const url = m[2];
    if (/^(https?:|mailto:|tel:|javascript:|data:|\{\{|#i-)/i.test(url) || url.includes("{{")) continue; // #i-* = icon sprite injected by book.js
    const [file, frag] = url.split("#");
    const target = file ? path.normalize(path.join(path.dirname(p), decodeURIComponent(file))) : p;
    if (file) linked.add(target);
    if (file && !fs.existsSync(path.join(dir, target))) { broken.push({ page: p, url, why: "file not found" }); continue; }
    if (frag && ids[target] && !ids[target].has(decodeURIComponent(frag))) broken.push({ page: p, url, why: "anchor not found" });
  }
}
const chapters = pages.filter((p) => /^\d\d-/.test(p));
const orphans = chapters.filter((c) => !linked.has(c));
// footer order: each chapter's last chap-foot link should be the next chapter
const order = [];
chapters.forEach((c, i) => {
  const src = fs.readFileSync(path.join(dir, c), "utf8");
  const foot = (src.match(/<nav class="chap-foot"[\s\S]*?<\/nav>/) || [""])[0];
  const hrefs = [...foot.matchAll(/href="([^"#]+)/g)].map((m) => m[1]);
  const next = chapters[i + 1];
  if (next && hrefs.length && !hrefs.includes(next)) order.push({ page: c, expectedNext: next, footer: hrefs });
});
const res = { dir, pages: pages.length, broken, orphans, footerOrder: order, ok: !broken.length };
if (asJson) console.log(JSON.stringify(res, null, 2));
else {
  console.log(`${pages.length} pages · ${broken.length} broken · ${orphans.length} chapters nobody links to · ${order.length} footers out of order`);
  broken.forEach((b) => console.log(`  BROKEN ${b.page} → ${b.url} (${b.why})`));
  orphans.forEach((o) => console.log(`  ORPHAN ${o}`));
  order.forEach((o) => console.log(`  FOOTER ${o.page}: expected ${o.expectedNext}, has ${o.footer.join(", ")}`));
}
process.exit(broken.length ? 1 : 0);
