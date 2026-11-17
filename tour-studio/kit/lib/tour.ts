// The whole tour as data. Rewrite CHAPTERS and STEPS for each product; the engine never changes.
// Per step: go to `route`, reset the mock screen to INITIAL + `setup` (so any step opens correctly from ?pas=N),
// play the `before` beats (hover, click or typing), glide to `target` and click it, then show the caption next to
// the cursor. `ring` is the WHOLE block the step is about (a whole card, table or panel; never a slice of one).
// Every id is a `data-tour="…"` attribute. The cursor clicks the real element, so it must work for a visitor too.

import type { DemoState } from "@/lib/demo-state";

export type Chapter = { title: string; desc: string };
export type Beat = {
  target: string;
  hover?: boolean; // move over it and pause, no click
  typing?: string; // after the click, type this into DemoState.typed[target] (one buffer per field)
  until?: string; // then wait until this data-tour id or CSS selector is on screen (an animation ended, a reply came)
  timeout?: number; // ms cap for `until` (default 4000); the tour moves on and warns in the console
  wait?: number; // fixed pause after the beat (default 420 ms)
};
export type Step = {
  id: string;
  chapter: number; // index into CHAPTERS
  moment?: string; // when this happens in the story ("Luni, 08:30"); shown as a pill above the title
  route: string;
  target: string; // what the cursor clicks last
  ring?: string; // the whole block to outline while the caption is open (default: target)
  title: string; // an OUTCOME for the buyer, not a screen name
  body: string; // what you see + what it changes; 30 words max
  setup?: Partial<DemoState>; // the screen's state when the step starts (including the story's clock)
  before?: Beat[];
  until?: string; // after the final click, wait for this to appear before the caption (see Beat.until)
  timeout?: number;
};

export const STEP_PARAM = "pas";
export const FINAL_ROUTE = "/final";
export const MINUTES = 1; // shown on the start screen; about 15 s per step

export const CHAPTERS: Chapter[] = [
  { title: "Dimineața", desc: "Ce te așteaptă și ce aprobi." },
  { title: "După-amiaza", desc: "Găsești orice în câteva secunde." },
];

// PLACEHOLDER STORY for /exemplu. It shows every beat kind: hover, a click that changes state, typing into two
// fields, and waiting (`until`) for the screen's own animation before the caption.
export const STEPS: Step[] = [
  {
    id: "dimineata",
    chapter: 0,
    moment: "Luni, 08:30",
    route: "/exemplu",
    target: "exemplu-rand",
    ring: "exemplu-lista",
    title: "Știi de la prima oră ce te așteaptă",
    body: "Cifrele zilei sunt deja adunate. Deschizi cererea care așteaptă și vezi tot ce trebuie, fără să suni pe nimeni.",
    setup: { clock: 8.5 },
    before: [{ target: "exemplu-cifre", hover: true }],
  },
  {
    id: "aprobare",
    chapter: 0,
    moment: "Luni, 11:00",
    route: "/exemplu",
    target: "exemplu-aproba",
    ring: "exemplu-lista",
    title: "Aprobi dintr-un clic, nu dintr-un email",
    body: "Apeși „Aprobă”, iar cererea trece singură la pasul următor. Clientul află imediat, fără un telefon în plus.",
    setup: { clock: 11, selected: "1042" },
  },
  {
    id: "cautare",
    chapter: 1,
    moment: "Luni, 16:00",
    route: "/exemplu",
    target: "exemplu-trimite",
    ring: "exemplu-cautare",
    title: "Găsești orice în câteva secunde",
    body: "Scrii un nume și o sumă minimă și vezi pe loc cererile care contează. Nu mai cauți prin dosare și fișiere.",
    setup: { clock: 16, approved: ["1042"] },
    // two typing beats into two fields (one buffer each), then the click waits for the results to arrive
    before: [
      { target: "exemplu-intrebare", typing: "Firma", wait: 200 },
      { target: "exemplu-minim", typing: "2000", wait: 250 },
    ],
    until: "exemplu-rezultate",
  },
];

export const stepHref = (i: number) => `${STEPS[i - 1].route}?${STEP_PARAM}=${i}`;
