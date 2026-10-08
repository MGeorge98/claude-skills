import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=image-full : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "image-full-jos", type: "image-full", data: example },
  {
    id: "image-full-stanga-titlu-lung",
    type: "image-full",
    data: {
      image: example.image,
      kicker: "Exemplu scrim stânga",
      title: "Un titlu lung care se rupe pe patru rânduri și rămâne lizibil pe degrade, cu ăâîșț.",
      scrim: "left",
    },
  },
  {
    id: "image-full-contain-doar-legenda",
    type: "image-full",
    data: {
      image: { ...example.image, width: 1920, height: 1080 },
      caption: "Exemplu: doar legenda, fără titlu, imaginea întreagă.",
      scrim: "bottom",
      fit: "contain",
    },
  },
  {
    id: "image-full-fara-scrim",
    type: "image-full",
    data: {
      image: {
        src:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#0d1713"/><circle cx="1400" cy="300" r="180" fill="#2a4a3d"/><rect x="900" y="120" width="800" height="120" rx="30" fill="#16251f"/></svg>`,
          ),
        alt: "Exemplu: imagine întunecată și calmă",
        width: 1920,
        height: 1080,
      },
      kicker: "Exemplu fără scrim",
      title: "Fără scrim, pe o imagine calmă.",
      scrim: "none",
    },
  },
];
