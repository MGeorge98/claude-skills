/** Preview of timeline with its Exemplu data; sync-kit mounts it at /preview/timeline. */
import Timeline from "./Timeline";
import { timelineExample } from "./data.example";

export default function Preview() {
  return <Timeline {...timelineExample} />;
}
