#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, readJson } = require('./lib.cjs');
const fs = require('fs');
const HELP = `perf.cjs [--config ls-audit.json] [--url URL] [--idle-sel SEL] [--baseline perf-baseline.json] [--no-throttle]
CDP at 390x844 DPR3 touch, no throttling. Page: CLS (layout-shift without input, load + every scene
scroll), LCP, JS bytes (encoded /_next/static/chunks/*.js on load) against perf-baseline.json: the first
run writes it, later runs fail above baseline x 1.15 (delete the file only with a documented reason).
Then LCP again on a fresh page under CDP throttling (lcpThrottledMs: Lighthouse mobile profile, 1.6 Mbps down, 750 kbps up, 150 ms latency, CPU x4, cache off;
the getdapost perf.spec.ts values), stored in the baseline as information. --no-throttle skips it (dev loops).
Per scene: Tracing "Paint" count during a 2s scroll through it, plus
LayoutCount / RecalcStyleCount deltas, frame count, long frames (>50ms). Then 2s idle below the
hero (parked at the first scene's end, or at the top of --idle-sel) and prints the top painted nodes.
Thresholds (ls-audit.json "perf", else defaults): { "idlePaints":3, "scrollPaintsPerScene":120,
"layouts":30, "longFrames":8, "cls":0.02, "lcpMs":2500, "lcpThrottledMs":2500, "jsGrowth":1.15 }. A project may lower lcpThrottledMs, never raise it. Exit 1 on breach. Never raise a threshold to turn a red run green.`;
const D = { idlePaints: 3, scrollPaintsPerScene: 120, layouts: 30, longFrames: 8, cls: 0.02, lcpMs: 2500, lcpThrottledMs: 2500, jsGrowth: 1.15 };
(async () => {
  const a = parseArgs(process.argv.slice(2)); help(HELP, a);
  const cfgPath = a.config || 'ls-audit.json'; const cfg = fs.existsSync(cfgPath) ? readJson(cfgPath) : {};
  const url = a.url || cfg.url; if (!url) { console.error('no url'); process.exit(1); }
  const T = { ...D, ...(cfg.perf || {}) }; const scenes = cfg.scenes || [];
  const b = await loadPlaywright().chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await cdp.send('Performance.enable');
  await p.addInitScript(() => {
    window.__ls = { cls: 0, lcp: 0 };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ls.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__ls.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
  });
  const chunks = [];
  p.on('requestfinished', r => { if (/\/_next\/static\/chunks\/.*\.js(\?|$)/.test(r.url())) chunks.push(r); });
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3500);
  const fails = [];
  let jsBytes = 0; for (const r of chunks) { try { jsBytes += (await r.sizes()).responseBodySize; } catch {} }
  const load = await p.evaluate(() => ({ cls: window.__ls.cls, lcp: window.__ls.lcp }));
  // a 500 page or a stale server measures as a perfect run: refuse it
  const missing = await p.evaluate(sels => sels.filter(s => !document.querySelector(s)), scenes.map(s => s.sel));
  if (missing.length || !jsBytes) { console.error(`perf: page not usable (missing scenes: ${missing.join(', ') || 'none'}; JS bytes ${jsBytes}). Is the server up on a fresh build?`); await b.close(); process.exit(2); }
  let lcpT = null;
  if (!a['no-throttle']) {
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p2 = await c2.newPage(); const d2 = await c2.newCDPSession(p2);
    await p2.addInitScript(() => { window.__lcp = 0; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {} });
    await d2.send('Network.enable'); await d2.send('Network.setCacheDisabled', { cacheDisabled: true });
    await d2.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await d2.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await p2.goto(url, { waitUntil: 'load', timeout: 90000 }); await p2.waitForTimeout(3000);
    lcpT = await p2.evaluate(() => window.__lcp); await c2.close();
  }
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  async function traced(fn) {
    await cdp.send('DOM.enable'); await cdp.send('DOM.getDocument', { depth: -1 });
    await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' });
    const m0 = await metrics(); const res = await fn(); const m1 = await metrics();
    const tr = await new Promise(r => { cdp.once('Tracing.tracingComplete', r); cdp.send('Tracing.end'); });
    let s = ''; for (let eof = false; !eof;) { const c = await cdp.send('IO.read', { handle: tr.stream }); s += c.base64Encoded ? Buffer.from(c.data, 'base64').toString() : c.data; eof = c.eof; }
    const ev = JSON.parse(s); const arr = Array.isArray(ev) ? ev : ev.traceEvents;
    const paints = arr.filter(e => e.name === 'Paint'); const by = {};
    for (const e of paints) { const id = e.args?.data?.nodeId; by[id] = (by[id] || 0) + 1; }
    const top = [];
    for (const [id, n] of Object.entries(by).sort((x, y) => y[1] - x[1]).slice(0, 5)) {
      let d = '?'; try { const nd = (await cdp.send('DOM.describeNode', { backendNodeId: Number(id) })).node; const at = nd.attributes || []; const ci = at.indexOf('class'); d = nd.nodeName.toLowerCase() + (ci >= 0 ? '.' + at[ci + 1].trim().split(/\s+/).slice(0, 2).join('.') : ''); } catch {}
      top.push(`${n}x ${d}`);
    }
    return { paints: paints.length, layouts: m1.LayoutCount - m0.LayoutCount, recalcs: m1.RecalcStyleCount - m0.RecalcStyleCount, top, ...res };
  }
  const loop = (sel, from, to) => p.evaluate(([sel, from, to]) => new Promise(res => {
    const s = sel ? document.querySelector(sel) : null; const top = s ? s.getBoundingClientRect().top + scrollY : 0; const t0 = performance.now();
    let frames = 0, long = 0, prev = t0;
    const st = now => { frames++; if (now - prev > 50) long++; prev = now; const k = Math.min(1, (now - t0) / 2000);
      if (s) scrollTo({ top: top + (from + (to - from) * k) * (s.offsetHeight - innerHeight), behavior: 'instant' });
      if (now - t0 < 2000) requestAnimationFrame(st); else res({ frames, long }); };
    requestAnimationFrame(st); }), [sel, from, to]);
  console.log(`PERF ${url}  390x844@3x touch   thresholds ${JSON.stringify(T)}`);
  const bf = a.baseline || 'perf-baseline.json';
  let base = fs.existsSync(bf) ? readJson(bf) : null;
  if (!base) { base = { jsBytes, ...(lcpT != null ? { lcpThrottledMs: Math.round(lcpT) } : {}), url, at: new Date().toISOString() }; fs.writeFileSync(bf, JSON.stringify(base, null, 1)); console.log(`  baseline written: ${bf} (jsBytes ${jsBytes})`); }
  const ceil = Math.round(base.jsBytes * T.jsGrowth);
  console.log(`  load: LCP=${Math.round(load.lcp)}ms CLS=${load.cls.toFixed(4)} JS=${jsBytes}B (ceiling ${ceil})`);
  if (lcpT != null) {
    console.log(`  load throttled (1.6 Mbps, 150 ms RTT, CPU x4, no cache): LCP=${Math.round(lcpT)}ms lcpThrottledMs${base.lcpThrottledMs ? ` (baseline ${base.lcpThrottledMs}, informational)` : ''}`);
    if (lcpT > T.lcpThrottledMs) fails.push(`throttled LCP ${Math.round(lcpT)}ms > ${T.lcpThrottledMs}`);
  }
  if (load.lcp > T.lcpMs) fails.push(`LCP ${Math.round(load.lcp)}ms > ${T.lcpMs}`);
  if (jsBytes > ceil) fails.push(`JS ${jsBytes}B > ceiling ${ceil} (baseline ${base.jsBytes} x ${T.jsGrowth})`);
  for (const sc of scenes) {
    await p.evaluate(sel => { const s = document.querySelector(sel); scrollTo({ top: s.getBoundingClientRect().top + scrollY - innerHeight * .5, behavior: 'instant' }); }, sc.sel);
    await p.waitForTimeout(700);
    const r = await traced(() => loop(sc.sel, 0, 1));
    console.log(`  scroll ${sc.sel}: paints=${r.paints} layouts=${r.layouts} recalcs=${r.recalcs} frames=${r.frames} long=${r.long}\n     top: ${r.top.join(' | ')}`);
    if (r.paints > T.scrollPaintsPerScene) fails.push(`${sc.sel}: ${r.paints} paints > ${T.scrollPaintsPerScene}`);
    if (r.layouts > T.layouts) fails.push(`${sc.sel}: ${r.layouts} layouts > ${T.layouts}`);
    if (r.long > T.longFrames) fails.push(`${sc.sel}: ${r.long} long frames > ${T.longFrames}`);
  }
  // idle: park at the end of the first scene (pinned, settled, hero far above; a tall phone hero with the
  // form under the headline is still on screen one viewport down) or at the top of --idle-sel, then wait 2s
  await p.evaluate(([sel, end]) => { const s = sel ? document.querySelector(sel) : null; const top = s ? s.getBoundingClientRect().top + scrollY : innerHeight * 1.5; scrollTo({ top: s && end ? top + Math.max(0, s.offsetHeight - innerHeight) : top, behavior: 'instant' }); }, [a['idle-sel'] || scenes[0]?.sel, !a['idle-sel']]);
  await p.waitForTimeout(1500);
  const idle = await traced(async () => { await p.waitForTimeout(2000); return {}; });
  console.log(`  idle 2s below hero: paints=${idle.paints} layouts=${idle.layouts}\n     top: ${idle.top.join(' | ') || '-'}`);
  if (idle.paints > T.idlePaints) fails.push(`idle: ${idle.paints} paints > ${T.idlePaints}`);
  const cls = await p.evaluate(() => window.__ls.cls);
  console.log(`  CLS after every scene scroll: ${cls.toFixed(4)}`);
  if (cls > T.cls) fails.push(`CLS ${cls.toFixed(4)} > ${T.cls}`);
  await b.close();
  console.log(fails.length ? 'FAIL\n  ' + fails.join('\n  ') : 'PASS');
  process.exit(fails.length ? 1 : 0);
})();
