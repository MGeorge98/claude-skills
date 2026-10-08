import type { ScreenshotZoomData } from "./ScreenshotZoom";

/* Exemplu: placeholder copy, no facts. The image is a neutral fake app window (1600 x 1000 captured at 2x);
   the owner supplies the real screenshot in public/ and the regions in its own pixels. */
export const example: ScreenshotZoomData = {
  kicker: "Exemplu de captură",
  point: "Fiecare click duce privirea pe o zonă.",
  image: { src: "exemplu-captura.png", alt: "Exemplu: fereastra unei aplicații cu patru zone numerotate", width: 3200, height: 2000 },
  chrome: true,
  regions: [
    { x: 560, y: 208, w: 1240, h: 816, label: "Zona 1", note: "Prima zonă, sus în stânga." },
    { x: 1880, y: 208, w: 1240, h: 816, label: "Zona 2", note: "A doua zonă, sus în dreapta." },
    { x: 560, y: 1104, w: 1240, h: 816, label: "Zona 3", note: "A treia zonă, jos în stânga." },
    { x: 1880, y: 1104, w: 1240, h: 816, label: "Zona 4", note: "Ultima zonă, jos în dreapta." },
  ],
};

export const notes = `Exemplu de notă: arată întâi ecranul întreg, spune ce e.
- un click pentru fiecare zonă, cadrul se apropie
- înapoi cu săgeata stânga: cadrul se depărtează`;
