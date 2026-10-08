/** Preview of set-collage with its Exemplu data; sync-kit mounts it at /preview/set-collage. */
import SetCollage from "./SetCollage";
import { collageExample } from "./data.example";

export default function Preview() {
  return <SetCollage {...collageExample} />;
}
