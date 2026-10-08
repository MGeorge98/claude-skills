import type { TitleData } from "./Title";

/* Exemplu: placeholder copy, no facts. Replace every field from facts.md. */
export const example: TitleData = {
  title: ["Exemplu de titlu", "care spune ideea"],
  accentLine: 1,
  speaker: "Numele vorbitorului · Rolul lui",
  event: "Exemplu de eveniment",
  date: "Data din facts.md",
  logo: { src: "logo.svg", width: 168, height: 56, alt: "Logo exemplu" },
  glow: "center",
};

export const notes = `Exemplu de notă: prima frază pe care o spui, înainte de primul click.
- cine ești, într-o propoziție
- de ce ești aici`;
