/**
 * Exemplu: neutral placeholder copy and a geometric mark (a hexagon with a chevron), not a real brand.
 * Replace every string per project with lines from facts.md. No em dashes, diacritics kept.
 */
import type { IntroSequenceProps } from "./IntroSequence";

/** hexagon outline plus an inner chevron, 64 x 64 box */
export const LOGO_EXAMPLE = "M32 5 L55.4 18.5 L55.4 45.5 L32 59 L8.6 45.5 L8.6 18.5 Z M21 37 L32 26 L43 37";

export const introExample: IntroSequenceProps = {
  id: "intro",
  logo: LOGO_EXAMPLE,
  wordmark: "Atelier de exemplu",
  label: "Exemplu · ecran de deschidere",
  duration: 1600,
};

/** the placeholder first scene the preview mounts under the curtain */
export const heroPlaceholderExample = {
  kicker: "Exemplu · primul ecran",
  title: "Pagina e deja aici, sub cortină",
  lead: "Textul acesta este randat și desenat înainte ca intro-ul să se termine, așa că nimic nu așteaptă după animație.",
};
