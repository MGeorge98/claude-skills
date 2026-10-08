/**
 * Exemplu: placeholder copy and an inline SVG portrait (neutral gradient, the word "Portret"). Replace every
 * string per project; nothing here is a fact about a real person. No em dashes, diacritics kept.
 */
import type { PortraitHeroProps } from "./PortraitHero";

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b7a74"/><stop offset="1" stop-color="#2c3733"/></linearGradient></defs>' +
  '<rect width="800" height="1000" fill="url(#g)"/>' +
  '<text x="400" y="520" text-anchor="middle" font-family="sans-serif" font-size="72" fill="#e6ece9">Portret</text></svg>';

export const portraitExample: PortraitHeroProps = {
  id: "despre",
  portrait: { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, alt: "Exemplu: portretul invitatului", width: 800, height: 1000 },
  label: "Exemplu · Cine sunt",
  name: "Prenume Nume",
  role: "Funcția ta · Compania ta",
  bio: [
    "Exemplu: o frază scurtă despre ce faci în fiecare zi.",
    "Exemplu: a doua frază, despre ce construiești acum.",
    "Exemplu: a treia frază, despre ce îți place să împărtășești.",
  ],
  links: [
    { label: "Instagram", href: "https://example.com/instagram" },
    { label: "LinkedIn", href: "https://example.com/linkedin" },
    { label: "Site", href: "https://example.com" },
  ],
};
