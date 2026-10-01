#!/usr/bin/env node
/* =====================================================================
   UI Book — build-index.mjs   (copy to <book>/scripts/)
   Run: node <book>/scripts/build-index.mjs [bookDir]
   bookDir defaults to the parent of scripts/ (or the cwd).
   No dependencies. Language-neutral: labels follow <html lang> (en, ro built in).

   What it expects from chapters (the chapter template already does this):
   - files named NN-slug.html in bookDir; <h1> = chapter title
   - <body data-part="…"> names the part (else the .hero-kicker text is used)
   - section.sec ids: summary map sections actions messages tips roles sources
     (Romanian ids from the reference book — mesaje, cine, surse — also work)
   - Part IV: article.au-f = audit finding, article.px-p = proposal,
     ol.pt-rules = pattern rules, table.findings = one finding per row,
     section[data-findings] h3 = one finding per heading.
 Reads every chapter, adds missing `id` attributes to
   the headings / blocks / figures it needs to link to (idempotent: a
   second run changes nothing), then writes
     assets/book-index.json    one record per retrievable unit
     assets/book-figures.json  figure HTML keyed by id (+ sprite symbols
                               and chapter-only CSS), loaded lazily
     assets/book-index.js / book-figures.js  the same data as scripts,
                               so chat.html also works from file://
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BOOK = path.resolve(process.argv[2] || (path.basename(HERE) === "scripts" ? path.join(HERE, "..") : process.cwd()));
const ASSETS = path.join(BOOK, "assets");

/* ------------------------------------------------------------ parser -- */
const VOID = new Set("area base br col embed hr img input link meta source track wbr".split(" "));
const BLOCK = new Set("address article aside blockquote div dl fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr main nav ol p pre section table ul".split(" "));

function parseAttrs(s) {
  const a = {};
  const re = /([^\s=/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(s))) a[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return a;
}

function parse(src) {
  const root = { tag: "#root", attrs: {}, children: [], parent: null, start: 0, end: src.length };
  let cur = root;
  const re = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let last = 0, m;
  const closeTo = (n, at) => { let k = cur; while (k !== n) { k.end = at; k = k.parent; } };
  while ((m = re.exec(src))) {
    if (m.index > last) cur.children.push({ text: src.slice(last, m.index), parent: cur });
    last = re.lastIndex;
    if (m[0][1] === "!") continue;
    if (m[1]) {
      const t = m[1].toLowerCase();
      let n = cur;
      while (n && n.tag !== t) n = n.parent;
      if (n && n !== root) { closeTo(n, m.index); n.end = re.lastIndex; cur = n.parent; }
      continue;
    }
    const tag = m[2].toLowerCase();
    const attrStr = m[3] || "";
    // implicit closes the browser would do
    if (cur.tag === "p" && BLOCK.has(tag)) { cur.end = m.index; cur = cur.parent; }
    if ((tag === "li" && cur.tag === "li") || ((tag === "td" || tag === "th") && (cur.tag === "td" || cur.tag === "th")) || (tag === "tr" && cur.tag === "tr")) { cur.end = m.index; cur = cur.parent; }
    const node = { tag, attrs: parseAttrs(attrStr), children: [], parent: cur, start: m.index, tagEnd: re.lastIndex };
    cur.children.push(node);
    if (VOID.has(tag) || /\/\s*$/.test(attrStr)) { node.end = re.lastIndex; continue; }
    if (tag === "script" || tag === "style") {
      const ci = src.toLowerCase().indexOf("</" + tag, re.lastIndex);
      const ce = src.indexOf(">", ci) + 1;
      node.children.push({ text: src.slice(re.lastIndex, ci), parent: node, raw: true });
      node.end = ce; re.lastIndex = ce; last = ce;
      continue;
    }
    cur = node;
  }
  if (last < src.length) cur.children.push({ text: src.slice(last), parent: cur });
  while (cur !== root) { cur.end = src.length; cur = cur.parent; }
  return root;
}

const cls = (n) => (n && n.attrs && n.attrs.class ? n.attrs.class.split(/\s+/) : []);
const has = (n, c) => cls(n).includes(c);
const els = (n) => (n.children || []).filter((c) => c.tag);
function find(n, pred, out = []) {
  for (const c of els(n)) { if (pred(c)) out.push(c); find(c, pred, out); }
  return out;
}
const first = (n, pred) => find(n, pred)[0] || null;
function closest(n, pred) { while (n && n.tag) { if (pred(n)) return n; n = n.parent; } return null; }

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", bdquo: "„", ndash: "–", mdash: "—", hellip: "…", middot: "·", times: "×", rarr: "→", larr: "←", darr: "↓", uarr: "↑", copy: "©", deg: "°", minus: "−", thinsp: " ", ensp: " ", emsp: " ", laquo: "«", raquo: "»", bull: "•", shy: "" };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? all);

const SPACED = new Set([...BLOCK, "li", "td", "th", "tr", "br", "small", "dt", "dd", "summary", "details", "thead", "tbody", "span", "b", "strong", "em", "i", "code", "a", "label"]);
const isMock = (n) => has(n, "m-stage") || has(n, "m-screen");
// plain text of a node; `skip(node)` returns true for subtrees to leave out
function text(n, skip) {
  let out = "";
  (function walk(x) {
    for (const c of x.children || []) {
      if (!c.tag) { if (!c.raw) out += decode(c.text); continue; }
      if (c.tag === "svg" || c.tag === "script" || c.tag === "style" || c.tag === "template") continue;
      if (isMock(c) || (skip && skip(c))) continue;
      const sp = SPACED.has(c.tag);
      if (sp) out += " ";
      walk(c);
      if (sp) out += " ";
    }
  })(n);
  return out.replace(/\s+/g, " ").replace(/\s+([,.;:!?)”])/g, "$1").replace(/([(„])\s+/g, "$1").trim();
}

/* ------------------------------------------------------------ helpers -- */
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[şș]/gi, "s").replace(/[ţț]/gi, "t").toLowerCase();
const slug = (s, max = 40) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max).replace(/-+$/, "") || "x";
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s);

