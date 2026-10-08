#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, mkdir } = require('./lib.cjs');
const fs = require('fs'), path = require('path');
const HELP = `sheet.cjs <folder-of-pngs> [--out sheet.png] [--cols 6] [--w 240] [--title text]
Builds a labelled contact sheet (grid, filename under each thumb) from all PNG/JPG files in a folder.
Also exported: require('./sheet.cjs').buildSheet(browser, files, out, opts).`;
async function buildSheet(browser, files, out, o = {}) {
  const cols = +o.cols || 6, w = +o.w || 240;
  const cells = files.map(f => `<figure><img src="file://${encodeURI(f)}" style="width:${w}px"><figcaption>${path.basename(f, path.extname(f))}</figcaption></figure>`).join('');
  const html = `<body style="margin:0;padding:12px;background:#1b1b1d"><style>
  .g{display:grid;grid-template-columns:repeat(${cols},${w}px);gap:12px;align-items:start}
  figure{margin:0}img{display:block;border:1px solid #444;background:#000}
  figcaption{color:#ddd;font:11px/1.3 ui-monospace,monospace;padding-top:4px;word-break:break-all}
  h1{color:#fff;font:600 14px sans-serif;margin:0 0 10px}</style>${o.title ? `<h1>${o.title}</h1>` : ''}<div class="g">${cells}</div></body>`;
  const tmp = out + '.html'; fs.writeFileSync(tmp, html);
  const p = await browser.newPage({ viewport: { width: cols * (w + 12) + 24, height: 600 } });
  await p.goto('file://' + encodeURI(path.resolve(tmp)));
  await p.waitForLoadState('load'); await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: true });
  await p.close(); fs.unlinkSync(tmp);
}
module.exports = { buildSheet };
if (require.main === module) (async () => {
  const a = parseArgs(process.argv.slice(2)); help(HELP, a);
  const dir = a._[0]; if (!dir) { console.log(HELP); process.exit(1); }
  const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f) && !/^sheet/.test(f)).sort().map(f => path.resolve(dir, f));
  if (!files.length) { console.error('no images in ' + dir); process.exit(1); }
  const b = await loadPlaywright().chromium.launch();
  const out = path.resolve(a.out || path.join(dir, 'sheet.png')); mkdir(path.dirname(out));
  await buildSheet(b, files, out, a); await b.close(); console.log('sheet: ' + out + ' (' + files.length + ' images)');
})();
