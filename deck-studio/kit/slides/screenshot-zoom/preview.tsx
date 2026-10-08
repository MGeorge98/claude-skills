import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=screenshot-zoom : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "screenshot-zoom-patru", type: "screenshot-zoom", data: example },
  {
    id: "screenshot-zoom-doua-fara-bara",
    type: "screenshot-zoom",
    data: {
      point: "Fără bară de browser, două zone.",
      image: example.image,
      regions: [
        { x: 560, y: 1104, w: 1240, h: 816, label: "Zona 3", note: "Diacritice: ăâîșț ĂÂÎȘȚ." },
        { x: 1880, y: 208, w: 1240, h: 816, label: "Zona 2" },
      ],
    },
  },
  {
    id: "screenshot-zoom-detaliu-mic",
    type: "screenshot-zoom",
    data: {
      kicker: "Exemplu cu adresă în bară",
      point: "O zonă mică se oprește la mărimea reală.",
      image: example.image,
      chrome: "localhost:5173/panou",
      regions: [{ x: 600, y: 240, w: 520, h: 140, label: "Titlul zonei 1", note: "Scara nu trece de 1:1." }],
    },
  },
];
