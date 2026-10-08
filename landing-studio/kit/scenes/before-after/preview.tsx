/** Preview of before-after with its Exemplu data; sync-kit mounts it at /preview/before-after. */
import BeforeAfter from "./BeforeAfter";
import { beforeAfterExample } from "./data.example";

export default function Preview() {
  return <BeforeAfter {...beforeAfterExample} />;
}
