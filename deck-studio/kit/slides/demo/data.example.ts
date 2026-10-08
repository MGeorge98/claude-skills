import type { DemoData } from "./Demo";

/* Exemplu: placeholder copy, no facts. The url is the work app's own preview page, so it runs offline;
   the fallback is a screenshot of that page. A real demo points at the live product. */
export const example: DemoData = {
  kicker: "Exemplu de demo",
  point: "Pagina rulează live, chiar în slide.",
  url: "/?preview=title",
  fallback: { src: "exemplu-demo.png", alt: "Exemplu: captura paginii din demo", width: 2400, height: 1350 },
  note: "Click în cadru pentru a folosi pagina; click în afara lui pentru slide-ul următor.",
};

export const notes = `Exemplu de notă: spune ce se vede înainte să atingi demo-ul.
- click în cadru, apoi click în afara lui ca să mergi mai departe
- dacă nu pornește, rămâne captura: povestește peste ea`;