const LABELS = {
  en: { summary: "summary", map: "Screen map", steps: "Steps", step: "step", part: "part", article: "article" },
  ro: { summary: "pe scurt", map: "Harta ecranului", steps: "Pașii", step: "pasul", part: "parte", article: "articol" }
};
let L = LABELS.en;
const MESSAGE_IDS = new Set(["messages", "mesaje"]);
const ROLE_IDS = new Set(["roles", "cine"]);
const SOURCE_IDS = /^(sources|surse)/;
function partOf(root) {
  const body = first(root, (n) => n.tag === "body");
  if (body && body.attrs["data-part"]) return body.attrs["data-part"];
  const k = first(root, (n) => has(n, "hero-kicker"));
  return k ? text(k).split("·")[0].trim() : "";
}

/* ------------------------------------------------------------ id pass -- */
// Decide which elements need an id; returns [{node, id}] for the missing ones.
function planIds(root) {
  const used = new Set(find(root, (n) => n.attrs.id).map((n) => n.attrs.id));
  const want = [];
  const give = (node, base) => {
    if (node.attrs.id) return node.attrs.id;
    let id = base, k = 2;
    while (used.has(id)) id = base + "-" + k++;
    used.add(id);
    node.attrs.id = id;
    want.push({ node, id });
    return id;
  };
  for (const sec of find(root, (n) => n.tag === "section" && has(n, "sec"))) {
    const secId = sec.attrs.id || give(sec, "sec-" + slug(text(first(sec, (n) => n.tag === "h2") || sec), 30));
    let ctx = secId;
    (function walk(n) {
      for (const c of els(n)) {
        if (c.tag === "figure" && has(c, "flow")) {
          give(c, "flow-" + slug(text(first(c, (x) => has(x, "flow-title")) || c), 30));
          continue;
        }
        if (c.tag === "div" && has(c, "part")) {
          const h = first(c, (x) => /^h[34]$/.test(x.tag));
          const pid = give(c, "p-" + slug(h ? text(h) : L.part, 30));
          const keep = ctx; ctx = pid; walk(c); ctx = keep;
          continue;
        }
        if (c.tag === "article") {
          const h = first(c, (x) => /^h[34]$/.test(x.tag));
          const aid = give(c, (has(c, "au-f") ? "f-" : "a-") + slug(h ? text(h) : L.article, 34));
          const keep = ctx; ctx = aid; walk(c); ctx = keep;
          continue;
        }
        if (c.tag === "h3" && c.parent === sec) { ctx = give(c, secId + "-" + slug(text(c), 34)); continue; }
        if (c.tag === "figure" && has(c, "map")) {
          const st = first(c, (x) => has(x, "m-stage"));
          if (st) give(st, "map-" + slug(ctx.replace(/^(p|sec|flow)-/, ""), 28));
          continue;
        }
        if (c.tag === "div" && has(c, "states")) { give(c, "st-" + ctx.replace(/^(p|st|fig)-/, "")); continue; }
        if (c.tag === "figure" && (has(c, "fig") || has(c, "state"))) { give(c, "fig-" + ctx.replace(/^(p|st|fig)-/, "")); continue; }
        walk(c);
      }
    })(sec);
  }
  return want;
}

