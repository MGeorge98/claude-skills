import type { VideoData } from "./Video";

/* Exemplu: placeholder copy, no facts. The clip and the poster are neutral example media
   (public/exemplu-video.mp4, public/exemplu-poster.png); replace every field from facts.md. */
export const example: VideoData = {
  kicker: "Exemplu de video",
  point: "Clipul pornește singur, fără sunet.",
  src: "exemplu-video.mp4",
  poster: { src: "exemplu-poster.png", width: 1280, height: 720 },
  caption: "Exemplu de legendă, într-un singur rând.",
  loop: true,
};

export const notes = `Exemplu de notă: ce spui cât rulează clipul.
- clipul pornește la intrarea pe slide și se oprește la ieșire
- **un singur lucru** de urmărit în clip`;
