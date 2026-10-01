#!/usr/bin/env node
// css-dupes.mjs — selectors defined by more than one chapter block of the shared mock.css.
// Many agents append to the same file; a second ".m-tabs" silently restyles the first
// chapter's picture. Run after every chapter wave and before QA. No dependencies.
//
//   node css-dupes.mjs <book>/assets/mock.css [--json] [--chapters <bookDir>]
//
// Blocks = the text between top-level comment headers ("/* ===…" banners or a
// "/* NN Title" comment at the start of a line). With --chapters, it also lists which
// chapter files use each duplicated class, so QA knows which pages to look at.
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const asJson = args.includes("--json");
const ci = args.indexOf("--chapters"), chapDir = ci > -1 ? args[ci + 1] : null;
if (!file) { console.error("usage: node css-dupes.mjs mock.css [--json] [--chapters bookDir]"); process.exit(64); }
const src = fs.readFileSync(file, "utf8");

// split into blocks at banner comments / chapter comments that start a line
const blocks = [];
let cur = { name: "base", start: 1, css: "" };
const lines = src.split("\n");
const header = /^\/\*\s*(={5,}|(\d\d|QA|short)\b)/;
let inComment = false;
lines.forEach((ln, i) => {
  if (!inComment && header.test(ln)) {
    // a banner: the name is the first non-"=" line inside it
    let name = ln.replace(/^\/\*\s*/, "").replace(/\*\/.*$/, "").replace(/=+/g, "").trim();
    if (!name) { for (let k = i + 1; k < Math.min(i + 4, lines.length); k++) { const t = lines[k].replace(/\*\/.*$/, "").replace(/=+/g, "").trim(); if (t) { name = t; break; } } }
    if (cur.css.trim()) blocks.push(cur);
    cur = { name: name.slice(0, 70) || "block@" + (i + 1), start: i + 1, css: "" };
  }
  const opens = (ln.match(/\/\*/g) || []).length, closes = (ln.match(/\*\//g) || []).length;
  if (opens > closes) inComment = true; else if (closes > opens) inComment = false;
  cur.css += ln + "\n";
});
if (cur.css.trim()) blocks.push(cur);

const owners = {};
for (const b of blocks) {
  const css = b.css.replace(/\/\*[\s\S]*?\*\//g, "");
  // drop @keyframes bodies; keep selectors inside @media
  const clean = css.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "");
  for (const m of clean.matchAll(/([^{}@;]+)\{[^{}]*\}/g)) {
    for (let sel of m[1].split(",")) {
      sel = sel.trim().replace(/\s+/g, " ");
      if (!sel || /^(from|to|\d+%)$/.test(sel)) continue;
      (owners[sel] = owners[sel] || new Set()).add(b.name);
    }
  }
}
const dupes = Object.entries(owners).filter(([, s]) => s.size > 1).map(([sel, s]) => ({ selector: sel, blocks: [...s] }));
if (chapDir) {
  const chapters = fs.readdirSync(chapDir).filter((f) => /^\d\d-.*\.html$/.test(f));
  const texts = Object.fromEntries(chapters.map((c) => [c, fs.readFileSync(path.join(chapDir, c), "utf8")]));
  for (const d of dupes) {
    const classes = [...d.selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
    d.usedIn = chapters.filter((c) => classes.every((k) => new RegExp(`class="[^"]*\\b${k}\\b`).test(texts[c])));
  }
}
if (asJson) console.log(JSON.stringify({ blocks: blocks.map((b) => ({ name: b.name, line: b.start })), dupes }, null, 2));
else {
  console.log(`${blocks.length} blocks · ${Object.keys(owners).length} selectors · ${dupes.length} defined in more than one block`);
  for (const d of dupes) console.log(`  ${d.selector}\n      in: ${d.blocks.join(" | ")}${d.usedIn ? `\n      used by: ${d.usedIn.join(", ") || "-"}` : ""}`);
}
process.exit(0);
