import type { CSSProperties } from "react";
import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./code.css";

export type CodeRange = {
  /** first line of the range, as numbered on the slide (startLine based) */
  from: number;
  /** last line of the range, inclusive */
  to: number;
  /** one short line shown under the block while this range is lit */
  caption: string;
};

export type CodeData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point, one line */
  point: string;
  /** a label in mono at the top right (tsx, sql, bash ...) */
  lang?: string;
  /** the snippet; tabs become 2 spaces, long lines are clipped with a fade, never wrapped */
  code: string;
  /** one per step, in order */
  ranges: CodeRange[];
  /** number of the first line (default 1) */
  startLine?: number;
};

/** visible window at 1920: 18 rows of 39px; longer code moves the rows by transform */
const VIEW = 18;

export const steps = (d: CodeData) => d.ranges.length;

function lines(code: string): string[] {
  const out = code.replace(/\r\n?/g, "\n").replace(/\t/g, "  ").replace(/\n+$/, "").split("\n");
  return out.length ? out : [""];
}

/** first visible row for a range: none while the range sits in the first window, else centred on the range,
    clamped to the code, the range's top kept in view. Stateless, so going back reproduces each frame. */
function offsetFor(n: number, a: number, b: number): number {
  if (n <= VIEW || b < VIEW) return 0;
  const len = b - a + 1;
  const off = len >= VIEW ? a : Math.round((a + b + 1) / 2 - VIEW / 2);
  return Math.max(0, Math.min(n - VIEW, off));
}

export default function Code({ data, step }: SlideProps<CodeData>) {
  const rows = lines(data.code);
  const n = rows.length;
  const start = data.startLine ?? 1;
  const ranges = data.ranges;
  const k = Math.max(0, Math.min(ranges.length, step));
  const cur = k > 0 ? ranges[k - 1] : null;
  // indexes into rows (0 based), clamped so a stray range never escapes the block
  const idx = (line: number) => Math.max(0, Math.min(n - 1, line - start));
  const a = cur ? idx(cur.from) : -1;
  const b = cur ? idx(cur.to) : -1;
  const off = cur ? offsetFor(n, a, b) : 0;
  const view = Math.min(n, VIEW);
  const digits = String(start + n - 1).length;
  const style = {
    "--code-n": n,
    "--code-v": view,
    "--code-r": ranges.length,
    "--code-off": off,
    "--code-digits": digits,
  } as CSSProperties;
  const label = (r: CodeRange) => (r.from === r.to ? String(r.from) : `${r.from}-${r.to}`);

  return (
    <div className="code-root" style={style}>
      {data.kicker || data.lang ? (
        <div className="code-top">
          {data.kicker ? (
            <Step at={0} as="p" className="code-kicker">
              {data.kicker}
            </Step>
          ) : (
            <span />
          )}
          {data.lang ? (
            <Step at={0} as="p" className="code-lang">
              {data.lang}
            </Step>
          ) : null}
        </div>
      ) : null}
      <Step at={0} i={1} as="h2" className="code-point">
        {data.point}
      </Step>
      <Step at={0} i={2} className="code-block">
        <div className="code-lines">
          {ranges.map((r, j) => (
            <Step
              key={`b${j}`}
              at={j + 1}
              swap="band"
              className="code-band"
              aria-hidden="true"
              style={{ "--code-a": idx(r.from), "--code-len": Math.min(view, idx(r.to) - idx(r.from) + 1) } as CSSProperties}
            />
          ))}
          {rows.map((t, j) => (
            <div
              key={j}
              className="code-row"
              data-on={j >= a && j <= b ? "" : undefined}
              data-out={j < off || j >= off + view ? "" : undefined}
            >
              <span className="code-n">{start + j}</span>
              <span className="code-t">{t}</span>
            </div>
          ))}
        </div>
      </Step>
      <div className="code-caption deck-swap">
        {ranges.map((r, j) => (
          <Step key={j} at={j + 1} swap="caption" as="p" className="code-cap">
            <span className="code-cap-l">{label(r)}</span>
            {r.caption}
          </Step>
        ))}
      </div>
      {/* ?print and the stacked document: every range listed, the block undimmed */}
      <ol className="code-ranges">
        {ranges.map((r, j) => (
          <li key={j} className="code-ranges-item">
            <span className="code-cap-l">{label(r)}</span>
            {r.caption}
          </li>
        ))}
      </ol>
    </div>
  );
}
