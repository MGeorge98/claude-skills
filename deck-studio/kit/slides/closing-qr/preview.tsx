import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=closing-qr : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "closing-qr-complet", type: "closing-qr", data: example },
  {
    id: "closing-qr-la-click",
    type: "closing-qr",
    data: {
      point: "Primul click aduce codul, nu înainte.",
      url: "https://exemplu.ro/deck",
      qr: example.qr,
      revealQr: true,
    },
  },
  {
    id: "closing-qr-punct-lung",
    type: "closing-qr",
    data: {
      ...example,
      point: "O propoziție mai lungă, pe trei rânduri, cu diacritice: ăâîșț.",
      contact: { name: "Numele vorbitorului · Rolul", line: "Exemplu de contact" },
      revealQr: true,
    },
  },
];
