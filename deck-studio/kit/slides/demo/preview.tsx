import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=demo : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "demo-local", type: "demo", data: example },
  {
    id: "demo-adresa-moarta",
    type: "demo",
    data: {
      point: "Adresa nu răspunde: rămâne captura.",
      url: "http://127.0.0.1:59999/",
      fallback: example.fallback,
      badge: "demo",
      note: "Exemplu: o adresă la care nu răspunde nimeni, ca pe o scenă fără internet.",
    },
  },
];
