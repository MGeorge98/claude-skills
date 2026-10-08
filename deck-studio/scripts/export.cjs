#!/usr/bin/env node
const { loadPlaywright, parseArgs, help, mkdir } = require('./lib.cjs');
const fs = require('fs'), path = require('path');
const HELP = `export.cjs --url http://localhost:5190/ [--out .]
Loads <url>?print (every slide stacked, every step in), waits for fonts and images, writes
<out>/deck.pdf (one 1920x1080 px page per slide, backgrounds printed) and <out>/slides/<nn>.png.`;
const a = parseArgs(process.argv.slice(2)); help(HELP, a);
const base = (a.url || 'http://localhost:5190/').replace(/#.*$/, '');
const url = base + (base.includes('?') ? '&' : '?') + 'print';
const OUT = path.resolve(a.out || '.');
const pad = n => String(n).padStart(2, '0');

(async () => {
  const browser = await loadPlaywright().chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.classList.contains('deck-ready'), null, { timeout: 8000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(i => (i.complete ? null : i.decode().catch(() => {}))));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  mkdir(path.join(OUT, 'slides'));
  const pdfPath = path.join(OUT, 'deck.pdf');
  await page.pdf({ path: pdfPath, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  const secs = await page.$$('.deck-stage > .slide');
  for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: path.join(OUT, 'slides', `${pad(i + 1)}.png`) });
  const pages = (fs.readFileSync(pdfPath, 'latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
  await browser.close();
  console.log(`export: ${pdfPath} (${pages} pages), ${secs.length} PNGs in ${path.join(OUT, 'slides')}`);
  if (errors.length) console.log('console errors: ' + errors.join(' | '));
  if (pages !== secs.length || errors.length) process.exit(1);
})();
