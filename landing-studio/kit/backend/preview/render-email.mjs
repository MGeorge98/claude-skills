// Previzualizare e-mail, fără să trimită nimic.
// Rulare din rădăcina aplicației (Node 22+):
//   node --experimental-strip-types preview/render-email.mjs
// Aliasul "@/..." și importurile fără extensie sunt rezolvate de un hook mic, înregistrat mai jos.
// Alternativ: compilezi cu `npx tsc` și setezi RENDERER spre fișierul .js rezultat.
// Cu Playwright disponibil (NODE_PATH sau instalat) face și capturi: 640/390, luminos, întunecat, inversat.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

import { register } from "node:module";
const root = process.cwd();
register(
  "data:text/javascript," +
    encodeURIComponent(`
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
const src = ${JSON.stringify(path.join(root, "src"))};
export async function resolve(spec, ctx, next) {
  let p = null;
  if (spec.startsWith("@/")) p = src + "/" + spec.slice(2);
  else if (spec.startsWith(".") && ctx.parentURL?.startsWith("file:") && !/\\.[cm]?[jt]s$/.test(spec)) p = new URL(spec, ctx.parentURL).pathname;
  if (p) for (const e of [".ts", ".tsx", "/index.ts"]) if (existsSync(p + e)) return next(pathToFileURL(p + e).href, ctx);
  return next(spec, ctx);
}`),
);
const out = process.env.OUT || path.join(root, "preview-out");
mkdirSync(out, { recursive: true });

const mod = await import(pathToFileURL(path.resolve(root, process.env.RENDERER || "src/lib/email.ts")).href);
const sample = { nume: "Maria Popescu-Ionescu", companie: "Exemplu SRL", email: "maria@exemplu.ro", telefon: "0722000000", interese: [], sursa: "preview", la: new Date().toISOString() };
const cfgMod = await import(pathToFileURL(path.join(root, "src/config.ts")).href);
const logos = Object.fromEntries(cfgMod.email.logos.map((l) => [l.id, existsSync(path.join(root, "public", `email-logo-${l.id}.png`))]));
const { subject, html, text } = mod.renderParticipant(sample, { zipUrl: "https://exemplu.ro/agenti.zip", logos });

// cid:logo-<id>@landing-studio => public/email-logo-<id>.png
const local = html.replace(/cid:logo-([a-z0-9-]+)@landing-studio/g, (m, id) => {
  const f = path.join(root, "public", `email-logo-${id}.png`);
  return existsSync(f) ? pathToFileURL(f).href : m;
});
writeFileSync(path.join(out, "preview.html"), local);
writeFileSync(path.join(out, "preview.txt"), `${subject}\n\n${text}`);
console.log("subiect:", subject, "\nscris:", path.join(out, "preview.html"));

let chromium;
try {
  const req = createRequire(path.join(root, "package.json"));
  ({ chromium } = req("playwright"));
} catch {
  try {
    ({ chromium } = createRequire(import.meta.url)("playwright"));
  } catch {
    console.log("Playwright nu e disponibil (setează NODE_PATH); am sărit peste capturi.");
    process.exit(0);
  }
}
const browser = await chromium.launch();
const modes = [
  { name: "light", scheme: "light", css: "" },
  { name: "dark", scheme: "dark", css: "" },
  { name: "invert", scheme: "light", css: "html{filter:invert(1) hue-rotate(180deg)}" },
];
for (const w of [640, 390]) {
  for (const m of modes) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: m.scheme });
    await page.goto(pathToFileURL(path.join(out, "preview.html")).href, { waitUntil: "load" });
    if (m.css) await page.addStyleTag({ content: m.css });
    const f = path.join(out, `email-${w}-${m.name}.png`);
    await page.screenshot({ path: f, fullPage: true });
    console.log("captură:", f);
    await page.close();
  }
}
await browser.close();
