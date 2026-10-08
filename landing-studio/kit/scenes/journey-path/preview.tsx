/** Preview of journey-path with its Exemplu data; sync-kit mounts it at /preview/journey-path. */
import JourneyPath from "./JourneyPath";
import { journeyExample } from "./data.example";

export default function Preview() {
  return <JourneyPath {...journeyExample} />;
}