function addIds(file) {
  const src = fs.readFileSync(file, "utf8");
  const want = planIds(parse(src));
  if (!want.length) return 0;
  let out = src;
  want.sort((a, b) => b.node.start - a.node.start).forEach(({ node, id }) => {
    const at = node.start + 1 + node.tag.length;
    out = out.slice(0, at) + ' id="' + id + '"' + out.slice(at);
  });
  fs.writeFileSync(file, out);
  return want.length;
}

/* ------------------------------------------------------------ records -- */
function buildChapter(file, src, figures, symbols, styles) {
  const root = parse(src);
  const num = Number(file.slice(0, 2));
  const h1 = first(root, (n) => n.tag === "h1");
  const chapter = { number: num, slug: file.replace(/\.html$/, ""), title: h1 ? text(h1) : file, part: partOf(root), file };
  const recs = [];
  const ids = new Set();
  const N = String(num).padStart(2, "0");
  const rec = (r) => {
    let id = N + "-" + r.id, k = 2;
    while (ids.has(id)) id = N + "-" + r.id + "-" + k++;
    ids.add(id);
    const o = { id, chapter: { number: num, slug: chapter.slug, title: chapter.title, part: chapter.part }, section: r.section, sectionId: r.sectionId, kind: r.kind, title: clip(r.title || r.section, 160), text: clip(r.text, r.max || 2400), href: file + "#" + r.anchor };
    if (r.figureId) o.figureId = r.figureId;
    if (o.text || o.kind === "flow") recs.push(o);
    return o;
  };
  const addFig = (id, node, kind, title, extra = "") => {
    const key = N + ":" + id;
    if (!figures[key]) figures[key] = { kind, title: clip(title, 140), chapter: num, href: file + "#" + id, html: src.slice(node.start, node.end) + extra };
    return key;
  };

  // sprite symbols + chapter CSS
  for (const s of find(root, (n) => n.tag === "symbol" && n.attrs.id)) if (!symbols[s.attrs.id]) symbols[s.attrs.id] = src.slice(s.start, s.end);
  for (const s of find(root, (n) => n.tag === "style" && !closest(n.parent, (x) => x.tag === "svg"))) styles.push("/* " + file + " */\n" + s.children[0].text);

  const secs = find(root, (n) => n.tag === "section" && has(n, "sec"));
  const lede = first(root, (n) => has(n, "hero-lede"));
  if (lede && secs[0]) rec({ id: "intro", kind: "lead", section: chapter.title, sectionId: secs[0].attrs.id, title: chapter.title + ": " + L.summary, text: text(lede), anchor: secs[0].attrs.id });

  for (const sec of secs) {
    const h2 = first(sec, (n) => n.tag === "h2");
    const section = h2 ? text(h2, (x) => has(x, "n")) : sec.attrs.id;
    const secId = sec.attrs.id;
    const secKind = MESSAGE_IDS.has(secId) ? "message-row" : ROLE_IDS.has(secId) ? "role-rule" : null;
    const tableKindOf = (t) => (has(t, "findings") ? "finding" : secKind);
    const findingHeads = sec.attrs["data-findings"] !== undefined;
    const recS = (r) => rec({ sectionId: secId, ...r });

    let block = null;
    const open = (title, anchor, kind = "section-block", figTitle) => { flush(); block = { title, anchor, kind, parts: [], figureId: null, figTitle: figTitle || title }; };
    const flush = () => {
      if (!block) return;
      const t = block.parts.join(" ").replace(/\s+/g, " ").trim();
      if (t.length > 50 || block.figureId) recS({ id: slug(block.anchor, 48), kind: block.kind, section, title: block.title, text: t, anchor: block.anchor, figureId: block.figureId });
      block = null;
    };
    const ensure = () => { if (!block) open(section, secId); };
    const special = (c) => (c.tag === "figure" && (has(c, "flow") || has(c, "fig") || has(c, "state"))) || (c.tag === "div" && (has(c, "part") || has(c, "states"))) || c.tag === "article" ||
      (c.tag === "ol" && (has(c, "legend") || has(c, "tips") || has(c, "checks") || has(c, "pt-rules"))) || (c.tag === "p" && has(c, "lead")) || (c.tag === "table" && tableKindOf(c)) || has(c, "part-head") || has(c, "pt-head") || has(c, "px-h") || has(c, "au-f-h");

    function doFlow(f) {
      const tEl = first(f, (x) => has(x, "flow-title"));
      const title = tEl ? text(tEl, (x) => has(x, "flow-n")) : L.steps;
      const sub = first(f, (x) => has(x, "flow-sub"));
      const note = first(f, (x) => has(x, "flow-note"));
      const steps = find(f, (x) => x.tag === "li" && x.parent && has(x.parent, "flow-steps"));
      const fid = addFig(f.attrs.id, f, "flow", title);
      const stepTxt = steps.map((li, i) => (i + 1) + ". " + text(li));
      recS({ id: f.attrs.id, kind: "flow", section, title, text: [sub ? text(sub) : "", stepTxt.join(" "), note ? text(note) : ""].join(" ").trim(), anchor: f.attrs.id, figureId: fid });
      steps.forEach((li, i) => {
        const b = first(li, (x) => x.tag === "b");
        recS({ id: f.attrs.id + "-s" + (i + 1), kind: "flow-step", section, title: title + " · " + L.step + " " + (i + 1) + ": " + (b ? text(b) : clip(text(li), 60)), text: text(li), anchor: f.attrs.id, figureId: fid, max: 700 });
      });
    }

    function doTable(t, kind, anchor) {
      const heads = find(t, (x) => x.tag === "th" && closest(x, (y) => y.tag === "thead")).map((x) => text(x));
      let group = "";
      for (const tr of find(t, (x) => x.tag === "tr" && !closest(x, (y) => y.tag === "thead"))) {
        const cells = els(tr).filter((x) => x.tag === "td" || x.tag === "th");
        if (!cells.length) continue;
        if (has(tr, "grp") || (cells.length === 1 && cells[0].attrs.colspan)) { group = text(tr); continue; }
        const vals = cells.map((c) => text(c));
        const body = vals.map((v, i) => (heads[i] && i ? heads[i] + ": " : "") + v).join(" · ");
        recS({ id: (kind === "message-row" ? "msg-" : kind === "role-rule" ? "role-" : "f-") + slug(vals[0], 36), kind, section, title: (group && kind !== "role-rule" ? group + " › " : "") + clip(vals[0], 110), text: body, anchor, max: 1200 });
      }
    }

    function walk(n) {
      for (const c of n.children || []) {
        if (!c.tag) { const t = decode(c.text).trim(); if (t) { ensure(); block.parts.push(t); } continue; }
        if (c.tag === "svg" || c.tag === "script" || c.tag === "style" || isMock(c)) continue;

        if (c.tag === "figure" && has(c, "flow")) { doFlow(c); continue; }

        if (c.tag === "div" && has(c, "part")) {
          const h = first(c, (x) => /^h[34]$/.test(x.tag));
          const keep = block && block.anchor === secId ? null : block && { ...block };
          open(h ? text(h) : section, c.attrs.id);
          walk(c);
          flush();
          if (keep) block = { ...keep, parts: [], figureId: null };
          continue;
        }
        if (c.tag === "article") {
          const h = first(c, (x) => /^h[34]$/.test(x.tag));
          const kind = has(c, "px-p") ? "proposal" : has(c, "au-f") ? "finding" : "section-block";
          const tag = first(c, (x) => has(x, "px-id") || has(x, "au-id"));
          const htxt = h ? text(h, (x) => has(x, "px-id") || has(x, "au-id") || has(x, "px-tag")) : section;
          open((c.attrs.id && /^ux-\d+/.test(c.attrs.id) ? c.attrs.id.toUpperCase() + " · " : tag ? text(tag) + " · " : "") + htxt, c.attrs.id, kind);
          walk(c);
          flush();
          continue;
        }
        if (c.tag === "h3" && c.parent === sec) {
          const kind = findingHeads ? "finding" : "section-block";
          open(text(c), c.attrs.id, kind);
          continue;
        }
        if (c.tag === "p" && has(c, "lead")) { recS({ id: secId + "-lead", kind: "lead", section, title: section, text: text(c), anchor: secId }); continue; }

        if (c.tag === "ol" && has(c, "legend")) {
          const sel = c.attrs["data-map"] || "";
          const stage = sel ? first(root, (x) => x.attrs.id === sel.slice(1)) : null;
          const fig = stage ? closest(stage, (x) => x.tag === "figure") || stage : null;
          // the map's heading: the h3.map-h just before it
          let hd = null;
          if (fig) { const sib = (fig.parent.children || []).filter((x) => x.tag); const i = sib.indexOf(fig); for (let k = i - 1; k >= 0; k--) if (/^h[34]$/.test(sib[k].tag)) { hd = sib[k]; break; } }
          const title = L.map + (hd ? ": " + text(hd) : "");
          const items = els(c).filter((x) => x.tag === "li").map((li, i) => (i + 1) + ". " + text(li));
          const fid = stage ? addFig(stage.attrs.id, fig, "map", title, "\n" + src.slice(c.start, c.end)) : null;
          recS({ id: "map-" + slug(stage ? stage.attrs.id.replace(/^map-/, "") : "x", 30), kind: "legend", section, title, text: items.join(" "), anchor: stage ? stage.attrs.id : secId, figureId: fid });
          continue;
        }
        if (c.tag === "ol" && (has(c, "tips") || has(c, "checks") || has(c, "pt-rules"))) {
          const kind = has(c, "tips") ? "tip" : has(c, "checks") ? "verify-item" : "pattern-rule";
          const anchor = block ? block.anchor : secId;
          els(c).filter((x) => x.tag === "li").forEach((li, i) => {
            const tagEl = first(li, (x) => has(x, "pt-tag"));
            const b = kind === "pattern-rule" ? null : first(li, (x) => x.tag === "b");
            const body = text(li, (x) => has(x, "pt-tag"));
            const label = b ? text(b) : clip(body.split(/(?<=[.!?])\s/)[0], 120);
            recS({ id: (kind === "tip" ? "tip-" : kind === "verify-item" ? "open-" : "rule-") + slug(label, 36), kind, section, title: (kind === "pattern-rule" && block ? block.title + " › " : "") + (tagEl ? text(tagEl) + ": " : "") + clip(label, 120), text: (tagEl ? text(tagEl) + ": " : "") + body, anchor, max: 1200 });
          });
          continue;
        }
        if (c.tag === "table" && tableKindOf(c)) { doTable(c, tableKindOf(c), block ? block.anchor : secId); continue; }

        if ((c.tag === "div" && has(c, "states")) || (c.tag === "figure" && (has(c, "fig") || has(c, "state")))) {
          ensure();
          if (c.attrs.id) {
            const caps = text(c, (x) => x.tag === "div" && has(x, "flow-ctl"));
            const kind = has(c, "states") ? "states" : has(c, "map") ? "map" : "fig";
            const key = addFig(c.attrs.id, c, kind, block.figTitle);
            if (!block.figureId) block.figureId = key;
            if (caps) block.parts.push(caps);
          }
          continue;
        }
        if (has(c, "part-head") || has(c, "pt-head") || has(c, "px-h") || has(c, "au-f-h")) {
          // heading already used as the title; keep the rest of the head text
          const t = text(c, (x) => /^h[34]$/.test(x.tag));
          if (t) { ensure(); block.parts.push(t); }
          continue;
        }
        if (SPACED.has(c.tag) && block) block.parts.push(" ");
        if (c.tag === "h2" && c.parent === sec) { open(section, secId); continue; }
        walk(c);
      }
    }
    open(section, secId);
    walk(sec);
    flush();
  }
  return { chapter, recs };
}

