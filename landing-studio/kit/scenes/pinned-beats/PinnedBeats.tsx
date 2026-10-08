import type { CSSProperties, ReactNode } from "react";
import "./pinned-beats.css";

/**
 * pinned-beats: a story told on one pinned screen. Each beat owns a window [a, b] of the scene progress;
 * the engine fades it in over .07 and out over .06 (the last beat holds), staggers [data-sub] rows inside it,
 * and the bar is a pure function of --p.
 */
export type Beat = {
  kind: "big-number" | "lines" | "quote";
  /** big-number: lines[0] is the number (decorative), the rest is the statement. lines: the statement rows.
   *  quote: the quotation. Wrap words in *stars* to paint them with the accent gradient. */
  lines: string[];
  /** dimmed rows under the statement */
  sub?: string[];
  /** quote only: the caption under the quotation */
  attribution?: string;
  /** reveal `lines` one row at a time ([data-sub]); default true when a "lines" beat has 3+ rows */
  stagger?: boolean;
  /** relative length of this beat's window; default by kind (see beatWindows) */
  weight?: number;
};

export type PinnedBeatsProps = {
  beats: Beat[];
  label: string;
  /** scene length in vh below 820px (today 320) */
  len?: number;
  /** scene length in vh from 820px (today 380) */
  lenDesktop?: number;
  /** explicit windows, overrides the automatic ones */
  windows?: [number, number][];
  /** overlap between consecutive windows (today .02) */
  overlap?: number;
  /** smoothing time constant in ms for this scene (engine default 80) */
  tau?: number;
  id?: string;
};

const staggered = (b: Beat) => b.stagger ?? (b.kind === "lines" && b.lines.length >= 3);

/** default weights reproduce today's 5-beat pattern: [0,.2] [.18,.44] [.42,.6] [.58,.76] [.74,1] */
export function beatWeight(b: Beat) {
  if (b.weight) return b.weight;
  if (b.kind === "big-number") return 1.1;
  if (b.kind === "quote") return 1.45;
  return staggered(b) ? 1 + 0.11 * b.lines.length : 1;
}

export function beatWindows(beats: Beat[], overlap = 0.02): [number, number][] {
  const w = beats.map(beatWeight);
  const total = w.reduce((s, x) => s + x, 0);
  const unit = (1 + overlap * (beats.length - 1)) / total;
  const r = (x: number) => Math.round(x * 100) / 100;
  let a = 0;
  return w.map((x, i) => {
    const b = i === beats.length - 1 ? 1 : a + x * unit;
    const out: [number, number] = [r(a), r(b)];
    a = b - overlap;
    return out;
  });
}

/** *word* -> accent span */
function rich(s: string): ReactNode {
  return s.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} className="pinned-beats-acc">
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}

function Rows({ rows, dim }: { rows?: string[]; dim?: boolean }) {
  if (!rows?.length) return null;
  return (
    <>
      {rows.map((r, i) => (
        <span key={i} className={dim ? "pinned-beats-dim" : undefined}>
          {(i > 0 || dim) && <br />}
          {rich(r)}
        </span>
      ))}
    </>
  );
}

function BeatBody({ b }: { b: Beat }) {
  if (b.kind === "big-number") {
    const [num, ...rest] = b.lines;
    return (
      <>
        <span className="pinned-beats-num" aria-hidden="true">
          {num}
        </span>
        {(rest.length > 0 || b.sub?.length) && (
          <p className="pinned-beats-t">
            <Rows rows={rest} />
            <Rows rows={b.sub} dim />
          </p>
        )}
      </>
    );
  }
  if (b.kind === "quote") {
    return (
      <figure className="pinned-beats-quote">
        <blockquote>{b.lines.map((l, i) => <span key={i}>{i > 0 && " "}{rich(l)}</span>)}</blockquote>
        {b.attribution && <figcaption>{b.attribution}</figcaption>}
      </figure>
    );
  }
  if (staggered(b)) {
    return (
      <>
        <ul className="pinned-beats-list">
          {b.lines.map((l, i) => (
            <li key={i} data-sub>
              {rich(l)}
            </li>
          ))}
        </ul>
        {b.sub?.length ? (
          <p className="pinned-beats-subt">
            {b.sub.map((s, i) => (
              <span key={i}>{i > 0 && <br />}{rich(s)}</span>
            ))}
          </p>
        ) : null}
      </>
    );
  }
  return (
    <p className="pinned-beats-t">
      <Rows rows={b.lines} />
      <Rows rows={b.sub} dim />
    </p>
  );
}

export default function PinnedBeats({ beats, label, len = 320, lenDesktop = 380, windows, overlap = 0.02, tau, id }: PinnedBeatsProps) {
  const win = windows ?? beatWindows(beats, overlap);
  return (
    <section
      id={id}
      className="ls-scene pinned-beats"
      data-scene
      data-tau={tau}
      aria-label={label}
      style={{ "--len": `${len}vh`, "--len-d": `${lenDesktop}vh` } as CSSProperties}
    >
      <div className="ls-stage pinned-beats-stage">
        <div className="pinned-beats-bar" aria-hidden="true">
          <i data-bar />
        </div>
        {beats.map((b, k) => (
          <div
            key={k}
            className={`pinned-beats-beat pinned-beats-${b.kind}${k === 0 ? " pinned-beats-first" : ""}`}
            data-beat
            data-a={win[k][0]}
            data-b={win[k][1]}
            data-last={k === beats.length - 1 ? "" : undefined}
          >
            <BeatBody b={b} />
          </div>
        ))}
      </div>
    </section>
  );
}
