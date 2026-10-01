#!/usr/bin/env node
// check-chapter.mjs — render chapters from file:// and check what agents tend to skip.
//
//   node check-chapter.mjs <chapter.html ...> [--widths 1440,390] [--shots DIR] [--pdf DIR] [--repo DIR]
//
// Per chapter and width: console errors, page errors, failed requests, missing icon
// symbols, horizontal page overflow, mocks overflowing their stage (desktop only),
// every flow stepped from 1 to data-final (targets exist and are visible, the step list
// follows), legends vs pins (pins numbered 1..N, one legend line per pin), local links
// and #anchors resolve, and the eight template sections are present (screen chapters).
// --shots saves one full-page PNG per width plus one PNG per flow at its final frame.
// --pdf prints one PDF per chapter (print media: flows must show their final frame).
// Output: JSON on stdout; exit code 1 when any chapter has errors.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadPlaywright, argv } from "./_pw.mjs";

const args = argv({ widths: "str", shots: "str", pdf: "str", repo: "str" });
const files = args._.map((f) => path.resolve(f));
if (!files.length) { console.error("usage: node check-chapter.mjs <chapter.html ...> [--widths 1440,390] [--shots DIR] [--pdf DIR]"); process.exit(64); }
const widths = (args.widths || "1440,390").split(",").map(Number);
const { chromium } = await loadPlaywright(args.repo, path.dirname(files[0]));
const browser = await chromium.launch();
const SECTIONS = ["summary", "map", "sections", "actions", "messages", "tips", "roles", "sources"];
const SECTIONS_RO = ["pe-scurt", "harta", "sectiuni", "actiuni", "mesaje", "maxim", "cine", "surse"];

