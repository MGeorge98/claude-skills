// Locate Playwright without installing anything. Order:
//   1. $PLAYWRIGHT_PATH (a directory containing the playwright or @playwright/test package)
//   2. node_modules/{playwright,@playwright/test,playwright-core} walking up from each start dir
//      (the target repo, the book folder, the cwd)
// Exits with code 2 and install instructions when it is not found.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const NAMES = ["playwright", "@playwright/test", "playwright-core"];

function candidates(start) {
  const out = [];
  let d = path.resolve(start);
  for (;;) {
    for (const n of NAMES) out.push(path.join(d, "node_modules", n));
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return out;
}

export async function loadPlaywright(...starts) {
  const tries = [];
  if (process.env.PLAYWRIGHT_PATH) {
    const p = process.env.PLAYWRIGHT_PATH;
    tries.push(p, ...NAMES.map((n) => path.join(p, "node_modules", n)));
  }
  for (const s of [...starts, process.cwd()]) if (s) tries.push(...candidates(s));
  for (const dir of tries) {
    const pkg = path.join(dir, "package.json");
    if (!fs.existsSync(pkg)) continue;
    const meta = JSON.parse(fs.readFileSync(pkg, "utf8"));
    const entry = (meta.exports && meta.exports["."] && (meta.exports["."].import || meta.exports["."].default)) || meta.main || "index.js";
    const file = path.join(dir, typeof entry === "string" ? entry : "index.js");
    const mod = await import(pathToFileURL(fs.existsSync(file) ? file : path.join(dir, "index.js")).href);
    const pw = mod.chromium ? mod : mod.default;
    if (pw && pw.chromium) return pw;
  }
  console.error(
    "Playwright not found. Either:\n" +
    "  - run from (or pass a path inside) a repo that has it in node_modules, or\n" +
    "  - set PLAYWRIGHT_PATH=/path/to/dir-with-node_modules, or\n" +
    "  - install it in a scratch folder:  npm i -D playwright && npx playwright install chromium\n" +
    "Ask the user before installing anything into their repo."
  );
  process.exit(2);
}

export function argv(spec) {
  // tiny flag parser: --name value | --flag ; the rest are positional
  const a = process.argv.slice(2), o = { _: [] };
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (k.startsWith("--")) {
      const name = k.slice(2);
      if (spec[name] === "bool") o[name] = true;
      else o[name] = a[++i];
    } else o._.push(k);
  }
  return o;
}
