import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/latin-ext-400.css";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-ext-500.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";
import "@fontsource/plus-jakarta-sans/latin-ext-700.css";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import "@fontsource/plus-jakarta-sans/latin-ext-800.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-ext-500.css";
import "@fontsource/jetbrains-mono/latin-600.css";
import "@fontsource/jetbrains-mono/latin-ext-600.css";
import "./styles/app.css";
import "./styles/tokens.css";
import "./styles/deck.css";
import Deck from "@/kit/react/Deck";
import { DECK, DECK_ID, DECK_TRANSITION } from "./deck";
import { previewDeck } from "./preview-deck";

// ?preview shows one slide per synced type (data.example.ts); ?preview=<type> shows that type's variants.
const q = new URLSearchParams(window.location.search);
const preview = q.has("preview");

// The built index.html holds the prerendered slides (the no-JS document); createRoot replaces them.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Deck
      id={preview ? `${DECK_ID}-preview` : DECK_ID}
      slides={preview ? previewDeck(q.get("preview")) : DECK}
      transition={DECK_TRANSITION}
    />
  </StrictMode>,
);
