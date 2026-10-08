/** Preview of hero-words with its Exemplu data; sync-kit mounts it at /preview/hero-words. */
import HeroWords from "./HeroWords";
import NetworkBackdrop from "./NetworkBackdrop";
import { heroExample, networkExample } from "./data.example";

export default function Preview() {
  return (
    <HeroWords {...heroExample}>
      <NetworkBackdrop {...networkExample} />
    </HeroWords>
  );
}
