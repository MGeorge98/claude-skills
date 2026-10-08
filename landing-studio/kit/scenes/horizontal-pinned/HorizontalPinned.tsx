import type { CSSProperties } from "react";
import "./horizontal-pinned.css";

/**
 * horizontal-pinned: a pinned chapter whose cards glide sideways. The track translates in X as a pure
 * function of --p (no JS measurement): translateX((rail width - track width) x p), where the rail is a
 * size container (100cqw) and the track's own width is 100% in translate. At p=0 card 1 sits at the left
 * gutter, at p=1 the last card sits at the right gutter. The bar uses the engine's [data-bar] handler.
 */
export type HorizontalCard = {
  kicker?: string;
  title: string;
  /** 1 to 3 short lines */
  lines: string[];
  /** optional image, always with explicit intrinsic size */
  img?: { src: string; alt: string; width: number; height: number };
};

export type HorizontalPinnedProps = {
  cards: HorizontalCard[];
  kicker?: string;
  heading: string;
  /** aria-label of the section */
  label: string;
  /** scene length in vh below 820px; default 100 + 90 x (N - 1) */
  len?: number;
  /** scene length in vh from 820px; default 100 + 75 x (N - 1) */
  lenDesktop?: number;
  /** smoothing time constant in ms (default 140; a fast flick must still show every card) */
  tau?: number;
  id?: string;
};

export default function HorizontalPinned({ cards, kicker, heading, label, len, lenDesktop, tau = 140, id }: HorizontalPinnedProps) {
  const n = cards.length;
  const lenM = len ?? 100 + 90 * Math.max(0, n - 1);
  const lenD = lenDesktop ?? 100 + 75 * Math.max(0, n - 1);
  return (
    <section
      id={id}
      className="ls-scene horizontal-pinned"
      data-scene
      data-tau={tau}
      aria-label={label}
      style={{ "--len": `${lenM}vh`, "--len-d": `${lenD}vh`, "--n": n } as CSSProperties}
    >
      <div className="ls-stage horizontal-pinned-stage">
        <header className="horizontal-pinned-head">
          <div className="horizontal-pinned-headrow">
            <div>
              {kicker && <p className="horizontal-pinned-kicker">{kicker}</p>}
              <h2 className="horizontal-pinned-title">{heading}</h2>
            </div>
            {n > 1 && (
              <p className="horizontal-pinned-count" aria-hidden="true">
                <span className="horizontal-pinned-roll">
                  <span className="horizontal-pinned-digits">
                    {cards.map((_, k) => (
                      <span key={k}>{k + 1}</span>
                    ))}
                  </span>
                </span>
                <span>/</span>
                <span>{n}</span>
              </p>
            )}
          </div>
          <div className="horizontal-pinned-bar" aria-hidden="true">
            <i data-bar />
          </div>
        </header>
        <div className="horizontal-pinned-rail">
          <ol className="horizontal-pinned-track">
            {cards.map((c, k) => (
              <li key={k} className="horizontal-pinned-card" style={{ "--i": k } as CSSProperties}>
                {c.img && (
                  <img
                    className="horizontal-pinned-img"
                    src={c.img.src}
                    alt={c.img.alt}
                    width={c.img.width}
                    height={c.img.height}
                    loading="eager"
                    decoding="async"
                  />
                )}
                {c.kicker && <p className="horizontal-pinned-ck">{c.kicker}</p>}
                <h3 className="horizontal-pinned-ct">{c.title}</h3>
                {c.lines.slice(0, 3).map((l, j) => (
                  <p key={j} className="horizontal-pinned-cl">
                    {l}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
