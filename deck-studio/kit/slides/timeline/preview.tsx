import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=timeline : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "timeline-cinci", type: "timeline", data: example },
  {
    id: "timeline-trei-fara-erou",
    type: "timeline",
    data: {
      point: "Trei momente, toate la fel de mari.",
      hero: false,
      moments: [
        { label: "Exemplu 1", title: "Primul moment", line: "Diacritice: ăâîșț." },
        { label: "Exemplu 2", title: "Al doilea moment", line: "Linia se desenează." },
        { label: "Exemplu 3", title: "Al treilea moment", line: "Fără erou." },
      ],
    },
  },
  {
    id: "timeline-sapte",
    type: "timeline",
    data: {
      kicker: "Exemplu cu șapte momente",
      point: "Peste cinci momente, titlurile se micșorează.",
      moments: [
        { label: "Luna 1", title: "Planul" },
        { label: "Luna 2", title: "Schița" },
        { label: "Luna 3", title: "Prototipul" },
        { label: "Luna 4", title: "Testul" },
        { label: "Luna 5", title: "Ajustarea" },
        { label: "Luna 6", title: "Lansarea" },
        { label: "Luna 7", title: "Rezultatul" },
      ],
    },
  },
];
