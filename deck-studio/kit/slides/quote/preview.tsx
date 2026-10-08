import type { SlideDef } from "@/kit/react/Slide";
import { example, placeholderPortrait } from "./data.example";

/* ?preview=quote : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "quote-simplu", type: "quote", data: example },
  {
    id: "quote-cu-portret",
    type: "quote",
    data: {
      text: "Exemplu: un citat scurt, cu diacritice ăâîșț ĂÂÎȘȚ, care umple două rânduri pe scenă.",
      attribution: "Nume Prenume (Exemplu)",
      role: "Rol, companie (Exemplu)",
      portrait: placeholderPortrait,
    },
  },
  {
    id: "quote-imediat",
    type: "quote",
    data: { ...example, text: "Exemplu: citat scurt, autorul apare imediat.", immediate: true },
  },
];
