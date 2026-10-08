/**
 * Exemplu: toate cifrele de mai jos sunt valori de umplutură, nu fapte. Înlocuiește fiecare cu o cifră
 * verificată din facts.md (F-id în comentariu) și șterge nota. Fără linii lungi, fără cratime lungi.
 */
import type { NumberWallProps } from "./NumberWall";

const nota = "Exemplu: înlocuiește cu F-id din facts.md";

export const numberWallExample: NumberWallProps = {
  id: "cifre",
  label: "Exemplu: cifre cheie",
  kicker: "Exemplu",
  heading: "Cifrele tale, în loc de adjective",
  items: [
    { value: 123, suf: "+", caption: "Exemplu: număr întreg cu plus", note: nota },
    { value: 4.8, suf: "/5", decimals: 1, caption: "Exemplu: valoare cu o zecimală", note: nota },
    { value: 45, suf: "%", caption: "Exemplu: procent de înlocuit", note: nota },
    { value: 8900, pre: "~", caption: "Exemplu: cifră mare cu prefix", note: nota },
    { value: 6.7, suf: " ore", decimals: 1, caption: "Exemplu: durată cu unitate", note: nota },
    { value: 12, caption: "Exemplu: fără sufix și fără notă" },
  ],
};
