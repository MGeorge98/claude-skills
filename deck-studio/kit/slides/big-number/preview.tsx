import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=big-number : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "big-number-procent", type: "big-number", data: example },
  {
    id: "big-number-zecimale-unitate",
    type: "big-number",
    data: {
      kicker: "Exemplu cu zecimale",
      value: 3.7,
      decimals: 1,
      unit: "ore",
      meaning: "Exemplu: o valoare cu zecimală și unitate, ăâîșț.",
      note: "Exemplu: înlocuiește cu F-id din facts.md",
    },
  },
  {
    id: "big-number-imediat-prefix",
    type: "big-number",
    data: {
      value: 1250,
      pre: "+",
      unit: "lei",
      meaning: "Exemplu: fără numărătoare, totul apare odată cu slide-ul.",
      note: "Exemplu: înlocuiește cu F-id din facts.md",
      immediate: true,
    },
  },
];
