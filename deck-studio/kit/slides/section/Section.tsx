import Step from "@/kit/react/Step";
import SplitWords, { wordCount } from "@/kit/react/SplitWords";
import type { SlideProps } from "@/kit/react/Slide";
import "./section.css";

export type SectionData = {
  /** chapter number as written, "01" */
  number?: string;
  /** chapter name, display size, in word masks */
  name: string;
  /** one line under the name, --ink-2 */
  line?: string;
  /** a soft accent glow behind the chapter */
  glow?: "center" | "left" | false;
  /** the number drawn as an outline instead of solid */
  outline?: boolean;
  /** default "left" */
  align?: "center" | "left";
};

/** A divider: everything enters with the slide. Recommended slide transition: "wipe". */
export const steps = (_: SectionData) => 0;

export default function Section({ data }: SlideProps<SectionData>) {
  const align = data.align === "center" ? "center" : "left";
  const tail = Math.min(5, Math.ceil((wordCount(data.name) * 45) / 70) + 1);
  return (
    <div className={`section-root section-${align}`}>
      {data.glow ? <div className={`section-glow section-glow-${data.glow}`} aria-hidden="true" /> : null}
      <div className="section-main">
        {data.number ? (
          <Step at={0} as="p" className={data.outline ? "section-num section-outline" : "section-num"}>
            {data.number}
          </Step>
        ) : null}
        <Step at={0} rv="mask" as="h1" className="section-name">
          <SplitWords text={data.name} />
        </Step>
        {data.line ? (
          <Step at={0} i={tail} as="p" className="section-line">
            {data.line}
          </Step>
        ) : null}
      </div>
    </div>
  );
}
