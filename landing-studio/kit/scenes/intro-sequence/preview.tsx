/** Preview of intro-sequence with its Exemplu data; sync-kit mounts it at /preview/intro-sequence.
 *  The curtain lifts over a simple placeholder first scene (word-mask heading and a paragraph on [data-rv]). */
import SplitWords from "@/kit/react/SplitWords";
import IntroSequence from "./IntroSequence";
import { heroPlaceholderExample as h, introExample } from "./data.example";

export default function Preview() {
  return (
    <>
      <IntroSequence {...introExample} />
      <section
        style={{
          minHeight: "100svh",
          boxSizing: "border-box",
          display: "grid",
          alignContent: "center",
          gap: 16,
          padding: "48px var(--gut)",
          color: "var(--ink)",
        }}
      >
        <p data-rv="" style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>
          {h.kicker}
        </p>
        <h1 data-rv="mask" style={{ margin: 0, fontSize: "clamp(40px, 8vw, 104px)", lineHeight: 1, letterSpacing: "-0.04em", fontWeight: 800, maxWidth: "14ch" }}>
          <SplitWords text={h.title} />
        </h1>
        <p data-rv="" style={{ ["--d" as string]: "240ms", margin: 0, maxWidth: "44ch", fontSize: "1.125rem", lineHeight: 1.55, color: "var(--ink-2)" }}>
          {h.lead}
        </p>
      </section>
    </>
  );
}
