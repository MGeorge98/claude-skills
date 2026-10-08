/**
 * Exemplu: a generic five-step way of working, placeholder copy only (no names, numbers or claims).
 * For a real project every line must come from the facts ledger. Images are inline SVG placeholders.
 */
import type { HorizontalPinnedProps } from "./HorizontalPinned";

const ph = (label: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='840' height='520' viewBox='0 0 840 520'>` +
      `<rect width='840' height='520' fill='#ffffff' fill-opacity='.05'/>` +
      `<path d='M0 520 L300 250 L470 400 L600 300 L840 520 Z' fill='#ffffff' fill-opacity='.08'/>` +
      `<circle cx='640' cy='140' r='54' fill='#ffffff' fill-opacity='.1'/>` +
      `<text x='40' y='70' font-family='monospace' font-size='26' fill='#ffffff' fill-opacity='.5'>${label}</text>` +
      `</svg>`,
  );

export const horizontalExample: HorizontalPinnedProps = {
  kicker: "Exemplu · Cum lucrăm",
  heading: "Cinci pași, de la idee la lansare.",
  label: "Exemplu: cum lucrăm",
  cards: [
    {
      kicker: "Pasul 1",
      title: "Ascultăm",
      lines: ["Pornim de la ce vrei să obții.", "Notăm întrebările înainte de răspunsuri."],
      img: { src: ph("schiță 1"), alt: "Imagine exemplu", width: 840, height: 520 },
    },
    {
      kicker: "Pasul 2",
      title: "Schițăm",
      lines: ["Structura paginii, pe hârtie.", "Fiecare secțiune are un singur rost."],
      img: { src: ph("schiță 2"), alt: "Imagine exemplu", width: 840, height: 520 },
    },
    {
      kicker: "Pasul 3",
      title: "Construim",
      lines: ["Textul tău, în fonturile tale.", "Mișcarea vine la urmă, nu la început."],
      img: { src: ph("schiță 3"), alt: "Imagine exemplu", width: 840, height: 520 },
    },
    {
      kicker: "Pasul 4",
      title: "Verificăm",
      lines: ["Pe telefon și pe desktop.", "Cu mișcarea oprită și fără JavaScript."],
      img: { src: ph("schiță 4"), alt: "Imagine exemplu", width: 840, height: 520 },
    },
    {
      kicker: "Pasul 5",
      title: "Lansăm",
      lines: ["Pagina pleacă doar după acordul tău."],
      img: { src: ph("schiță 5"), alt: "Imagine exemplu", width: 840, height: 520 },
    },
  ],
};
