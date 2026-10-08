/** Preview of horizontal-pinned with its Exemplu data; sync-kit mounts it at /preview/horizontal-pinned. */
import HorizontalPinned from "./HorizontalPinned";
import { horizontalExample } from "./data.example";

export default function Preview() {
  return <HorizontalPinned {...horizontalExample} />;
}
