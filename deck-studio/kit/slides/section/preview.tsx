import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=section : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "section-stanga", type: "section", data: example, transition: "wipe" },
  {
    id: "section-centru-contur",
    type: "section",
    data: {
      number: "02",
      name: "Exemplu centrat, cu cifra în contur",
      line: "Diacritice: ăâîșț ĂÂÎȘȚ.",
      outline: true,
      align: "center",
      glow: "center",
    },
    transition: "wipe",
  },
  {
    id: "section-minim",
    type: "section",
    data: { name: "Capitol fără număr și fără rând" },
  },
];
