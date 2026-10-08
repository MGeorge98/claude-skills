import type { CSSProperties } from "react";
import SplitWords from "@/kit/react/SplitWords";
import "./journey-path.css";

/**
 * journey-path: an ordered list of 3 to 5 steps on a line that draws itself segment by segment. Dots pop with a
 * spring, cards rise, the last step is the hero card (bigger, optional guest colour) and lands with a spring.
 * One-shot reveal through the kit: the <ol> carries data-rv="path", the observer adds .in, everything else is
 * CSS keyed on .in with --i ladders. Not pinned. Without JS or under html.rm the list is already final.
 */
export type JourneyStep = {
  /** mono label above the title, e.g. "Pasul 1" */
  kicker: string;
  title: string;
  /** one or two short lines */
  lines: string[];
  /** marks the last step as the hero card */
  hero?: boolean;
};

export type JourneyPathProps = {
  steps: JourneyStep[];
  heading?: string;
  /** mono line above the heading */
  label?: string;
  id?: string;
  /** accent for the hero card and its dot, applied through the scene-local --journey-path-guest */
  guest?: { accent: string };
};

export default function JourneyPath({ steps, heading, label, id, guest }: JourneyPathProps) {
  const list = steps.slice(0, 5);
  const last = list.length - 1;
  const style = { "--n": list.length, ...(guest ? { "--journey-path-guest": guest.accent } : null) } as CSSProperties;
  return (
    <section className="journey-path" id={id} style={style}>
      {label && (
        <p className="journey-path-label" data-rv>
          {label}
        </p>
      )}
      {heading && (
        <h2 className="journey-path-heading" data-rv="mask">
          <SplitWords text={heading} step={60} />
        </h2>
      )}
      <ol className="journey-path-list" data-rv="path">
        {list.map((s, i) => {
          const hero = i === last && s.hero !== false;
          return (
            <li
              key={i}
              className={`journey-path-step${hero ? " journey-path-hero" : ""}`}
              style={{ "--i": i, "--k": i + 1 } as CSSProperties}
            >
              <span className="journey-path-dot" aria-hidden="true" />
              <div className="journey-path-card">
                <span className="journey-path-kicker">{s.kicker}</span>
                <b className="journey-path-title">{s.title}</b>
                {s.lines.slice(0, 2).map((l, j) => (
                  <span className="journey-path-line" key={j}>
                    {l}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
