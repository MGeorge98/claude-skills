import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=two-up : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "two-up-imagini-verdict", type: "two-up", data: example },
  {
    id: "two-up-text-fara-verdict",
    type: "two-up",
    data: {
      kicker: "Exemplu fără imagini",
      point: "Problema și soluția, doar text.",
      left: { label: "Problema", lines: ["Exemplu de problemă, prima linie.", "A doua linie, cu diacritice: ăâîșț.", "A treia linie."] },
      right: { label: "Soluția", lines: ["Exemplu de soluție, prima linie.", "A doua linie, cu diacritice: ĂÂÎȘȚ.", "A treia linie."] },
    },
  },
  {
    id: "two-up-swap",
    type: "two-up",
    data: {
      mode: "swap",
      kicker: "Exemplu swap",
      point: "Coloana din dreapta ia locul celei din stânga.",
      left: { label: "Înainte", title: "Exemplu: starea veche", lines: ["Linia unu, starea veche.", "Linia doi, starea veche."] },
      right: { label: "Acum", title: "Exemplu: starea nouă", lines: ["Linia unu, starea nouă.", "Linia doi, starea nouă."] },
      verdict: "Același loc, altă stare.",
    },
  },
];
