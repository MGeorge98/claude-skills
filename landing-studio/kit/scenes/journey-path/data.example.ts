/**
 * Exemplu: texte de înlocuit pentru fiecare proiect. Nimic de aici nu este un fapt despre un client nou.
 * Fără linii lungi de pauză, cu diacritice, fără nume de branduri terțe.
 */
import type { JourneyPathProps } from "./JourneyPath";

export const journeyExample: JourneyPathProps = {
  id: "traseu",
  label: "Exemplu · Mai departe",
  heading: "Exemplu: iată cum poți continua drumul",
  guest: { accent: "#8b5cf6" },
  steps: [
    { kicker: "Pasul 1", title: "Exemplu: începe mic", lines: ["O primă acțiune care durează câteva minute."] },
    { kicker: "Pasul 2", title: "Exemplu: repetă", lines: ["Aceeași acțiune, de data aceasta cu propriile date."] },
    { kicker: "Pasul 3", title: "Exemplu: extinde", lines: ["Adaugă încă o parte din munca ta de zi cu zi.", "Păstrezi controlul asupra fiecărui pas."] },
    { kicker: "Pasul 4", title: "Exemplu: rezultatul final", lines: ["Ultimul pas este cel mai mare.", "Aici ajungi cu tot ce ai construit."], hero: true },
  ],
};
