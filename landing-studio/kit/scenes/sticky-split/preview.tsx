/** Preview of sticky-split with its Exemplu data; sync-kit mounts it at /preview/sticky-split. */
import StickySplit from "./StickySplit";
import { splitExample } from "./data.example";

export default function Preview() {
  return <StickySplit {...splitExample} />;
}
