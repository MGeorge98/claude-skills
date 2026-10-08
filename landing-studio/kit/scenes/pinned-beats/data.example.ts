/**
 * Exemplu: the story beats from the MBV Summit page (2026-10-08). The speaker's own story; for a new project
 * every line must come from the facts ledger. *stars* mark accent words.
 */
import type { PinnedBeatsProps } from "./PinnedBeats";

export const beatsExample: PinnedBeatsProps = {
  label: "Povestea",
  len: 320,
  lenDesktop: 380,
  beats: [
    { kind: "big-number", lines: ["14", "*14 proiecte* în același timp."] },
    { kind: "lines", lines: ["Pierdeam contextul.", "Nu-mi notam.", "Sau notam și uitam unde.", "Întârziam."] },
    { kind: "lines", lines: ["Echipa creștea."], sub: ["Ziua tot 24 de ore avea."] },
    { kind: "lines", lines: ["Singura documentație a firmei *eram eu.*"] },
    { kind: "quote", lines: ["Observ un tipar.", "*Singurul blocker din echipa ta ești tu.*"], attribution: "Un AI, după patru ore de discuție" },
  ],
};
