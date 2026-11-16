// The whole tour as data. Rewrite CHAPTERS and STEPS for each product; the engine never changes.
// `target` matches a `data-tour="…"` attribute on the screen at `route`. The URL holds the step as ?pas=N (1-based).

export type Chapter = { title: string; desc: string };
export type Step = {
  id: string;
  chapter: number; // index into CHAPTERS
  route: string; // the screen that holds the target
  target: string; // data-tour value; keep the element short enough to fit beside the popover / above the phone sheet
  title: string; // the benefit, in the buyer's words
  body: string; // one or two sentences, about 30 words max
  adaptable?: string; // what can be customised, shown after T.adaptable
};

export const STEP_PARAM = "pas";
export const FINAL_ROUTE = "/final";
export const MINUTES = 3; // shown on the start screen; about 15 s per step

export const CHAPTERS: Chapter[] = [
  { title: "Privire de ansamblu", desc: "Ce vezi dintr-o privire." },
  { title: "Lucrul de zi cu zi", desc: "Pasul care îți economisește cel mai mult timp." },
];

export const STEPS: Step[] = [
  {
    id: "sumar",
    chapter: 0,
    route: "/exemplu",
    target: "exemplu-sumar",
    title: "Tot ce contează, pe un singur ecran",
    body: "Cifrele zilei, adunate automat. Nu mai cauți prin fișiere și nu mai suni pe nimeni ca să afli unde ești.",
    adaptable: "indicatorii afișați și perioadele",
  },
  {
    id: "lista",
    chapter: 0,
    route: "/exemplu",
    target: "exemplu-lista",
    title: "Orice înregistrare, găsită în câteva secunde",
    body: "Cauți după nume sau număr și filtrezi pe status. Ce așteaptă o decizie de la tine apare primul.",
    adaptable: "coloanele, statusurile și filtrele",
  },
  {
    id: "actiune",
    chapter: 1,
    route: "/exemplu",
    target: "exemplu-actiune",
    title: "Un clic în loc de un email",
    body: "Clientul aprobă singur, iar lucrul trece direct la pasul următor.",
  },
];

export const firstStepOf = (chapter: number) => STEPS.findIndex((s) => s.chapter === chapter) + 1;
export const stepHref = (i: number) => `${STEPS[i - 1].route}?${STEP_PARAM}=${i}`;