/* ------------------------------------------------------------ main -- */
const files = fs.readdirSync(BOOK).filter((f) => /^\d\d-.*\.html$/.test(f)).sort();
if (!files.length) { console.error("No NN-slug.html chapters in " + BOOK); process.exit(1); }
const lang = (/<html[^>]*\blang="([a-z]{2})/i.exec(fs.readFileSync(path.join(BOOK, files[0]), "utf8")) || [])[1] || "en";
L = LABELS[lang.toLowerCase()] || LABELS.en;
if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS);
let added = 0;
for (const f of files) added += addIds(path.join(BOOK, f));

const figures = {}, symbols = {}, styles = [];
const chapters = [], records = [];
for (const f of files) {
  const { chapter, recs } = buildChapter(f, fs.readFileSync(path.join(BOOK, f), "utf8"), figures, symbols, styles);
  chapters.push(chapter);
  records.push(...recs);
}

const index = { version: 2, lang, built: new Date().toISOString().slice(0, 10), chapters, records };
const figs = { version: 1, symbols: Object.values(symbols).join(""), css: styles.join("\n"), figures };
const ij = JSON.stringify(index), fj = JSON.stringify(figs);
fs.writeFileSync(path.join(ASSETS, "book-index.json"), ij);
fs.writeFileSync(path.join(ASSETS, "book-figures.json"), fj);
fs.writeFileSync(path.join(ASSETS, "book-index.js"), "window.__BOOK_INDEX__=" + ij + ";\n");
fs.writeFileSync(path.join(ASSETS, "book-figures.js"), "window.__BOOK_FIGURES__=" + fj + ";\n");

/* ------------------------------------------------------------ summary -- */
const byKind = {}, byChap = {};
for (const r of records) {
  byKind[r.kind] = (byKind[r.kind] || 0) + 1;
  byChap[r.chapter.number] = (byChap[r.chapter.number] || 0) + 1;
}
const mb = (s) => (Buffer.byteLength(s) / 1048576).toFixed(2) + " MB";
console.log(`ids added to chapters: ${added}`);
console.log(`records: ${records.length} · figures: ${Object.keys(figures).length} · symbols: ${Object.keys(symbols).length}`);
console.log(`book-index.json ${mb(ij)} · book-figures.json ${mb(fj)}`);
console.log("\nper kind:");
for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log("  " + k.padEnd(14) + v);
console.log("\nper chapter:");
console.log(chapters.map((c) => "  " + String(c.number).padStart(2, "0") + " " + c.title.slice(0, 28).padEnd(28) + " " + String(byChap[c.number] || 0).padStart(4)).join("\n"));
