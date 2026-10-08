/** Preview of number-wall with its Exemplu data; sync-kit mounts it at /preview/number-wall. */
import NumberWall from "./NumberWall";
import { numberWallExample } from "./data.example";

export default function Preview() {
  return <NumberWall {...numberWallExample} />;
}
