/**
 * Exemplu: texte de înlocuit pentru fiecare proiect. Nimic de aici nu este un fapt despre un client nou.
 * Fără linii lungi de pauză, cu diacritice, fără nume de branduri terțe, fără ani reali.
 */
import type { TimelineProps } from "./Timeline";

const svg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#1a1d26"/><path d="M40 280 L200 160 L300 230 L460 90 L600 200" fill="none" stroke="#7c9cff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
);

export const timelineExample: TimelineProps = {
  id: "cronologie",
  kicker: "Exemplu · Cronologie",
  heading: "Exemplu: drumul de la prima idee la rezultat",
  label: "Exemplu: etapele unui proiect",
  side: "alternate",
  entries: [
    { date: "Pasul 1", title: "Exemplu: prima discuție", lines: ["Stabilim ce vrei să obții și ce există deja."] },
    { date: "Pasul 2", title: "Exemplu: planul", lines: ["Împărțim lucrul în etape mici.", "Fiecare etapă are un rezultat clar."] },
    {
      date: "Luna 1",
      title: "Exemplu: prima versiune",
      lines: ["Prima variantă este gata de văzut.", "Primești o previzualizare și spui ce schimbi."],
      image: { src: `data:image/svg+xml;charset=utf-8,${svg}`, alt: "Exemplu: imagine de umplutură cu o linie în urcare", width: 640, height: 360 },
    },
    { date: "Luna 2", title: "Exemplu: ajustări", lines: ["Aplicăm observațiile tale.", "Verificăm fiecare pagină pe telefon și pe calculator.", "Rămâne o singură listă de lucruri de închis."] },
    { date: "Luna 3", title: "Exemplu: lansarea", lines: ["Publicăm și urmărim primele zile."] },
    { date: "Luna 4", title: "Exemplu: după lansare", lines: ["Strângem ce a mers bine.", "Stabilim ce urmează."] },
  ],
};
