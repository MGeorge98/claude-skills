import type { ImageFullData } from "./ImageFull";

/* Exemplu: placeholder copy and a placeholder image, no facts. The owner supplies the photo (local, in public/). */
const placeholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a9a94"/><stop offset="1" stop-color="#3d4f48"/></linearGradient></defs>` +
      `<rect width="1920" height="1080" fill="url(#g)"/>` +
      `<circle cx="1380" cy="330" r="240" fill="#e8efec" fill-opacity=".55"/>` +
      `<rect x="120" y="140" width="720" height="520" rx="40" fill="#ffffff" fill-opacity=".35"/>` +
      `<rect x="900" y="560" width="900" height="360" rx="40" fill="#1a2420" fill-opacity=".45"/>` +
      `<path d="M0 860 L520 640 L980 820 L1500 600 L1920 780 V1080 H0Z" fill="#e8efec" fill-opacity=".4"/></svg>`,
  );

export const example: ImageFullData = {
  image: { src: placeholder, alt: "Exemplu: imagine de umplere, degrade neutru cu forme", width: 1920, height: 1080 },
  kicker: "Exemplu de kicker",
  title: "Titlul stă pe degradeu, nu pe poză.",
  caption: "Exemplu: legenda sau creditul apare la primul click.",
  scrim: "bottom",
};

export const notes = `Exemplu de notă: lasă imaginea să vorbească înainte de legendă.
- un click aduce **legenda**`;
