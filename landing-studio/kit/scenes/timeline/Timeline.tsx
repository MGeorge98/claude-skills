import type { CSSProperties } from "react";
import SplitWords from "@/kit/react/SplitWords";
import "./timeline.css";

/**
 * timeline: a vertical spine with 4 to 10 entries. Each entry carries its own data-rv, so a long list reveals as the
 * user scrolls. The spine is drawn in segments: the segment between entry i and i+1 grows (scaleY from the top) when
 * entry i+1 gets .in. Inside an entry a ladder of four: dot (spring, fills with the accent), date, title, text.
 * Mobile: spine on the left. From 761px with side="alternate": spine in the centre, entries alternate left and right.
 * Not pinned. Without JS, under html.rm or html.ls-static the whole timeline is final.
 */
export type TimelineImage = {
  src: string;
  alt: string;
  /** explicit size, keeps the layout still while the file loads */
  width: number;
  height: number;
};

export type TimelineEntry = {
  /** mono label above the title, e.g. "Pasul 1" or "Luna 1" */
  date: string;
  title: string;
  /** one to three short lines */
  lines: string[];
  image?: TimelineImage;
};

export type TimelineProps = {
  entries: TimelineEntry[];
  heading?: string;
  /** mono line above the heading */
  kicker?: string;
  /** accessible name of the list */
  label: string;
  id?: string;
  /** "alternate" (default): centre spine from 761px; "right": spine on the left at every width */
  side?: "alternate" | "right";
};

export default function Timeline({ entries, heading, kicker, label, id, side = "alternate" }: TimelineProps) {
  const list = entries.slice(0, 10);
  const lad = (i: number) => ({ "--i": i }) as CSSProperties;
  return (
    <section className="timeline" id={id} data-side={side} aria-label={heading ? undefined : label}>
      {kicker && (
        <p className="timeline-kicker" data-rv>
          {kicker}
        </p>
      )}
      {heading && (
        <h2 className="timeline-heading" data-rv="mask">
          <SplitWords text={heading} step={60} />
        </h2>
      )}
      <ol className="timeline-list" aria-label={label}>
        {list.map((e, k) => (
          <li key={k} className={`timeline-entry ${k % 2 === 0 ? "timeline-l" : "timeline-r"}`} data-rv>
            {k < list.length - 1 && <span className="timeline-seg" aria-hidden="true" />}
            <span className="timeline-dot" style={lad(0)} aria-hidden="true" />
            <div className="timeline-body">
              <span className="timeline-date" style={lad(1)}>
                {e.date}
              </span>
              <b className="timeline-title" style={lad(2)}>
                {e.title}
              </b>
              <div className="timeline-text" style={lad(3)}>
                {e.lines.slice(0, 3).map((l, j) => (
                  <p className="timeline-line" key={j}>
                    {l}
                  </p>
                ))}
                {e.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="timeline-img"
                    src={e.image.src}
                    alt={e.image.alt}
                    width={e.image.width}
                    height={e.image.height}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
