#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, mkdir } = require('./lib.cjs');
const HELP = `shoot.cjs <url> [--out shots] [--full] [--wait 2000] [--sizes 390x844,1440x900]
Quick shots of one URL. Fold-only by default; --full for the full page (scrolls once first so reveals fire).`;
(async () => {
  const a = parseArgs(process.argv.slice(2), { bool: ['full'] }); help(HELP, a);
  const url = a._[0]; if (!url) { console.log(HELP); process.exit(1); }
  const out = a.out || 'shots'; mkdir(out);
  const b = await loadPlaywright().chromium.launch();
  for (const s of (a.sizes || '390x844,1440x900').split(',')) {
    const [w, h] = s.split('x').map(Number);
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(+a.wait || 2000);
    if (a.full) {
      await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += innerHeight * .6) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); });
    }
    const f = `${out}/${w}${a.full ? '-full' : ''}.png`;
    await p.screenshot({ path: f, fullPage: !!a.full }); console.log(f); await p.close();
  }
  await b.close();
})();
