import type { TimelineData } from "./Timeline";

/* Exemplu: placeholder copy, no facts. Replace every field from facts.md. */
export const example: TimelineData = {
  kicker: "Exemplu de traseu",
  point: "Drumul are cinci momente, iar ultimul contează.",
  moments: [
    { label: "Exemplu 1", title: "Începem" },
    { label: "Exemplu 2", title: "Construim", line: "O frază scurtă." },
    { label: "Exemplu 3", title: "Verificăm" },
    { label: "Exemplu 4", title: "Livrăm" },
    { label: "Exemplu 5", title: "Rezultatul", line: "Momentul eroului." },
  ],
  hero: true,
};

export const notes = `Exemplu de notă: spune ce arată linia înainte de primul click.
- un click pentru fiecare moment
- **ultimul moment** este cel pe care îl ții minte`;
