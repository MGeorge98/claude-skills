/**
 * Exemplu: copy from the MBV Summit page built 2026-10-08 (~/Downloads/SPEECH). Replace every string per project;
 * nothing here is a fact about a new client. No em dashes, diacritics kept.
 */
import type { HeroWordsProps } from "./HeroWords";
import type { NetworkBackdropProps } from "./NetworkBackdrop";

export const heroExample: Omit<HeroWordsProps, "children" | "right" | "below" | "top"> = {
  id: "sus",
  kicker: "MBV Summit · ce ți-am promis pe scenă",
  title: "Ai primit un agent",
  titleAccent: "la cheie",
  lead: "Completează formularul și ți-l trimit pe e-mail.",
  primary: { label: "Vreau agentul", href: "#formular" },
  secondary: { label: "Vezi călătoria", href: "#traseu" },
};

/** labels are words from the talk's "company memory" slide, not data */
export const networkExample: NetworkBackdropProps = {
  nodes: 16,
  labels: { 0: "clienți", 3: "facturi", 6: "echipă", 9: "proiecte", 11: "oferte", 14: "contracte" },
};
