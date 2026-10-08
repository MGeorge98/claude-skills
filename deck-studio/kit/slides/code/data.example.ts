import type { CodeData } from "./Code";

/* Exemplu: placeholder copy, no facts. The snippet is a neutral example, not any product's code.
   Replace every field from facts.md. */
export const example: CodeData = {
  kicker: "Exemplu de cod",
  point: "Trei pași: citești, filtrezi, afișezi.",
  lang: "tsx",
  code: `type Rand = { nume: string; activ: boolean };

// pasul 1: citim lista
function citeste(sursa: string): Rand[] {
  return JSON.parse(sursa) as Rand[];
}

// pasul 2: păstrăm doar rândurile active
function filtreaza(randuri: Rand[]): Rand[] {
  return randuri.filter((r) => r.activ);
}

// pasul 3: afișăm numele
export function Lista({ sursa }: { sursa: string }) {
  const randuri = filtreaza(citeste(sursa));
  return <ul>{randuri.map((r) => <li key={r.nume}>{r.nume}</li>)}</ul>;
}`,
  ranges: [
    { from: 3, to: 6, caption: "Citim lista dintr-un text JSON." },
    { from: 8, to: 11, caption: "Păstrăm doar rândurile active." },
    { from: 13, to: 17, caption: "Componenta leagă cei doi pași." },
  ],
};

export const notes = `Exemplu de notă: spune ce face codul înainte de primul click.
- un click pentru fiecare bloc evidențiat
- **legenda** de sub cod spune ideea, nu sintaxa`;
