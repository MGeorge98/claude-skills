#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, mkdir } = require('./lib.cjs');
const fs = require('fs'), path = require('path');
const HELP = `email-logos.cjs <logo.png|svg> --out pill.png [--bg #060E0A] [--w 92] [--pad 14] [--radius 12] [--scale 2]
Renders the logo onto a dark rounded pill with transparent corners (survives dark-mode inversion in mail clients).`;
(async () => {
  const a = parseArgs(process.argv.slice(2)); help(HELP, a);
  const f = a._[0]; if (!f || !a.out) { console.log(HELP); process.exit(1); }
  const ext = path.extname(f).slice(1).toLowerCase(), mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : 'image/' + ext;
  const b = await loadPlaywright().chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: +a.scale || 2, viewport: { width: 600, height: 300 } });
  await p.setContent(`<body style="margin:0;background:transparent"><div id="x" style="display:inline-block;background:${a.bg || '#060E0A'};border-radius:${a.radius || 12}px;padding:${a.pad || 14}px;line-height:0"><img src="data:${mime};base64,${fs.readFileSync(f).toString('base64')}" style="width:${a.w || 92}px;display:block"></div></body>`);
  await p.waitForLoadState('load'); await p.waitForTimeout(150);
  mkdir(path.dirname(path.resolve(a.out)));
  await p.locator('#x').screenshot({ path: a.out, omitBackground: true });
  await b.close(); console.log('pill: ' + a.out);
})();
