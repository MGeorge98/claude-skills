import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=cascade-list : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "cascade-list-patru", type: "cascade-list", data: example },
  {
    id: "cascade-list-trei-cu-subrand",
    type: "cascade-list",
    data: {
      kicker: "Exemplu cu subrânduri",
      point: "Trei rânduri, fiecare cu o explicație.",
      rows: [
        { text: "Rândul unu", sub: "Subrândul intră imediat după rând." },
        { text: "Rândul doi", sub: "Același pas, întârziere scurtă." },
        { text: "Rândul trei", sub: "Diacritice: ăâîșț ĂÂÎȘȚ." },
      ],
    },
  },
  {
    id: "cascade-list-sase",
    type: "cascade-list",
    data: {
      kicker: "Exemplu cu șase rânduri",
      point: "Peste patru rânduri, lista curge pe două coloane.",
      numbered: true,
      rows: [
        { text: "Unu", sub: "Subrând scurt." },
        { text: "Doi", sub: "Subrând scurt." },
        { text: "Trei", sub: "Subrând scurt." },
        { text: "Patru", sub: "Subrând scurt." },
        { text: "Cinci", sub: "Subrând scurt." },
        { text: "Șase", sub: "Subrând scurt." },
      ],
      closing: "Fraza de final, pe un rând.",
    },
  },
];
