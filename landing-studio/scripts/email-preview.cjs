#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, mkdir } = require('./lib.cjs');
const path = require('path');
const HELP = `email-preview.cjs <file.html> [--out email-shots] [--widths 640,390]
Renders the email at each width in light, dark (prefers-color-scheme), invert (Gmail-style
invert + hue-rotate) and pureinvert emulations. Full-page PNGs: <name>-<width>-<mode>.png.`;
(async () => {
  const a = parseArgs(process.argv.slice(2)); help(HELP, a);
  const f = a._[0]; if (!f) { console.log(HELP); process.exit(1); }
  const out = a.out || 'email-shots'; mkdir(out);
  const base = path.basename(f, path.extname(f));
  const b = await loadPlaywright().chromium.launch();
  for (const w of (a.widths || '640,390').split(',').map(Number)) for (const m of ['light', 'dark', 'invert', 'pureinvert']) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.emulateMedia({ colorScheme: m === 'dark' ? 'dark' : 'light' });
    await p.goto('file://' + encodeURI(path.resolve(f))); await p.waitForTimeout(300);
    if (m === 'pureinvert') await p.addStyleTag({ content: 'html{filter:invert(1);background:#fff} img{filter:invert(1)}' });
    if (m === 'invert') await p.addStyleTag({ content: 'html{filter:invert(1) hue-rotate(180deg);background:#fff} img{filter:hue-rotate(180deg) invert(1)}' });
    const o = `${out}/${base}-${w}-${m}.png`; await p.screenshot({ path: o, fullPage: true }); console.log(o); await p.close();
  }
  await b.close();
})();
