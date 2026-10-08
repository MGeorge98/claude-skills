import type { ClosingQrData } from "./ClosingQr";

/* Exemplu: placeholder copy, no facts. Replace every field from facts.md.
   /exemplu-qr.svg is a fake QR-like grid, not scannable: the owner supplies the real file in public/. */
export const example: ClosingQrData = {
  point: "Scanează codul și continuăm acolo.",
  url: "https://exemplu.ro/deck",
  qr: { src: "exemplu-qr.svg", alt: "Exemplu QR", width: 640, height: 640 },
  contact: { name: "Numele vorbitorului", line: "Contact din facts.md" },
  logo: { src: "logo.svg", width: 168, height: 56, alt: "Logo exemplu" },
};

export const notes = `Exemplu de notă: spune acțiunea o singură dată, apoi taci.
- lasă codul pe ecran cât timp se scanează
- repetă adresa dacă cineva nu poate scana`;
