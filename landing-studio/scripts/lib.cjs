// Shared helpers: playwright resolution, tiny arg parser. Not a CLI.
const path = require('path'), fs = require('fs');
const FALLBACK = '/Users/novamatter/GitHub/Landing Page Portfolio/getdapost/node_modules';
function loadPlaywright() {
  const cands = [];
  if (process.env.PW_PATH) cands.push(process.env.PW_PATH);
  cands.push(...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean), path.join(process.cwd(), 'node_modules'), FALLBACK);
  for (const c of cands) {
    for (const n of ['playwright', 'playwright-core']) {
      try { return require(require.resolve(n, { paths: [c, path.dirname(c)] })); } catch (e) {}
    }
  }
  try { return require('playwright'); } catch (e) {}
  console.error('landing-studio: Playwright not found. Set PW_PATH (or NODE_PATH) to a node_modules folder containing "playwright".\nTried: ' + cands.join(', '));
  process.exit(2);
}
// args: --flag, --key value, --key=value, positionals in _
function parseArgs(argv, spec = {}) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      let [k, v] = a.slice(2).split('=');
      if (v === undefined && !spec.bool?.includes(k) && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) v = argv[++i];
      o[k] = v === undefined ? true : v;
    } else o._.push(a);
  }
  return o;
}
function help(text, args) { if (args.help || args.h) { console.log(text); process.exit(0); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mkdir = d => fs.mkdirSync(d, { recursive: true });
function readJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
module.exports = { loadPlaywright, parseArgs, help, sleep, mkdir, readJson };
process.on('unhandledRejection', e => { console.error('landing-studio: ' + String(e && e.message || e).split('\n')[0] + '\n(is the dev server up? next dev needs stdin open: run it with `< /dev/null` or in a real terminal)'); process.exit(2); });
