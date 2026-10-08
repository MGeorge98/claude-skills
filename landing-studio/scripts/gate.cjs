#!/usr/bin/env node
const { parseArgs, help } = require('./lib.cjs');
const fs = require('fs'), path = require('path');
const HELP = `gate.cjs [dir=src] [--facts facts.md] [--banned banned.txt] [--strict]
Content gate. FAIL (exit 1): em dash (U+2014 or &mdash;), placeholders (lorem ipsum, "your text here",
example.com, John/Jane Doe), fake urgency ("only N spots", "N locuri ramase"), words from --banned
(one per line, case-insensitive, # comments).
FACTS LEDGER: every number with 2+ digits or a %, and every Capitalized multi-word name found in
string literals / JSX text of *.tsx|*.ts must appear in facts.md. Misses are "unsourced" warnings;
--strict makes them fail. Prints file:line.`;
const a = parseArgs(process.argv.slice(2), { bool: ['strict'] }); help(HELP, a);
const dir = a._[0] || 'src';
function walk(d, o = []) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (/^(node_modules|\.next|\.git)$/.test(e.name)) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, o) : o.push(p); } return o; }
const files = walk(dir).filter(f => /\.(tsx?|jsx?|css|html|md|json)$/.test(f));
const banned = a.banned ? fs.readFileSync(a.banned, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')) : [];
const rules = [
  ['em-dash', /\u2014|&mdash;|&#8212;/],
  ['placeholder', /lorem ipsum|your text here|example\.com|\b(John|Jane) Doe\b/i],
  ['fake-urgency', /\bonly \d+ (spots?|seats?|places?|left)\b|\b\d+ locuri r[aă]mase\b|\bultimele \d+ locuri\b/i],
  ...banned.map(w => ['banned:' + w, new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i')]),
];
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const facts = a.facts && fs.existsSync(a.facts) ? norm(fs.readFileSync(a.facts, 'utf8')) : null;
if (a.facts && !facts) console.log('warn: facts file not found: ' + a.facts);
let fails = 0, warns = 0; const seen = new Set();
const report = (kind, f, i, msg) => console.log(`${kind} ${f}:${i + 1}  ${msg}`);
// copy strings: quoted literals with a space or 2+ letters, and JSX text between > <
const strRe = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`|>([^<>{}\n]+)</g;
const SKIP_LINE = /(font-?family|font:|width|height|padding|margin|color|border|background|translate|opacity|stroke|viewBox|\bd=)|^\s*(import |export \* |\/\/|\*|\/\*)|className=|\bhref=|\bsrc=|\bkey=|\bid=|\bsize=|aria-|\btype=|data-[a-z]+=/;
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  const isCopy = /\.(tsx?)$/.test(f);
  lines.forEach((ln, i) => {
    for (const [n, re] of rules) if (re.test(ln)) { fails++; report('FAIL', f, i, n + ': ' + ln.trim().slice(0, 100)); }
    if (!facts || !isCopy || SKIP_LINE.test(ln)) return;
    let m; strRe.lastIndex = 0;
    const code = ln.replace(/\s\/\/.*$/, '');
    while ((m = strRe.exec(code))) {
      let s = m[1] ?? m[2] ?? m[3] ?? m[4]; if (s) s = s.replace(/\$\{[^}]*\}/g, ' '); // template code is not copy
      if (!s || s.length < 3 || !/\p{L}/u.test(s)) continue; // pure numbers are layout, not copy
      if (/(sans-serif|monospace|\bserif\b|system-ui|-apple-system)/.test(s)) continue; // font stacks
      if (/^[\w./:#-]+$/.test(s) && !/\d{2}/.test(s)) continue; // identifiers, paths
      if (/^(https?:|\/|#|[a-z-]+\.(png|jpe?g|svg|webp|css))/i.test(s)) continue;
      if (/(rgba?|hsla?|var|calc|clamp|translate|scale|cubic-bezier|rotate)\(|\d+(px|vh|vw|svh|em|rem|ms|s|deg)\b/.test(s)) continue;
      const found = new Set();
      for (const x of s.match(/\d[\d.,]*\d\s?%?|\d+%/g) || []) { if (/\d{2}/.test(x) || x.includes('%')) found.add(x.trim()); }
      for (const x of s.match(/\b[A-ZĂÂÎȘȚŞŢ][\p{L}'-]+(?:\s+[A-ZĂÂÎȘȚŞŢ][\p{L}'-]+)+/gu) || []) found.add(x);
      for (const x of found) if (!seen.has(f + x) && seen.add(f + x))
      if (!facts.includes(norm(x))) { warns++; report('UNSOURCED', f, i, x); }
    }
  });
}
console.log(`\ngate: ${files.length} files, ${fails} failures, ${warns} unsourced${a.facts ? '' : ' (no --facts, ledger skipped)'}`);
process.exit(fails || (a.strict && warns) ? 1 : 0);
