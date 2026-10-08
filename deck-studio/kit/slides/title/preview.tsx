import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=title : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "title-full", type: "title", data: example },
  {
    id: "title-trei-randuri",
    type: "title",
    data: { ...example, title: ["Exemplu de titlu lung", "pe trei rânduri, cu diacritice:", "ăâîșț ĂÂÎȘȚ"], accentLine: 2, glow: "left" },
  },
  { id: "title-minim", type: "title", data: { title: ["Exemplu fără logo", "și fără fundal"] } },
];