const report = [];
for (const file of files) {
  const name = path.basename(file, ".html");
  const r = { file, errors: [], warnings: [], widths: {} };
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const out = { console: [], failed: [], flows: [], legends: [] };
    page.on("console", (m) => { if (m.type() === "error") out.console.push(m.text()); });
    page.on("pageerror", (e) => out.console.push("pageerror: " + e.message));
    page.on("requestfailed", (q) => out.failed.push(q.url()));
    await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
    await page.waitForTimeout(300);

    const stat = await page.evaluate(() => {
      const de = document.documentElement;
      const ids = new Set([...document.querySelectorAll("[id]")].map((e) => e.id));
      const missingIcons = [...new Set([...document.querySelectorAll("use")].map((u) => u.getAttribute("href") || u.getAttribute("xlink:href") || "")
        .filter((h) => h.startsWith("#") && !ids.has(h.slice(1))))];
      const secs = [...document.querySelectorAll("section.sec")].map((s) => s.id);
      const stageOverflow = [...document.querySelectorAll(".m-stage")].filter((st) => {
        const r = st.getBoundingClientRect();
        if (!r.width || getComputedStyle(st).overflowX === "auto") return false;
        const sc = st.querySelector(".m-screen");
        return sc && sc.scrollWidth > sc.clientWidth + 2 && getComputedStyle(sc).overflow !== "hidden";
      }).length;
      return {
        overflowX: de.scrollWidth - window.innerWidth,
        missingIcons, secs, stageOverflow,
        hasJs: de.classList.contains("js"),
        chapterKind: document.body.getAttribute("data-chapter") || "",
        flows: document.querySelectorAll("figure.flow").length
      };
    });
    if (!stat.hasJs) r.errors.push(`${w}: book.js did not run`);
    if (stat.overflowX > 1) r.errors.push(`${w}: page scrolls sideways by ${stat.overflowX}px`);
    if (stat.missingIcons.length) r.errors.push(`${w}: missing icon symbols ${stat.missingIcons.join(" ")}`);
    if (stat.stageOverflow) r.warnings.push(`${w}: ${stat.stageOverflow} mock(s) with content wider than the screen`);

    // flows: step through every one
    const nFlows = stat.flows;
    for (let i = 0; i < nFlows; i++) {
      const fr = await page.evaluate((i) => {
        const fig = document.querySelectorAll("figure.flow")[i];
        const fl = fig.__flow;
        const steps = [...fig.querySelectorAll(".flow-steps > li")];
        const res = { id: fig.id || "#" + i, steps: steps.length, final: Number(fig.getAttribute("data-final")) || steps.length, problems: [] };
        if (!fl) { res.problems.push("not initialised by book.js"); return res; }
        if (!steps.length) res.problems.push("no steps");
        if (res.final > steps.length) res.problems.push(`data-final ${res.final} > ${steps.length} steps`);
        fl.pause();
        const seen = (t) => { const b = t.getBoundingClientRect(); return b.width > 0 || b.height > 0; };
        for (let n = 1; n <= steps.length; n++) {
          // the cursor travels to the target on the previous frame, then the step applies;
          // a target may vanish on its own step (a dismissed banner), so either frame counts
          const sel = steps[n - 1].getAttribute("data-target");
          let before = null;
          if (sel) { fl.goto(n - 1, false); const t0 = fig.querySelector(sel); before = t0 && seen(t0); }
          steps[n - 1].click();
          if (sel) {
            const t = fig.querySelector(sel);
            if (!t) res.problems.push(`step ${n}: target ${sel} not found`);
            else if (!before && !seen(t)) res.problems.push(`step ${n}: target ${sel} is hidden on frames ${n - 1} and ${n}`);
          }
          if (!steps[n - 1].classList.contains("is-current")) res.problems.push(`step ${n}: list did not follow`);
        }
        fl.goto(res.final, false);
        // anything that is supposed to change: count ranged nodes that ever toggle
        const ranged = fig.querySelectorAll("[data-on],[data-swap],[data-state]").length;
        if (!ranged && steps.length > 1) res.problems.push("nothing in the mock changes between steps (no data-on/data-swap/data-state)");
        return res;
      }, i);
      if (args.shots) {
        fs.mkdirSync(args.shots, { recursive: true });
        const el = page.locator("figure.flow").nth(i);
        await el.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(450);
        await el.screenshot({ path: path.join(args.shots, `${name}-${w}-flow-${fr.id}.png`) }).catch((e) => fr.problems.push("screenshot: " + e.message.split("\n")[0]));
      }
      out.flows.push(fr);
      fr.problems.forEach((p) => r.errors.push(`${w}: flow ${fr.id}: ${p}`));
    }

    // legends vs pins
    out.legends = await page.evaluate(() => [...document.querySelectorAll("ol.legend[data-map]")].map((ol) => {
      const sel = ol.getAttribute("data-map");
      const map = document.querySelector(sel);
      const items = ol.querySelectorAll(":scope > li").length;
      if (!map) return { map: sel, problem: "data-map points nowhere" };
      const nums = [...map.querySelectorAll(".m-pin")].map((p) => Number(p.textContent.trim()));
      const uniq = [...new Set(nums)].sort((a, b) => a - b);
      const gaps = uniq.length && (uniq[0] !== 1 || uniq[uniq.length - 1] !== uniq.length);
      const problem = !uniq.length ? "map has no pins" : gaps ? `pins are not 1..N (${uniq.join(",")})` : uniq.length !== items ? `${uniq.length} pins but ${items} legend lines` : "";
      return { map: sel, pins: uniq.length, items, problem };
    }));
    out.legends.filter((l) => l.problem).forEach((l) => r.errors.push(`${w}: legend ${l.map}: ${l.problem}`));

    if (w === widths[0]) {
      // structure (screen chapters only) — once
      const isScreen = !stat.chapterKind && /^\d\d-/.test(path.basename(file));
      if (isScreen) {
        const want = stat.secs.some((s) => SECTIONS_RO.includes(s)) && !stat.secs.includes("summary") ? SECTIONS_RO : SECTIONS;
        const missing = want.filter((s) => !stat.secs.includes(s));
        const order = want.filter((s) => stat.secs.includes(s));
        const actual = stat.secs.filter((s) => want.includes(s));
        if (missing.length) r.errors.push(`missing template sections: ${missing.join(", ")}`);
        else if (order.join() !== actual.join()) r.errors.push(`template sections out of order: ${actual.join(", ")}`);
      }
      // local links + anchors
      const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
      const here = new Set(await page.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id)));
      for (const h of new Set(links)) {
        if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(h) || !h) continue;
        if (h.includes("{{")) { r.warnings.push(`link ${h}: placeholder not filled`); continue; }
        const [p, frag] = h.split("#");
        if (!p) { if (frag && !here.has(decodeURIComponent(frag))) r.errors.push(`link ${h}: no element with that id`); continue; }
        const target = path.resolve(path.dirname(file), decodeURIComponent(p));
        if (!fs.existsSync(target)) { r.errors.push(`link ${h}: file not found`); continue; }
        if (frag && /\.html?$/i.test(target)) {
          const src = fs.readFileSync(target, "utf8");
          if (!new RegExp(`id=["']${frag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(src)) r.warnings.push(`link ${h}: anchor not found (may be added by build-index)`);
        }
      }
    }

    if (args.shots) {
      fs.mkdirSync(args.shots, { recursive: true });
      await page.screenshot({ path: path.join(args.shots, `${name}-${w}.png`), fullPage: true });
    }
    out.console.forEach((c) => r.errors.push(`${w}: console: ${c}`));
    out.failed.forEach((u) => r.errors.push(`${w}: failed request: ${u}`));
    r.widths[w] = { overflowX: stat.overflowX, flows: out.flows.length, flowSteps: out.flows.reduce((a, f) => a + f.steps, 0), legends: out.legends.length };
    await ctx.close();
  }
  if (args.pdf) {
    fs.mkdirSync(args.pdf, { recursive: true });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    const notFinal = await page.evaluate(() => [...document.querySelectorAll("figure.flow")].filter((f) => f.__flow && f.__flow.step !== f.__flow.final).map((f) => f.id));
    if (notFinal.length) r.errors.push(`print: flows not on their final frame: ${notFinal.join(" ")}`);
    const out = path.join(args.pdf, name + ".pdf");
    await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
    r.pdf = out;
    await ctx.close();
  }
  r.ok = !r.errors.length;
  report.push(r);
}
await browser.close();
console.log(JSON.stringify({ ok: report.every((r) => r.ok), chapters: report }, null, 2));
process.exit(report.every((r) => r.ok) ? 0 : 1);
