#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, mkdir, readJson } = require('./lib.cjs');
const { buildSheet } = require('./sheet.cjs');
const fs = require('fs'), path = require('path');
const HELP = `audit.cjs [--config ls-audit.json] [--url URL] [--out audit] [--min-flick 8] [--scene SEL|index]
Standard visual/behaviour audit. Run from the app folder; reads ./ls-audit.json:
 { "url":"http://localhost:3000/",
   "scenes":[{"sel":"section[data-scene]:nth-of-type(1)","frames":[0,.1,.5,.9,1]}],
   "hero":{"fields":["#formular input[name=nume]"]},
   "viewports":[[390,844],[1440,900]], "reducedMotion":true }
Checks: no pageerror/console error; scrollWidth == innerWidth; after a full glide scroll zero
[data-rv]:not(.in); hero fields inside the first fold (first viewport); scene frames at fixed --p;
flick test (2s scroll, distinct --p states >= min-flick); reduced-motion: all [data-rv] visible;
JS-blocked (aborts /_next/static/chunks/*): every [data-rv] opaque by 3.6s.
--scene keeps only the matching scenes of ls-audit.json (index, or a substring of sel), e.g. after a fix.
Writes <out>/*.png, report.json, sheet.png. Exit 1 on any failure.`;
(async () => {
  const a = parseArgs(process.argv.slice(2)); help(HELP, a);
  const cfgPath = a.config || 'ls-audit.json';
  const cfg = fs.existsSync(cfgPath) ? readJson(cfgPath) : {};
  const url = a.url || cfg.url; if (!url) { console.error('no url: pass --url or ls-audit.json'); process.exit(1); }
  const OUT = path.resolve(a.out || 'audit'); fs.rmSync(OUT, { recursive: true, force: true }); mkdir(OUT);
  const minFlick = +(a['min-flick'] || cfg.minFlick || 8);
  const vps = cfg.viewports || [[390, 844], [1440, 900]];
  let scenes = cfg.scenes || [];
  if (a.scene !== undefined) { const k = String(a.scene); scenes = scenes.filter((s, i) => String(i) === k || s.sel.includes(k)); if (!scenes.length) { console.error('no scene matches --scene ' + k); process.exit(1); } }
  const profiles = [];
  vps.forEach(([w, h], i) => profiles.push({ name: w < 800 ? 'm' + (i ? i : '') : 'd', w, h, mobile: w < 800, first: i === 0 }));
  const [w0, h0] = vps[0];
  if (cfg.reducedMotion !== false) profiles.push({ name: 'rm', w: w0, h: h0, mobile: w0 < 800, rm: true });
  profiles.push({ name: 'js', w: w0, h: h0, mobile: w0 < 800, js: true });

  const R = { url, profiles: {}, failures: [] };
  const fail = (p, msg) => { R.failures.push(`[${p}] ${msg}`); };
  const b = await loadPlaywright().chromium.launch();
  const pngs = [];

  for (const pr of profiles) {
    const rec = R.profiles[pr.name] = { viewport: [pr.w, pr.h] };
    const ctx = await b.newContext({ viewport: { width: pr.w, height: pr.h }, deviceScaleFactor: 1, isMobile: pr.mobile, hasTouch: pr.mobile, reducedMotion: pr.rm ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
    if (pr.js) await p.route(/\/_next\/static\/chunks\//, r => r.abort());
    await p.goto(url, { waitUntil: pr.js ? 'load' : 'networkidle' });
    const shot = async tag => { const f = `${OUT}/${pr.name}-${tag}.png`; await p.screenshot({ path: f }); pngs.push(f); };

    if (pr.js) {
      await p.waitForTimeout(3900);
      const bad = await p.evaluate(() => [...document.querySelectorAll('[data-rv]')].filter(e => { const c = getComputedStyle(e); return parseFloat(c.opacity) < 0.99 || c.visibility === 'hidden'; }).map(e => (e.className || e.tagName) + '|' + e.textContent.trim().slice(0, 30)));
      rec.notVisibleAt3_9s = bad.length; rec.list = bad.slice(0, 10);
      if (bad.length) fail(pr.name, `${bad.length} [data-rv] not visible with JS blocked after 3.9s (failsafe): ${JSON.stringify(bad.slice(0, 4))}`);
      await shot('0fold'); await ctx.close(); continue;
    }
    await p.waitForTimeout(2400);
    await shot('0fold');
    rec.scrollWidth = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    if (rec.scrollWidth[0] !== rec.scrollWidth[1]) fail(pr.name, `scrollWidth ${rec.scrollWidth[0]} != innerWidth ${rec.scrollWidth[1]}`);

    if (pr.first && cfg.hero?.fields) {
      rec.hero = await p.evaluate(sels => sels.map(s => { const e = document.querySelector(s); if (!e) return { sel: s, missing: true }; const r = e.getBoundingClientRect(); return { sel: s, top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) }; }), cfg.hero.fields);
      for (const f of rec.hero) if (f.missing) fail(pr.name, `hero field missing: ${f.sel}`); else if (f.bottom > pr.h) fail(pr.name, `hero field below fold (bottom ${f.bottom} > ${pr.h}): ${f.sel}`);
    }

    // full glide
    await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y <= H; y += innerHeight * 0.4) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 110)); } });
    await p.waitForTimeout(1500);
    const hidden = await p.evaluate(() => document.documentElement.classList.contains('rm') ? [] : [...document.querySelectorAll('[data-rv]:not(.in)')].map(e => (e.className || e.tagName) + '|' + e.textContent.trim().slice(0, 30)));
    rec.hiddenAfterScroll = hidden.length; if (hidden.length) { rec.hiddenList = hidden; fail(pr.name, `${hidden.length} [data-rv]:not(.in) after full scroll: ${JSON.stringify(hidden.slice(0, 5))}`); }

    if (pr.rm) {
      const bad = await p.evaluate(() => [...document.querySelectorAll('[data-rv]')].filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).map(e => (e.className || e.tagName) + '|' + e.textContent.trim().slice(0, 30)));
      rec.invisibleReduced = bad.length; if (bad.length) fail(pr.name, `${bad.length} elements hidden under reduced motion: ${JSON.stringify(bad.slice(0, 4))}`);
      rec.hasRmClass = await p.evaluate(() => document.documentElement.classList.contains('rm'));
    } else {
      rec.scenes = [];
      for (let i = 0; i < scenes.length; i++) {
        const sc = scenes[i], tag = 's' + i, sr = { sel: sc.sel, frames: [], flick: null };
        rec.scenes.push(sr);
        const geo = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: r.top + scrollY, range: r.height - innerHeight, vh: innerHeight }; }, sc.sel);
        if (!geo) { fail(pr.name, `scene not found: ${sc.sel}`); continue; }
        if (geo.range < 50) { fail(pr.name, `scene has no scroll range (${Math.round(geo.range)}px): ${sc.sel}`); continue; }
        for (const f of sc.frames || [0, .1, .5, .9, 1]) {
          await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), geo.top + f * geo.range);
          await p.waitForTimeout(800);
          const pv = await p.evaluate(sel => parseFloat(getComputedStyle(document.querySelector(sel)).getPropertyValue('--p')), sc.sel);
          sr.frames.push({ at: f, p: pv });
          if (!isNaN(pv) && Math.abs(pv - f) > 0.03) fail(pr.name, `${sc.sel} frame ${f}: --p is ${pv}`);
          await shot(`${tag}-f${String(Math.round(f * 100)).padStart(3, '0')}`);
        }
        // flick: 2s scroll through the scene
        await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.max(0, geo.top - geo.vh)); await p.waitForTimeout(500);
        const fl = await p.evaluate(([sel, top, len]) => new Promise(res => {
          const s = document.querySelector(sel); const t0 = performance.now(); let last = -9, states = 0, frames = 0, n = 0;
          const st = now => { const k = Math.min(1, (now - t0) / 2000); scrollTo({ top: top + k * len, behavior: 'instant' });
            const pv = parseFloat(getComputedStyle(s).getPropertyValue('--p')); frames++;
            if (!isNaN(pv) && Math.abs(pv - last) > 0.02) { states++; last = pv; }
            if (now - t0 < 2300) requestAnimationFrame(st); else res({ states, frames }); };
          requestAnimationFrame(st); }), [sc.sel, geo.top - geo.vh, geo.range + geo.vh * 2]);
        sr.flick = fl;
        if (fl.states < minFlick) fail(pr.name, `flick ${sc.sel}: only ${fl.states} distinct states (< ${minFlick}) in ${fl.frames} frames`);
      }
    }
    rec.errors = errs; if (errs.length) fail(pr.name, `${errs.length} console/page errors: ${JSON.stringify(errs.slice(0, 3))}`);
    await ctx.close();
  }
  await buildSheet(b, pngs.sort(), `${OUT}/sheet.png`, { cols: 8, w: 200, title: `landing-studio audit: ${url}` });
  await b.close();
  R.ok = !R.failures.length;
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(R, null, 1));
  console.log('\nAUDIT ' + url);
  for (const [n, r] of Object.entries(R.profiles)) {
    console.log(`  ${n.padEnd(3)} ${r.viewport.join('x')}` + (r.scrollWidth ? ` sw=${r.scrollWidth[0]}/${r.scrollWidth[1]}` : '') + (r.hiddenAfterScroll !== undefined ? ` hidden=${r.hiddenAfterScroll}` : '') + (r.scenes ? ' flick=' + r.scenes.map(s => s.flick ? s.flick.states : '-').join(',') : '') + (r.errors ? ` errs=${r.errors.length}` : '') + (r.notVisibleAt3_9s !== undefined ? ` notVisible3.9s=${r.notVisibleAt3_9s}` : '') + (r.invisibleReduced !== undefined ? ` invisibleRM=${r.invisibleReduced}` : ''));
    if (r.hero) console.log('     hero: ' + r.hero.map(f => f.missing ? f.sel + ' MISSING' : `${f.sel} bottom=${f.bottom}`).join('; '));
  }
  console.log(R.ok ? `PASS. sheet: ${OUT}/sheet.png` : `FAIL (${R.failures.length}):\n  ` + R.failures.join('\n  ') + `\n  sheet: ${OUT}/sheet.png`);
  process.exit(R.ok ? 0 : 1);
})();
