import type { TwoUpData } from "./TwoUp";

/* Exemplu: placeholder copy, no facts. Replace every field from facts.md. */
const svg = (a: string, b: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="230" viewBox="0 0 760 230">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="760" height="230" fill="url(#g)"/><circle cx="170" cy="115" r="62" fill="#ffffff" fill-opacity=".18"/>` +
      `<rect x="300" y="60" width="340" height="28" rx="14" fill="#ffffff" fill-opacity=".3"/>` +
      `<rect x="300" y="110" width="260" height="28" rx="14" fill="#ffffff" fill-opacity=".2"/></svg>`,
  );

export const example: TwoUpData = {
  kicker: "Exemplu de kicker",
  point: "Aceeași idee, înainte și după.",
  left: {
    label: "Înainte",
    title: "Exemplu de titlu stânga",
    lines: ["Prima linie, în stânga.", "A doua linie, scurtă."],
    image: { src: svg("#3a4a44", "#1d2723"), alt: "Exemplu: imagine de umplere, stânga", width: 760, height: 230 },
  },
  right: {
    label: "Acum",
    title: "Exemplu de titlu dreapta",
    lines: ["Prima linie, în dreapta.", "A doua linie, scurtă."],
    image: { src: svg("#1f7a5a", "#0b3a2b"), alt: "Exemplu: imagine de umplere, dreapta", width: 760, height: 230 },
  },
  verdict: "Verdictul vine ultimul.",
};

export const notes = `Exemplu de notă: spune ce e în stânga înainte de primul click.
- primul click aduce coloana din dreapta
- **verdictul** la ultimul click`;
