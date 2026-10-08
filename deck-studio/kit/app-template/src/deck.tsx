import type { SlideDef, Transition } from "@/kit/react/Deck";

/* THE ORDER. Exemplu deck: placeholder copy, no facts. The integrator rewrites this file from outline.md;
   every name, number and quote comes from facts.md. */
export const DECK_ID = "exemplu";
export const DECK_TRANSITION: Transition = "fade";

const logo = { src: "logo.svg", width: 168, height: 56, alt: "Logo exemplu" };

export const DECK: SlideDef[] = [
  {
    id: "titlu",
    type: "title",
    data: {
      title: ["Exemplu de deck", "făcut din kit"],
      accentLine: 1,
      speaker: "Numele vorbitorului · Rolul lui",
      event: "Exemplu de eveniment",
      date: "Data din facts.md",
      logo,
      glow: "center",
    },
    notes: "Exemplu: prima frază, înainte de orice click.\n- cine ești, într-o propoziție",
  },
  {
    id: "cum-merge",
    type: "cascade-list",
    data: {
      kicker: "Exemplu · cum merge",
      point: "Un click, un rând. Nimic nu sare.",
      rows: [
        { text: "Săgeata dreapta: pasul următor." },
        { text: "Săgeata stânga: pasul de dinainte." },
        { text: "Adresa ține slide-ul și pasul." },
        { text: "P deschide fereastra cu note." },
      ],
      closing: "Merge și fără internet.",
    },
    notes: "Exemplu: arată fiecare tastă pe rând.\n- **un rând la fiecare click**\n- fraza de final la ultimul click",
  },
  {
    id: "reguli",
    type: "cascade-list",
    transition: "wipe",
    data: {
      kicker: "Exemplu · subrânduri",
      point: "Trei reguli pentru fiecare slide.",
      rows: [
        { text: "O singură idee.", sub: "Titlul o spune." },
        { text: "Puține cuvinte.", sub: "Altfel sunt două slide-uri." },
        { text: "Pașii nu mută nimic.", sub: "Locul e păstrat." },
      ],
    },
    notes: "Exemplu: subrândul intră în același pas, puțin după rând.",
  },
  {
    id: "final",
    type: "title",
    transition: "none",
    data: { title: ["Mulțumesc"], speaker: "Numele vorbitorului · contactul din facts.md", logo, glow: "left" },
  },
];
