/**
 * Exemplu: placeholder copy that only describes the scene itself (no claims about anyone).
 * Panels are inline SVG placeholders; on a real page each one is a photo or screenshot with explicit
 * width and height, and every line of copy comes from the facts ledger.
 */
import type { StickySplitProps } from "./StickySplit";

const placeholder = (n: number, a: string, b: string) =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="1200" height="900" fill="url(#g)"/>` +
      `<circle cx="600" cy="450" r="210" fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="2"/>` +
      `<text x="600" y="472" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="56" letter-spacing="6" fill="#ffffff" fill-opacity=".72">PANOU ${n}</text>` +
      `</svg>`,
  );

export const splitExample: StickySplitProps = {
  label: "Exemplu: panou fix și pași",
  len: 300,
  lenDesktop: 360,
  beats: [
    {
      kicker: "Exemplu · 01",
      title: "Panoul stă pe loc.",
      lines: ["Textul de lângă el se schimbă la fiecare pas.", "Imaginea ține ritmul cu textul."],
    },
    {
      kicker: "Exemplu · 02",
      title: "Un pas, o idee.",
      lines: ["Fiecare pas are titlul lui și cel mult trei rânduri scurte."],
    },
    {
      kicker: "Exemplu · 03",
      title: "Trecerea e lină.",
      lines: ["Panourile se înlocuiesc treptat, fără salturi.", "Punctele din colț arată unde ești."],
    },
    {
      kicker: "Exemplu · 04",
      title: "Ultimul pas rămâne.",
      lines: ["Stă pe ecran până la capătul secțiunii, apoi pagina continuă."],
    },
  ],
  panels: [
    { src: placeholder(1, "#2a2d33", "#15171b"), alt: "Exemplu: panoul 1", width: 1200, height: 900 },
    { src: placeholder(2, "#33302a", "#18160f"), alt: "Exemplu: panoul 2", width: 1200, height: 900 },
    { src: placeholder(3, "#2a3330", "#111816"), alt: "Exemplu: panoul 3", width: 1200, height: 900 },
    { src: placeholder(4, "#302a33", "#16111a"), alt: "Exemplu: panoul 4", width: 1200, height: 900 },
  ],
};
