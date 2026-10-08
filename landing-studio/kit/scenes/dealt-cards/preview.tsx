/** Preview of dealt-cards with its Exemplu data; sync-kit mounts it at /preview/dealt-cards. */
import DealtCards from "./DealtCards";
import { dealtCardsExample } from "./data.example";

export default function Preview() {
  return <DealtCards {...dealtCardsExample} />;
}
