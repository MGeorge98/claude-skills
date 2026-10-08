import type { ReactNode } from "react";

/**
 * Word masks rendered on the server: `<span class="w"><i style="--d;--i">word</i></span>`.
 * The words are in the HTML (crawlers, no layout thrash); the release is the `.in` class on a
 * `[data-rv="mask"]` ancestor. Spaces stay real text nodes, so copy and line breaking are normal.
 *
 *   <h1 data-rv="mask"><SplitWords text="Exemplu de titlu pe două rânduri" /></h1>
 *   <h2 data-rv="mask"><SplitWords text="Prima parte, " /><em><SplitWords text="a doua" start={2} /></em></h2>
 */
export const WORD_STEP = 45; // ms, mirrors --ls-stagger-word

export default function SplitWords({
  text,
  start = 0,
  step = WORD_STEP,
  base = 0,
}: {
  text: string;
  /** word index this run starts at, so delays stay monotonic across runs */
  start?: number;
  /** ms between words */
  step?: number;
  /** ms added before the first word */
  base?: number;
}): ReactNode {
  const parts = text.split(/(\s+)/).filter(Boolean);
  let i = start;
  return (
    <>
      {parts.map((t, n) => {
        if (/^\s+$/.test(t)) return " ";
        const idx = i++;
        return (
          <span className="w" key={n}>
            <i style={{ ["--d" as string]: base + idx * step + "ms", ["--i" as string]: idx }}>{t}</i>
          </span>
        );
      })}
    </>
  );
}

/** Words in a run, so the next run can continue the ladder: start={wordCount(first)}. */
export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
