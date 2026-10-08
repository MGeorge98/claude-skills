import type { CSSProperties, ReactNode } from "react";
import "./dealt-cards.css";

/**
 * dealt-cards: a short list dealt onto a table, one card at a time. A pinned stage holds the heading and the
 * pile; the engine's built-in `deal` handler drops card i in its window [i x .33, i x .33 + .3] from
 * (22vw, 60vh, 18deg) with an ease-out-back landing on its resting tilt, nudges the cards below down 18px and
 * scales them .97, and darkens the shadow with the landed count. The heading and an outlined slot are the
 * first frame (p = 0), so the stage is never empty.
 */
export type DealtCard = {
  /** small mono line above the title */
  kicker: string;
  /** the card's statement; *stars* paint words with the accent */
  title: string;
  /** 1 to 3 short lines under the title */
  lines: string[];
  /** resting tilt in deg; default [-4, 3, -1.5][i] */
  r?: number;
};

export type DealtCardsHeading = {
  kicker?: string;
  /** the section title; *stars* paint words with the accent gradient */
  title: string;
};

export type DealtCardsProps = {
  cards: DealtCard[];
  heading: DealtCardsHeading;
  /** aria-label of the section */
  label: string;
  /** scene length in vh below 820px (today 253) */
  len?: number;
  /** scene length in vh from 820px (today 276) */
  lenDesktop?: number;
  /** smoothing time constant in ms for this scene (engine default 80) */
  tau?: number;
  id?: string;
};

const TILT = [-4, 3, -1.5];
const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

/** *word* -> accent span */
function rich(s: string, cls: string): ReactNode {
  return s.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} className={cls}>
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}

export default function DealtCards({ cards, heading, label, len = 253, lenDesktop = 276, tau, id }: DealtCardsProps) {
  return (
    <section
      id={id}
      className="ls-scene dealt-cards"
      data-scene
      data-tau={tau}
      aria-label={label}
      style={{ "--len": `${len}vh`, "--len-d": `${lenDesktop}vh` } as CSSProperties}
    >
      <div className="ls-stage dealt-cards-stage">
        <div className="dealt-cards-head">
          {heading.kicker && <p className="dealt-cards-kicker">{heading.kicker}</p>}
          <h2 className="dealt-cards-h">{rich(heading.title, "dealt-cards-acc")}</h2>
        </div>
        <div className="dealt-cards-table">
          <span className="dealt-cards-sh" data-deal-sh aria-hidden="true" />
          <span className="dealt-cards-slot" aria-hidden="true" />
          <ol className="dealt-cards-stack">
            {cards.map((c, i) => {
              const r = c.r ?? TILT[i] ?? 0;
              return (
                <li key={i} className="dealt-cards-card" data-deal={i} data-r={r} style={{ "--r": `${r}deg` } as CSSProperties}>
                  <span className="dealt-cards-c dealt-cards-tl" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <div className="dealt-cards-face">
                    <p className="dealt-cards-ck">{c.kicker}</p>
                    <h3 className="dealt-cards-t">{rich(c.title, "dealt-cards-hl")}</h3>
                    {c.lines.map((l, k) => (
                      <p key={k} className="dealt-cards-d">
                        {l}
                      </p>
                    ))}
                  </div>
                  <span className="dealt-cards-c dealt-cards-br" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
