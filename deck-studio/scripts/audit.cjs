#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, mkdir } = require('./lib.cjs');
const { buildSheet } = require('./sheet.cjs');
const fs = require('fs'), path = require('path');
const HELP = `audit.cjs --url http://localhost:5190/ [--out audit] [--slide n] [--strict] [--words 40]
Audits a built deck (serve dist with vite preview). Per slide, per step, at 1920x1080 and 1280x720:
  zero console errors and failed requests after a fresh load at #n; the hash lands on slide n;
  every visible element inside the scaled stage rect; data-steps equals the max [data-step];
  step k has exactly the steps with at <= k as .in (swap groups: newest member only); going back
  with prev() reproduces each earlier frame; words at the final step <= --words (warn; --strict fails).
Profiles: reduced motion (html.rm, steps still gate, zero running animations or transitions),
  no JS (stacked document, every slide's text visible), ?print (N pages of 1920x1080 in a PDF).
Writes <out>/<nn>-s<k>-<w>.png, <nn>-s<N>-rm.png, nojs.png, report.json, sheet.png
(one row per slide: step 0 at 1920, final at 1920, final at 1280, final under rm).
--slide n reruns one slide (1-based) at both widths and rm, and writes sheet-<nn>.png. Exit 1 on failure.`;
const a = parseArgs(process.argv.slice(2), { bool: ['strict'] }); help(HELP, a);
const URL0 = a.url || 'http://localhost:5190/';
const OUT = path.resolve(a.out || 'audit');
const ONLY = a.slide ? Number(a.slide) - 1 : null;
const MAXW = Number(a.words || 40);
const pad = n => String(n).padStart(2, '0');
const base = URL0.replace(/#.*$/, '');
const withQuery = (q) => base + (base.includes('?') ? '&' : '?') + q;

const report = { url: URL0, date: new Date().toISOString(), slides: [], profiles: {}, failures: [], warnings: [] };
const fail = (w, m) => { report.failures.push(`${w}: ${m}`); console.log(`FAIL ${w}: ${m}`); };
const warn = (w, m) => { report.warnings.push(`${w}: ${m}`); console.log(`warn ${w}: ${m}`); };

/* in-page helpers, injected once per page */
const PAGE_LIB = () => {
  window.__audit = {
    stage() { return document.querySelector('[data-deck-main] .deck-stage') || document.querySelector('.deck-stage'); },
    sections() { return Array.from(this.stage().querySelectorAll(':scope > .slide')); },
    expected(sec, k) {
      const els = Array.from(sec.querySelectorAll('[data-step]'));
      const top = new Map();
      for (const el of els) { const g = el.dataset.stepSwap, at = +el.dataset.step; if (g && at <= k && at > (top.has(g) ? top.get(g) : -1)) top.set(g, at); }
      return els.map((el, j) => { const g = el.dataset.stepSwap, at = +el.dataset.step; return at <= k && (!g || top.get(g) === at) ? j : -1; }).filter(j => j >= 0);
    },
    desc(el) { return el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''); },
    inspect(i) {
      const st = window.__deck.state();
      const secs = this.sections(), sec = secs[i], stage = this.stage();
      const sr = stage.getBoundingClientRect();
      const steps = Array.from(sec.querySelectorAll('[data-step]'));
      const ats = steps.map(e => +e.dataset.step);
      const inSet = steps.map((e, j) => (e.classList.contains('in') ? j : -1)).filter(j => j >= 0);
      const oob = [];
      for (const el of sec.querySelectorAll('*')) {
        if (el.closest('[data-step]:not(.in)')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const b = el.getBoundingClientRect();
        // what can be seen: the rect clipped by every ancestor inside the slide that clips its overflow
        const r = { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
        for (let a = el.parentElement; a && a !== sec; a = a.parentElement) {
          const o = getComputedStyle(a);
          if (o.overflowX === 'visible' && o.overflowY === 'visible') continue;
          const c = a.getBoundingClientRect();
          r.left = Math.max(r.left, c.left); r.top = Math.max(r.top, c.top); r.right = Math.min(r.right, c.right); r.bottom = Math.min(r.bottom, c.bottom);
        }
        r.width = r.right - r.left; r.height = r.bottom - r.top;
        if (r.width < 1 || r.height < 1) continue;
        if (r.left < sr.left - 1 || r.top < sr.top - 1 || r.right > sr.right + 1 || r.bottom > sr.bottom + 1)
          oob.push(`${this.desc(el)} [${Math.round(r.left - sr.left)},${Math.round(r.top - sr.top)} ${Math.round(r.width)}x${Math.round(r.height)}]`);
      }
      // code blocks and anything marked data-nowords are not copy: a code slide is read, not spoken
      const wc = sec.cloneNode(true); wc.querySelectorAll('pre, code, [data-nowords]').forEach(n => n.remove());
      const words = (wc.textContent || '').split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
      return {
        state: st, hash: location.hash, id: sec.dataset.slide, type: sec.dataset.type,
        dataSteps: +sec.dataset.steps, maxAt: ats.length ? Math.max(...ats) : 0,
        inSet, expected: this.expected(sec, st.step), oob: oob.slice(0, 8), oobCount: oob.length, words,
        current: secs.filter(s => s.classList.contains('is-current')).map(s => s.dataset.slide),
        scale: sr.width / 1920,
      };
    },
    rmCheck(i) {
      const sec = this.sections()[i];
      const bad = [];
      for (const el of sec.querySelectorAll('[data-step]')) {
        if (el.parentElement.closest('[data-step]:not(.in)')) continue;
        const o = getComputedStyle(el).opacity;
        if (el.classList.contains('in') ? o !== '1' : o !== '0') bad.push(`${this.desc(el)} at=${el.dataset.step} in=${el.classList.contains('in')} opacity=${o}`);
      }
      return { rm: document.documentElement.classList.contains('rm'), anims: document.getAnimations().length, bad: bad.slice(0, 6) };
    },
    async settle() {
      const fin = document.getAnimations().filter(x => { const t = x.effect && x.effect.getTiming && x.effect.getTiming(); return t && t.iterations !== Infinity; });
      await Promise.race([Promise.all(fin.map(x => x.finished.catch(() => {}))), new Promise(r => setTimeout(r, 4000))]);
      await new Promise(r => setTimeout(r, 80));
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    },
  };
};

function watch(page) {
  const log = { errors: [], failed: [] };
  page.on('console', m => { if (m.type() === 'error') log.errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => log.errors.push(String(e.message).slice(0, 200)));
  page.on('requestfailed', r => log.failed.push(`${r.url().slice(0, 120)} ${r.failure() && r.failure().errorText}`));
  page.on('response', r => { if (r.status() >= 400) log.failed.push(`${r.url().slice(0, 120)} ${r.status()}`); });
  return log;
}

async function load(page, url) {
  await page.goto('about:blank');
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('deck-ready') && window.__deck, null, { timeout: 8000 });
  await page.evaluate(PAGE_LIB);
  await page.evaluate(() => document.fonts.ready);
}
const eqSet = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);

(async () => {
  const pw = loadPlaywright();
  const browser = await pw.chromium.launch();
  mkdir(OUT);

  /* shape */
  const probe = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await load(probe, URL0);
  const shape = await probe.evaluate(() => window.__audit.sections().map(s => ({ id: s.dataset.slide, type: s.dataset.type, steps: +s.dataset.steps })));
  await probe.close();
  const N = shape.length;
  if (!N) { fail('deck', 'no .slide sections in the stage'); }
  console.log(`deck: ${N} slides, ${shape.reduce((n, s) => n + s.steps, 0)} steps`);
  const todo = ONLY === null ? shape.map((_, i) => i) : [ONLY];
  if (ONLY !== null && !shape[ONLY]) { console.error(`no slide ${ONLY + 1} (deck has ${N})`); process.exit(1); }

  const rows = {};
  for (const i of todo) rows[i] = { n: i + 1, id: shape[i].id, type: shape[i].type, steps: shape[i].steps, words: null, viewports: {} };

  /* per slide, per step, two sizes */
  for (const [w, h] of [[1920, 1080], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    for (const i of todo) {
      const where = `slide ${i + 1} (${shape[i].id}) @${w}`;
      const log = watch(page);
      await load(page, `${base}#${i + 1}`);
      const fwd = [];
      let ok = true;
      for (let k = 0; k <= shape[i].steps; k++) {
        if (k > 0) await page.evaluate(() => window.__deck.next());
        await page.evaluate(() => window.__audit.settle());
        const f = await page.evaluate(n => window.__audit.inspect(n), i);
        const hashWant = `#${i + 1}${k ? '.' + k : ''}`;
        if (f.state.slide !== i || f.state.step !== k) { fail(where, `state ${f.state.slide + 1}.${f.state.step}, expected ${i + 1}.${k}`); ok = false; }
        if (f.hash !== hashWant) { fail(where, `hash ${f.hash}, expected ${hashWant}`); ok = false; }
        if (f.current.length !== 1 || f.current[0] !== shape[i].id) { fail(where, `is-current on [${f.current}]`); ok = false; }
        if (k === 0 && f.dataSteps !== f.maxAt) { fail(where, `data-steps=${f.dataSteps} but max [data-step]=${f.maxAt}`); ok = false; }
        if (!eqSet(f.inSet, f.expected)) { fail(where, `step ${k}: .in on [${f.inSet}] expected [${f.expected}]`); ok = false; }
        if (f.oobCount) { fail(where, `step ${k}: ${f.oobCount} element(s) outside the stage: ${f.oob.join('; ')}`); ok = false; }
        if (Math.abs(f.scale - Math.min(w / 1920, h / 1080)) > 0.01) { fail(where, `stage scale ${f.scale.toFixed(3)}`); ok = false; }
        if (k === shape[i].steps && w === 1920) {
          rows[i].words = f.words;
          if (f.words > MAXW) (a.strict ? fail : warn)(`slide ${i + 1} (${shape[i].id})`, `${f.words} words at the final step (max ${MAXW})`);
        }
        fwd[k] = f.inSet;
        await page.screenshot({ path: path.join(OUT, `${pad(i + 1)}-s${k}-${w}.png`) });
      }
      for (let k = shape[i].steps - 1; k >= 0; k--) {
        await page.evaluate(() => window.__deck.prev());
        const f = await page.evaluate(n => window.__audit.inspect(n), i);
        if (f.state.slide !== i || f.state.step !== k) { fail(where, `back: state ${f.state.slide + 1}.${f.state.step}, expected ${i + 1}.${k}`); ok = false; }
        else if (!eqSet(f.inSet, fwd[k])) { fail(where, `back to step ${k}: .in on [${f.inSet}], forward had [${fwd[k]}]`); ok = false; }
      }
      await page.evaluate(() => window.__audit.settle());
      page.removeAllListeners('console'); page.removeAllListeners('pageerror'); page.removeAllListeners('requestfailed'); page.removeAllListeners('response');
      if (log.errors.length) { fail(where, `console: ${log.errors.join(' | ')}`); ok = false; }
      if (log.failed.length) { fail(where, `requests: ${log.failed.join(' | ')}`); ok = false; }
      rows[i].viewports[w] = ok ? 'pass' : 'fail';
    }
    await ctx.close();
  }

  /* reduced motion */
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    let ok = true;
    for (const i of todo) {
      const where = `rm slide ${i + 1} (${shape[i].id})`;
      await load(page, `${base}#${i + 1}`);
      for (let k = 0; k <= shape[i].steps; k++) {
        if (k > 0) await page.evaluate(() => window.__deck.next());
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const r = await page.evaluate(n => window.__audit.rmCheck(n), i);
        const f = await page.evaluate(n => window.__audit.inspect(n), i);
        if (!r.rm) { fail(where, 'html.rm missing under prefers-reduced-motion'); ok = false; }
        if (r.anims) { fail(where, `step ${k}: ${r.anims} running animation(s) or transition(s)`); ok = false; }
        if (r.bad.length) { fail(where, `step ${k}: gating ${r.bad.join('; ')}`); ok = false; }
        if (!eqSet(f.inSet, f.expected)) { fail(where, `step ${k}: .in on [${f.inSet}] expected [${f.expected}]`); ok = false; }
      }
      await page.screenshot({ path: path.join(OUT, `${pad(i + 1)}-s${shape[i].steps}-rm.png`) });
    }
    report.profiles.reducedMotion = ok ? 'pass' : 'fail';
    await ctx.close();
  }

  if (ONLY === null) {
    /* no JS: the prerendered stacked document */
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(base, { waitUntil: 'load' });
      const r = await page.evaluate(() => {
        const secs = Array.from(document.querySelectorAll('.deck-stage > .slide'));
        return {
          js: document.documentElement.classList.contains('js'),
          slides: secs.map(s => {
            const hidden = Array.from(s.querySelectorAll('[data-step], [data-step] .w i')).filter(e => { const c = getComputedStyle(e); return c.opacity !== '1' || (c.transform !== 'none' && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(c.transform)); }).length;
            const rect = s.getBoundingClientRect();
            return { id: s.dataset.slide, display: getComputedStyle(s).display, text: (s.innerText || '').trim().length, hidden, h: Math.round(rect.height) };
          }),
          scrollW: document.documentElement.scrollWidth, w: innerWidth,
        };
      });
      let ok = true;
      if (r.js) { fail('no-js', 'html.js present with JavaScript disabled'); ok = false; }
      if (r.slides.length !== N) { fail('no-js', `${r.slides.length} slides in the document, deck has ${N}`); ok = false; }
      for (const s of r.slides) {
        if (s.display === 'none' || !s.text || !s.h) { fail('no-js', `slide ${s.id}: not readable (display ${s.display}, ${s.text} chars)`); ok = false; }
        if (s.hidden) { fail('no-js', `slide ${s.id}: ${s.hidden} step element(s) not fully visible`); ok = false; }
      }
      if (r.scrollW > r.w + 1) { fail('no-js', `horizontal scroll: ${r.scrollW}px in a ${r.w}px window`); ok = false; }
      await page.screenshot({ path: path.join(OUT, 'nojs.png'), fullPage: true });
      report.profiles.noJs = ok ? 'pass' : 'fail';
      await ctx.close();
    }
    /* ?print */
    {
      const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
      const log = watch(page);
      await load(page, withQuery('print'));
      const r = await page.evaluate(() => {
        const secs = window.__audit.sections();
        return {
          print: document.documentElement.classList.contains('print'),
          sizes: secs.map(s => { const b = s.getBoundingClientRect(); return `${Math.round(b.width)}x${Math.round(b.height)}`; }),
          notIn: secs.reduce((n, s) => n + s.querySelectorAll('[data-step]:not(.in):not([data-step-swap])').length, 0),
          hud: !!Array.from(document.querySelectorAll('.deck-hud')).find(e => getComputedStyle(e).display !== 'none'),
        };
      });
      const pdf = await page.pdf({ width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
      const txt = pdf.toString('latin1');
      const pages = (txt.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
      const boxes = [...new Set((txt.match(/\/MediaBox\s*\[[^\]]*\]/g) || []).map(s => s.replace(/\s+/g, ' ')))];
      let ok = true;
      if (!r.print) { fail('print', 'html.print missing'); ok = false; }
      if (r.sizes.some(s => s !== '1920x1080')) { fail('print', `slide boxes ${r.sizes.join(', ')}`); ok = false; }
      if (r.notIn) { fail('print', `${r.notIn} step(s) not .in`); ok = false; }
      if (r.hud) { fail('print', 'hud visible'); ok = false; }
      if (pages !== N) { fail('print', `${pages} PDF pages, expected ${N}`); ok = false; }
      if (!boxes.every(b => /\[0 0 1440 810\]/.test(b))) { fail('print', `page boxes ${boxes.join(' ')} (expected 1440x810 pt = 1920x1080 px)`); ok = false; }
      if (log.errors.length || log.failed.length) { fail('print', [...log.errors, ...log.failed].join(' | ')); ok = false; }
      report.profiles.print = ok ? `pass (${pages} pages)` : 'fail';
      await page.close();
    }
  }

  report.slides = todo.map(i => rows[i]);
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

  const files = [];
  for (const i of todo) {
    const s = shape[i].steps, p = pad(i + 1);
    for (const f of [`${p}-s0-1920.png`, `${p}-s${s}-1920.png`, `${p}-s${s}-1280.png`, `${p}-s${s}-rm.png`]) files.push(path.join(OUT, f));
  }
  const sheet = path.join(OUT, ONLY === null ? 'sheet.png' : `sheet-${pad(ONLY + 1)}.png`);
  await buildSheet(browser, files, sheet, { cols: 4, w: 384, title: `deck audit: ${base} (${N} slides; per row: step 0 @1920, final @1920, final @1280, final rm)` });
  await browser.close();

  for (const r of report.slides) console.log(`${pad(r.n)} ${r.id.padEnd(24)} ${r.type.padEnd(14)} steps ${r.steps}  words ${r.words}  1920 ${r.viewports[1920]}  1280 ${r.viewports[1280]}`);
  console.log(`profiles: ${Object.entries(report.profiles).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  console.log(`\naudit: ${report.failures.length ? 'FAIL' : 'PASS'} (${report.failures.length} failures, ${report.warnings.length} warnings)  sheet: ${sheet}`);
  process.exit(report.failures.length ? 1 : 0);
})();
