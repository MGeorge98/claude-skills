/** Preview of form-popup with its Exemplu data; sync-kit mounts it at /preview/form-popup. */
import FormPopup from "./FormPopup";
import { formCopyExample, formEndpointExample, formKeysExample } from "./data.example";

export default function Preview() {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <FormPopup endpoint={formEndpointExample} copy={formCopyExample} keys={formKeysExample} />
    </div>
  );
}
