/** Preview of portrait-hero with its Exemplu data; sync-kit mounts it at /preview/portrait-hero. */
import PortraitHero from "./PortraitHero";
import { portraitExample } from "./data.example";

export default function Preview() {
  return <PortraitHero {...portraitExample} />;
}
