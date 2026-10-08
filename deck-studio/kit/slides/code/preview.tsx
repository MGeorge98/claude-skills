import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=code : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */

/* 30 lines: longer than the 18 row window, so ranges 2 and 3 move the rows by transform.
   Neutral example code, tabs on purpose (they become 2 spaces) and one line long enough to be clipped. */
const lung = [
  "// Exemplu: un coș de cumpărături, fără bibliotecă",
  "type Produs = { cod: string; nume: string; pret: number };",
  "type Linie = { produs: Produs; cantitate: number };",
  "",
  "export function creeazaCos() {",
  "\tconst linii: Linie[] = [];",
  "",
  "\tfunction adauga(produs: Produs, cantitate = 1) {",
  "\t\tconst gasit = linii.find((l) => l.produs.cod === produs.cod);",
  "\t\tif (gasit) gasit.cantitate += cantitate;",
  "\t\telse linii.push({ produs, cantitate });",
  "\t}",
  "",
  "\tfunction scoate(cod: string) {",
  "\t\tconst i = linii.findIndex((l) => l.produs.cod === cod);",
  "\t\tif (i >= 0) linii.splice(i, 1);",
  "\t}",
  "",
  "\tfunction total(): number {",
  "\t\treturn linii.reduce((s, l) => s + l.produs.pret * l.cantitate, 0);",
  "\t}",
  "",
  "\tfunction rezumat(): string {",
  "\t\tconst bucati = linii.reduce((s, l) => s + l.cantitate, 0);",
  "\t\treturn `${bucati} produse, total ${total().toFixed(2)} lei, calculat din toate liniile coșului de cumpărături`;",
  "\t}",
  "",
  "\treturn { adauga, scoate, total, rezumat };",
  "}",
  "// sfârșitul exemplului",
].join("\n");

export const variants: SlideDef[] = [
  { id: "code-scurt", type: "code", data: example },
  {
    id: "code-treizeci-de-randuri",
    type: "code",
    data: {
      kicker: "Exemplu lung",
      point: "Peste 18 rânduri, codul urcă spre zonă.",
      lang: "ts",
      code: lung,
      ranges: [
        { from: 8, to: 12, caption: "Adăugarea crește cantitatea dacă produsul există." },
        { from: 19, to: 21, caption: "Totalul se calculează la cerere, nu se ține minte." },
        { from: 23, to: 26, caption: "Rândul lung e tăiat cu o estompare, nu rupt." },
      ],
    },
  },
  {
    id: "code-start-line",
    type: "code",
    data: {
      point: "Numerotarea poate porni din mijlocul fișierului.",
      code: "if (lista.length === 0) {\n  return null;\n}\nreturn lista[0];",
      startLine: 120,
      ranges: [
        { from: 120, to: 122, caption: "Cazul gol iese primul." },
        { from: 123, to: 123, caption: "Un singur rând evidențiat." },
      ],
    },
  },
];
