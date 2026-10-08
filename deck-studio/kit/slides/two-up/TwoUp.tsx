import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./two-up.css";

export type TwoUpImage = {
  /** a data URI or a file in public/ */
  src: string;
  alt: string;
  /** intrinsic size; the slide shows it in a fixed 760 x 230 frame */
  width: number;
  height: number;
};

export type TwoUpColumn = {
  /** mono, uppercase, short: "Înainte", "Acum" */
  label: string;
  /** optional 44px heading under the label */
  title?: string;
  /** 2 to 4 short lines at body size */
  lines: string[];
  image?: TwoUpImage;
};

export type TwoUpData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point, visible from step 0 */
  point: string;
  left: TwoUpColumn;
  right: TwoUpColumn;
  /** one accent line under the columns, the last step (side mode only counts it as an extra step) */
  verdict?: string;
  /** "side" (default): two columns. "swap": the right column replaces the left in place */
  mode?: "side" | "swap";
};

export const steps = (d: TwoUpData) => (d.mode === "swap" ? 1 : 1 + (d.verdict ? 1 : 0));

function Column({ c, side }: { c: TwoUpColumn; side: "left" | "right" }) {
  return (
    <>
      <p className="two-up-label" data-side={side}>{c.label}</p>
      {c.title ? <h3 className="two-up-title">{c.title}</h3> : null}
      {c.image ? (
        <img className="two-up-img" src={c.image.src} width={c.image.width} height={c.image.height} alt={c.image.alt} />
      ) : null}
      <ul className="two-up-lines">
        {c.lines.map((t, n) => (
          <li key={n}>{t}</li>
        ))}
      </ul>
    </>
  );
}

export default function TwoUp({ data }: SlideProps<TwoUpData>) {
  const swap = data.mode === "swap";
  const verdictAt = swap ? 1 : 2;
  return (
    <div className="two-up-root">
      {data.kicker ? (
        <Step at={0} as="p" className="two-up-kicker">
          {data.kicker}
        </Step>
      ) : null}
      <Step at={0} i={data.kicker ? 1 : 0} as="h2" className="two-up-point">
        {data.point}
      </Step>
      {swap ? (
        <div className="two-up-cols two-up-swapcols deck-swap">
          <Step at={0} i={2} swap="g" className="two-up-col" data-side="left">
            <Column c={data.left} side="left" />
          </Step>
          <Step at={1} swap="g" className="two-up-col" data-side="right">
            <Column c={data.right} side="right" />
          </Step>
        </div>
      ) : (
        <div className="two-up-cols">
          <Step at={0} i={2} className="two-up-col" data-side="left">
            <Column c={data.left} side="left" />
          </Step>
          <Step at={1} className="two-up-col" data-side="right">
            <Column c={data.right} side="right" />
          </Step>
        </div>
      )}
      {data.verdict ? (
        <Step at={verdictAt} i={swap ? 1 : 0} as="p" className="two-up-verdict">
          {data.verdict}
        </Step>
      ) : null}
    </div>
  );
}
