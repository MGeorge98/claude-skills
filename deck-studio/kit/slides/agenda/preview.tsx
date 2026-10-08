import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=agenda : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "agenda-egale", type: "agenda", data: example },
  {
    id: "agenda-sase-curent-patru",
    type: "agenda",
    data: {
      kicker: "Exemplu, capitolul 4",
      point: "Suntem la jumătatea drumului.",
      current: 4,
      chapters: [
        { name: "Capitolul unu", line: "Rând scurt." },
        { name: "Capitolul doi", line: "Rând scurt." },
        { name: "Capitolul trei" },
        { name: "Capitolul patru", line: "Cel aprins acum." },
        { name: "Capitolul cinci" },
        { name: "Capitolul șase", line: "ăâîșț ĂÂÎȘȚ." },
      ],
    },
  },
  {
    id: "agenda-pe-pasi",
    type: "agenda",
    data: {
      kicker: "Exemplu pe pași",
      point: "Fiecare capitol apare la click.",
      stepped: true,
      chapters: [
        { name: "Primul capitol", line: "Intră la primul click." },
        { name: "Al doilea capitol", line: "Intră la al doilea." },
        { name: "Al treilea capitol", line: "Intră la al treilea." },
      ],
    },
  },
];
