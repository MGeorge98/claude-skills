import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./cascade-list.css";

export type CascadeRow = {
  /** the row itself, one short sentence */
  text: string;
  /** an optional second line, smaller, enters just after the row in the same step */
  sub?: string;
};

export type CascadeListData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point, visible from step 0 */
  point: string;
  /** 3 to 6 rows, one per step; over 4 rows they flow in two columns */
  rows: CascadeRow[];
  /** numbers 01, 02 ... in front of the rows (default true) */
  numbered?: boolean;
  /** the line that lands the point, revealed as the last step */
  closing?: string;
};

export const steps = (d: CascadeListData) => d.rows.length + (d.closing ? 1 : 0);

export default function CascadeList({ data }: SlideProps<CascadeListData>) {
  const two = data.rows.length > 4;
  const numbered = data.numbered !== false;
  return (
    <div className="cascade-list-root">
      {data.kicker ? (
        <Step at={0} as="p" className="cascade-list-kicker">
          {data.kicker}
        </Step>
      ) : null}
      <Step at={0} i={data.kicker ? 1 : 0} as="h2" className="cascade-list-point">
        {data.point}
      </Step>
      <ol className={two ? "cascade-list-rows cascade-list-two" : "cascade-list-rows"} data-numbered={numbered ? "" : undefined}>
        {data.rows.map((r, n) => (
          <li key={n} className="cascade-list-row">
            <Step at={n + 1} className="cascade-list-head">
              {numbered ? <span className="cascade-list-n">{String(n + 1).padStart(2, "0")}</span> : null}
              <span className="cascade-list-text">{r.text}</span>
            </Step>
            {r.sub ? (
              <Step at={n + 1} i={1} as="p" className="cascade-list-sub">
                {r.sub}
              </Step>
            ) : null}
          </li>
        ))}
      </ol>
      {data.closing ? (
        <Step at={data.rows.length + 1} as="p" className="cascade-list-closing">
          {data.closing}
        </Step>
      ) : null}
    </div>
  );
}
