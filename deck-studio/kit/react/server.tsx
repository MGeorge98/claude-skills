import { renderToString } from "react-dom/server";
import Deck from "./Deck";
import { DECK, DECK_ID, DECK_TRANSITION } from "@/deck";

/** Prerender entry (src/kit/runtime/prerender.mjs): THE ORDER as static HTML, for the no-JS document
 *  and the failsafe. The client replaces it with createRoot on mount. */
export function render(): string {
  return renderToString(<Deck id={DECK_ID} slides={DECK} transition={DECK_TRANSITION} mode="static" />);
}
