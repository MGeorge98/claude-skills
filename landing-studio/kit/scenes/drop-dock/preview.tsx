/** Preview of drop-dock with its Exemplu data; sync-kit mounts it at /preview/drop-dock. */
import DropDock from "./DropDock";
import { dropDockExample } from "./data.example";

export default function Preview() {
  return <DropDock {...dropDockExample} />;
}
