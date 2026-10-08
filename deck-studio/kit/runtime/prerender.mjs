// deck-studio · prerender (kit-owned). Runs after `vite build`: renders THE ORDER (src/deck.tsx) to HTML
// through Vite's SSR loader and writes it into dist/index.html inside <div id="root">, so the built deck
// reads as a stacked document without JS and when the 3.5 s failsafe fires.
//   node src/kit/runtime/prerender.mjs [distDir=dist]
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, process.argv[2] || "dist", "index.html");
const src = fs.readFileSync(file, "utf8");
const marker = /<div id="root">[\s\S]*?<\/div>\s*(?=<\/body>)/;
if (!marker.test(src)) {
  console.error(`prerender: no <div id="root"></div> before </body> in ${file}`);
  process.exit(1);
}
const vite = await createServer({ root, logLevel: "error", appType: "custom", server: { middlewareMode: true, hmr: false } });
try {
  const { render } = await vite.ssrLoadModule("/src/kit/react/server.tsx");
  const html = render();
  fs.writeFileSync(file, src.replace(marker, () => `<div id="root">${html}</div>\n`));
  console.log(`prerender: ${(html.length / 1024).toFixed(1)} KB of slides into ${path.relative(root, file)}`);
} finally {
  await vite.close();
}
