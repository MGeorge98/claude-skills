import type { CSSProperties } from "react";
import "./set-collage.css";

/**
 * set-collage: 3 to 7 project shots in a fixed collage grid that assembles on reveal.
 * The wrapper carries data-rv="mask" (a neutral variant: the wrapper itself stays visible, the engine adds .in);
 * the shots are the clipped elements, so the observed box is never clipped. Markup is the final state:
 * no JS, html.rm and html.ls-static show every shot whole.
 */
export type CollageShot = {
  src: string;
  alt: string;
  /** intrinsic pixel size, always set so the grid never shifts (CLS 0) */
  width: number;
  height: number;
  caption: string;
  href: string;
};

export type SetCollageProps = {
  id?: string;
  /** mono kicker above the heading */
  label?: string;
  heading?: string;
  /** 3 to 7 shots; extras are ignored. The first one is the tall (desktop) / full width (mobile) shot */
  shots: CollageShot[];
};

const MAX_STEP = 5;
const style = (i: number) => ({ "--i": Math.min(i, MAX_STEP) }) as CSSProperties;

export default function SetCollage({ id, label, heading, shots }: SetCollageProps) {
  const list = shots.slice(0, 7);
  const n = Math.max(3, list.length);
  return (
    <section id={id} className="set-collage" aria-labelledby={heading ? `${id ?? "set-collage"}-h` : undefined}>
      {(label || heading) && (
        <header className="set-collage-head">
          {label && (
            <p className="set-collage-label" data-rv>
              {label}
            </p>
          )}
          {heading && (
            <h2 className="set-collage-h" id={`${id ?? "set-collage"}-h`} data-rv style={{ "--d": "80ms" } as CSSProperties}>
              {heading}
            </h2>
          )}
        </header>
      )}
      <div className={`set-collage-grid set-collage-n${n}`} data-rv="mask">
        {list.map((s, i) => (
          <a
            key={s.src + i}
            className="set-collage-shot"
            href={s.href}
            target="_blank"
            rel="noreferrer"
            style={style(i)}
            data-dir={i % 2 ? "x" : "y"}
          >
            <img className="set-collage-img" src={s.src} alt={s.alt} width={s.width} height={s.height} loading="lazy" decoding="async" />
            <span className="set-collage-cap">
              <span>{s.caption}</span>
              <span className="set-collage-arrow" aria-hidden="true">
                ↗
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
