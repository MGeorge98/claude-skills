import type { CSSProperties, ReactNode } from "react";
import "./sticky-split.css";

/**
 * sticky-split: a pinned chapter with a sticky media panel and text beats beside it (below it on phones).
 * Text beats are driven by the engine's [data-beat][data-a][data-b] handler. Panels and progress dots are
 * pure functions of --p in CSS: panel i cross-fades in and out over .05 around the handovers between
 * beat windows (smootherstep) and scales from .96 to 1 across its own window, never above 1.
 * Without the engine (no JS, html.rm, before mount) every beat sits under its panel in a readable column.
 */
export type SplitBeat = { kicker?: string; title: string; lines: string[] };
export type SplitImage = { src: string; alt: string; width: number; height: number };

export type StickySplitProps = {
  beats: SplitBeat[];
  /** one per beat: an image with explicit size, or any ReactNode (it fills the panel) */
  panels: (SplitImage | ReactNode)[];
  label: string;
  /** scene length in vh below 820px (default 300) */
  len?: number;
  /** scene length in vh from 820px (default 360) */
  lenDesktop?: number;
  /** explicit [a, b] windows per beat; default equal slices overlapping .02 */
  windows?: [number, number][];
  /** panel on the right, text on the left (desktop) */
  flip?: boolean;
  /** smoothing time constant in ms for this scene (engine default 80) */
  tau?: number;
  id?: string;
};

/** equal slices that overlap by `overlap`, first starts at 0, last ends at 1 */
export function splitWindows(n: number, overlap = 0.02): [number, number][] {
  const unit = (1 + overlap * (n - 1)) / n;
  const r = (x: number) => Math.round(x * 1000) / 1000;
  return Array.from({ length: n }, (_, i) => {
    const a = i * (unit - overlap);
    return [r(a), i === n - 1 ? 1 : r(a + unit)];
  });
}

const isImage = (x: unknown): x is SplitImage =>
  typeof x === "object" && x !== null && "src" in x && "width" in x && "height" in x;

export default function StickySplit({ beats, panels, label, len = 300, lenDesktop = 360, windows, flip, tau, id }: StickySplitProps) {
  const n = beats.length;
  const win = windows ?? splitWindows(n);
  /* handover centre between beat i and i+1: the panels cross-fade over .05 around it */
  const hand = win.slice(0, -1).map(([, b], i) => Math.round(((b + win[i + 1][0]) / 2) * 1000) / 1000);
  const vars = (i: number) =>
    ({
      "--pi": i === 0 ? -1 : hand[i - 1],
      "--po": i === n - 1 ? 9 : hand[i],
      "--sa": win[i][0],
      "--sb": win[i][1],
    }) as CSSProperties;

  return (
    <section
      id={id}
      className={`ls-scene sticky-split${flip ? " sticky-split-flip" : ""}`}
      data-scene
      data-tau={tau}
      aria-label={label}
      style={{ "--len": `${len}vh`, "--len-d": `${lenDesktop}vh` } as CSSProperties}
    >
      <div className="ls-stage sticky-split-stage">
        <div className="sticky-split-frame" aria-hidden="true" />
        {beats.map((b, i) => {
          const panel = panels[i];
          return (
            <article key={i} className={`sticky-split-step${i === 0 ? " sticky-split-first" : ""}`}>
              <figure className="sticky-split-panel" style={vars(i)}>
                {isImage(panel) ? (
                  <img
                    src={panel.src}
                    alt={panel.alt}
                    width={panel.width}
                    height={panel.height}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <div className="sticky-split-node">{panel as ReactNode}</div>
                )}
              </figure>
              <div
                className="sticky-split-beat"
                data-beat
                data-a={win[i][0]}
                data-b={win[i][1]}
                data-last={i === n - 1 ? "" : undefined}
              >
                {b.kicker && <p className="sticky-split-k">{b.kicker}</p>}
                <h3 className="sticky-split-t">{b.title}</h3>
                {b.lines.map((l, k) => (
                  <p key={k} className="sticky-split-l">
                    {l}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
        <ol className="sticky-split-dots" aria-hidden="true">
          {beats.map((_, i) => (
            <li key={i} style={vars(i)}>
              <i />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
