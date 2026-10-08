/**
 * Exemplu: two inline SVG placeholders, same size (1200x800), neutral gradients. Nothing here is a fact about a
 * client; replace src, alt and the copy per project. No em dashes, diacritics kept.
 */
import type { BeforeAfterProps } from "./BeforeAfter";

function ph(text: string, from: string, to: string, ink: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<rect width="1200" height="800" fill="url(#g)"/>` +
    `<text x="50%" y="50%" fill="${ink}" font-family="sans-serif" font-size="96" font-weight="700" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const beforeAfterExample: BeforeAfterProps = {
  id: "inainte-dupa",
  label: "Comparație înainte și după",
  kicker: "Exemplu · înainte și după",
  heading: "Trage să vezi diferența",
  caption: "Exemplu: două imagini de aceeași dimensiune, înlocuiește-le cu cele ale proiectului.",
  before: { src: ph("Înainte", "#4b5058", "#7b818a", "#eceef1"), alt: "Exemplu, starea de dinainte", width: 1200, height: 800 },
  after: { src: ph("După", "#0f766e", "#4ade80", "#06231f"), alt: "Exemplu, starea de după", width: 1200, height: 800 },
  labels: { before: "Înainte", after: "După" },
  start: 50,
};
