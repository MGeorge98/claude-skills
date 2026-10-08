import type { SlideDef } from "@/kit/react/Slide";
import { example } from "./data.example";

/* ?preview=video : the edge cases of this type (sync-kit.sh wires them into src/preview-deck.tsx). */
export const variants: SlideDef[] = [
  { id: "video-cu-titlu", type: "video", data: example },
  {
    id: "video-cu-control",
    type: "video",
    data: {
      kicker: "Exemplu cu control",
      point: "Sunetul pornește doar din bara clipului.",
      src: "exemplu-video.mp4",
      poster: { src: "exemplu-poster.png", width: 1280, height: 720 },
      caption: "Exemplu: click pe bară nu schimbă slide-ul.",
      controls: true,
    },
  },
  {
    id: "video-singur-cover",
    type: "video",
    data: {
      src: "exemplu-video.mp4",
      poster: { src: "exemplu-poster.png", width: 1280, height: 720 },
      caption: "Exemplu fără titlu: cadrul ocupă scena, imaginea o umple.",
      fit: "cover",
      loop: true,
    },
  },
];
