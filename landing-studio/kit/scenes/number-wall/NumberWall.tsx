import type { CSSProperties } from "react";
import Count from "@/kit/react/Count";
import "./number-wall.css";

/**
 * number-wall: 3 to 6 big count-up numbers with a caption and an optional mono source note.
 * Every `value` must come from facts.md (verified). Never count up a number that is not in the ledger.
 */
export type WallItem = {
  /** the target; decimals follow `decimals` (or the digits of the value) */
  value: number;
  pre?: string;
  suf?: string;
  caption: string;
  /** mono source line, e.g. "sursa: raport intern" */
  note?: string;
  /** fixed decimals, e.g. 1 for 4.0; default: as written in `value` */
  decimals?: number;
  /** count-up duration in ms, default 1500 */
  ms?: number;
};

export type NumberWallProps = {
  items: WallItem[];
  /** accessible name of the section */
  label: string;
  heading?: string;
  kicker?: string;
  id?: string;
};

export default function NumberWall({ items, label, heading, kicker, id }: NumberWallProps) {
  const list = items.slice(0, 6);
  const n = list.length;
  return (
    <section className="number-wall" id={id} aria-label={label} data-n={n}>
      {(kicker || heading) && (
        <header className="number-wall-head" data-rv>
          {kicker && <p className="number-wall-kicker">{kicker}</p>}
          {heading && <h2 className="number-wall-h">{heading}</h2>}
        </header>
      )}
      <ul className="number-wall-grid">
        {list.map((it, i) => {
          const to = it.decimals != null ? it.value.toFixed(it.decimals) : it.value;
          return (
            <li key={i} className="number-wall-tile" data-rv style={{ "--i": i } as CSSProperties}>
              <Count className="number-wall-num" to={to} pre={it.pre} suf={it.suf} ms={it.ms} />
              <p className="number-wall-cap">{it.caption}</p>
              {it.note && <p className="number-wall-note">{it.note}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
