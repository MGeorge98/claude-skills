import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { fileURLToPath } from "node:url";

// One file out: dist/index.html carries the JS, the CSS and the fonts, so it opens by double click and
// works offline. Files in public/ (logo, images, videos) are copied next to it.
// `npm run build` then prerenders the slides into it (src/kit/runtime/prerender.mjs) for the no-JS document.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: Number(process.env.PORT) || 5180, strictPort: true },
  preview: { port: Number(process.env.PORT) || 5190, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
