/** Preview of brand-pour with its Exemplu data; sync-kit mounts it at /preview/brand-pour.
 *  The example screenshot is public/firmio.png: put an image there or drop `shot`. */
import BrandPour from "./BrandPour";
import { pourExample } from "./data.example";

export default function Preview() {
  return <BrandPour {...pourExample} />;
}
