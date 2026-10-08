import type { CascadeListData } from "./CascadeList";

/* Exemplu: placeholder copy, no facts. Replace every field from facts.md. */
export const example: CascadeListData = {
  kicker: "Exemplu de kicker",
  point: "Titlul spune ideea, nu subiectul.",
  rows: [
    { text: "Primul rând apare la primul click." },
    { text: "Al doilea rând vine la al doilea." },
    { text: "Locul fiecărui rând e păstrat." },
    { text: "Nimic nu sare pe ecran." },
  ],
  closing: "Fraza de final apare ultima.",
};

export const notes = `Exemplu de notă: ce spui înainte de primul rând.
- un click pentru fiecare rând
- **fraza de final** la ultimul click`;
