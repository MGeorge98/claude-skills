/**
 * Exemplu: placeholder shots (inline SVG, neutral gradients) and generic captions. Nothing here is a fact about a
 * client; replace src, alt, caption and href per project. No em dashes, diacritics kept.
 */
import type { SetCollageProps, CollageShot } from "./SetCollage";

function ph(n: number, w: number, h: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4250"/><stop offset="1" stop-color="#6b7686"/></linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<text x="50%" y="50%" fill="#e8ecf1" font-family="sans-serif" font-size="${Math.round(h / 12)}" text-anchor="middle" dominant-baseline="middle">Exemplu ${n}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const shot = (n: number, w: number, h: number, caption: string): CollageShot => ({
  src: ph(n, w, h),
  alt: `Exemplu ${n}, captură de proiect`,
  width: w,
  height: h,
  caption,
  href: `https://example.com/exemplu-${n}`,
});

export const collageExample: SetCollageProps = {
  id: "proiecte",
  label: "Proiecte · exemplu",
  heading: "Lucruri pe care le-am construit",
  shots: [
    shot(1, 800, 1000, "Exemplu 1 · pagină de prezentare"),
    shot(2, 1000, 750, "Exemplu 2 · aplicație web"),
    shot(3, 1000, 750, "Exemplu 3 · magazin online"),
    shot(4, 1000, 750, "Exemplu 4 · panou de administrare"),
    shot(5, 1000, 750, "Exemplu 5 · site de eveniment"),
  ],
};
