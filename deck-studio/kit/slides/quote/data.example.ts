import type { QuoteData } from "./Quote";

/* Exemplu: placeholder copy, no facts. Replace every field from facts.md. */
export const example: QuoteData = {
  text: "Exemplu: aici vine citatul, copiat cuvânt cu cuvânt din facts.md, în cel mult douăzeci și patru de cuvinte.",
  attribution: "Nume Prenume (Exemplu)",
  role: "Rol, companie (Exemplu)",
};

export const notes = `Exemplu de notă: lasă citatul să stea o secundă.
- citatul e **copiat din facts.md**, nu parafrazat
- un click aduce autorul`;

/** Placeholder portrait: an inline SVG silhouette, never a real person. */
export const placeholderPortrait = {
  src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgMTYwIDE2MCI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiMxNjM1MmEiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjYyIiByPSIzMCIgZmlsbD0iIzJmYzY4ZiIvPjxwYXRoIGQ9Ik0yNCAxNjBjMC0zNCAyNS01NiA1Ni01NnM1NiAyMiA1NiA1NnoiIGZpbGw9IiMyZmM2OGYiLz48L3N2Zz4=",
  alt: "Exemplu: siluetă, nu o persoană reală",
  width: 160,
  height: 160,
};
