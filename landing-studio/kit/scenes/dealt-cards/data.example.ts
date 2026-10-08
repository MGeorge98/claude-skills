/**
 * Exemplu: the three "De mâine" cards from the MBV Summit page (2026-10-08), the speaker's own advice.
 * For a new project every line must come from the facts ledger. *stars* mark accent words.
 */
import type { DealtCardsProps } from "./DealtCards";

export const dealtCardsExample: DealtCardsProps = {
  label: "Exemplu: ce poți face de mâine",
  len: 253,
  lenDesktop: 276,
  heading: { kicker: "Exemplu · Ce poți face de mâine?", title: "Trei lucruri. *Trei pași.*" },
  cards: [
    {
      kicker: "Clienți",
      title: "Află cât depinzi de *cel mai mare client.*",
      lines: ["Facturile pe 12 luni, date unui AI.", "Cât la sută aduce fiecare client."],
    },
    {
      kicker: "Documente",
      title: "Scoate firma *din capul tău.*",
      lines: ["Un singur folder, pe clienți: contracte, facturi, procese, oferte.", "Așa AI-ul le poate citi."],
    },
    {
      kicker: "Întâlniri",
      title: "Scoate o întâlnire *din capul tău.*",
      lines: ["Înregistreaz-o.", "AI-ul face minuta pentru client și task-urile pentru echipă."],
    },
  ],
};
