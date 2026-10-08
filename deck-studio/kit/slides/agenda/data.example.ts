import type { AgendaData } from "./Agenda";

/* Exemplu: placeholder copy, no facts. Replace every field from facts.md. */
export const example: AgendaData = {
  kicker: "Exemplu de agendă",
  point: "Patru capitole, în ordinea în care le parcurgem.",
  chapters: [
    { name: "Primul capitol", line: "Ce acoperă." },
    { name: "Al doilea capitol", line: "Ce acoperă." },
    { name: "Al treilea capitol", line: "Ce acoperă." },
    { name: "Ultimul capitol", line: "Ce acoperă." },
  ],
};

export const notes = `Exemplu de notă: cum e organizat discursul, în două fraze.
- agenda se repetă la fiecare capitol, cu capitolul curent aprins`;
