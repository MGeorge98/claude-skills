/** Preview of pinned-beats with its Exemplu data; sync-kit mounts it at /preview/pinned-beats. */
import PinnedBeats from "./PinnedBeats";
import { beatsExample } from "./data.example";

export default function Preview() {
  return <PinnedBeats {...beatsExample} />;
}
