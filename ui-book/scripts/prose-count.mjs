#!/usr/bin/env node
// prose-count.mjs — language-agnostic count of READER-FACING PROSE words in book pages,
// the number the halving pass is measured against. No dependencies.
//
//   node prose-count.mjs <file.html ...>                 table: words per file
//   node prose-count.mjs <file.html ...> --json          JSON
//   node prose-count.mjs <file.html ...> --save base.json   remember today's counts
//   node prose-count.mjs <file.html ...> --base base.json   compare: before → after (%)
//   node prose-count.mjs <file.html> --prose             print the prose it counted
//
// Same exclusions as the text-uman detector (Romanian), so numbers match it:
// skips <script> <style> <svg> <code> <pre> <table> <nav> <head> <template> <kbd>,
// mocks (.m-stage / .m-screen), quoted UI strings (.q, td.msg), the top bar,
// TOC chips, hero kicker, state labels, proposal ids/tags, and the "sources" section
// (id starting with sources / surse). Quoted UI copy and tables are not prose: they stay.
// A word = a token containing a letter or digit.
import fs from "node:fs";
import path from "node:path";

const SKIP_TAGS = new Set(["script", "style", "svg", "code", "pre", "table", "nav", "head", "template", "kbd", "samp", "noscript"]);
const SKIP_CLASS = /(^|\s)(m-stage|m-screen|q|msg|toc-chips|state-l|px-id|px-tag|px-chips|au-id|pt-k|pt-tag|part-where|book-nav|topbar[\w-]*|hero-kicker|crumbs?|breadcrumbs?|chips?)(\s|$)/;
const SKIP_ID = /^(surse|sources)/;
const VOID = new Set(["br", "img", "hr", "input", "meta", "link", "source", "wbr", "use", "col", "area", "base", "path"]);
const ENT = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", hellip: "…", mdash: "—", ndash: "–" };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? m);

export function prose(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)/g;
  const stack = []; let skip = 0, out = "", m;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) { if (!skip) out += decode(m[5]); continue; }
    const closing = m[1] === "/", tag = m[2].toLowerCase(), attrs = m[3] || "";
    if (/^(script|style)$/.test(tag) && !closing) { // jump over raw text
      const end = html.toLowerCase().indexOf("</" + tag, re.lastIndex);
      re.lastIndex = end < 0 ? html.length : end; continue;
    }
    if (!closing) {
      if (m[4] === "/" || VOID.has(tag)) { out += " "; continue; }
      const cls = (attrs.match(/class\s*=\s*"([^"]*)"/i) || [])[1] || "";
      const id = (attrs.match(/\bid\s*=\s*"([^"]*)"/i) || [])[1] || "";
      const s = !skip && (SKIP_TAGS.has(tag) || SKIP_CLASS.test(cls) || SKIP_ID.test(id));
      stack.push({ tag, s }); if (s) skip++;
      out += " ";
    } else {
      let i = stack.length - 1;
      while (i >= 0 && stack[i].tag !== tag) i--;
      if (i < 0) continue;
      for (let j = stack.length - 1; j >= i; j--) if (stack[j].s) skip--;
      stack.length = i;
      out += " ";
    }
  }
  return out.replace(/\s+/g, " ").trim();
}
export const countWords = (t) => (t.match(/[^\s]+/g) || []).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith("prose-count.mjs")) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const save = flag("--save"), base = flag("--base");
  const asJson = args.includes("--json"), showProse = args.includes("--prose");
  const files = args.filter((a) => !a.startsWith("--"));
  if (!files.length) { console.error("usage: node prose-count.mjs <file.html ...> [--json] [--save f.json] [--base f.json] [--prose]"); process.exit(64); }
  const before = base ? JSON.parse(fs.readFileSync(base, "utf8")) : {};
  const rows = files.map((f) => {
    const p = prose(fs.readFileSync(f, "utf8"));
    if (showProse) console.log(`--- ${f}\n${p}\n`);
    const key = path.basename(f), words = countWords(p);
    const b = before[key];
    return { file: key, words, before: b ?? null, pct: b ? Math.round((words / b) * 100) : null };
  });
  if (save) fs.writeFileSync(save, JSON.stringify(Object.fromEntries(rows.map((r) => [r.file, r.words])), null, 2));
  if (asJson) console.log(JSON.stringify(rows, null, 2));
  else if (!showProse) {
    for (const r of rows) console.log(r.file.padEnd(40) + String(r.words).padStart(7) + (r.before ? `  (was ${r.before} → ${r.pct}%${r.pct > 50 ? "  ABOVE 50%" : ""})` : ""));
    const tot = rows.reduce((a, r) => a + r.words, 0), totB = rows.reduce((a, r) => a + (r.before || 0), 0);
    console.log("TOTAL".padEnd(40) + String(tot).padStart(7) + (totB ? `  (was ${totB} → ${Math.round((tot / totB) * 100)}%)` : ""));
  }
}
