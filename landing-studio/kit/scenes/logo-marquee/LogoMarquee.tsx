import type { CSSProperties } from "react";
import "./logo-marquee.css";

/**
 * logo-marquee: a strip of third-party logos on a seamless CSS loop. The list is rendered twice and the track
 * moves translate3d(-50%) over --speed seconds, so the compositor does all the work. The loop is paused by
 * `.off` (engine: [data-watch] on the section), html.paused (MotionToggle) and, optionally, hover / focus.
 * Without JS or under html.rm the second copy is hidden and the logos sit still in one wrapping row.
 * Logos keep their own colours; only opacity changes.
 */
export type MarqueeLogo = { src: string; alt: string; width: number; height: number; href?: string };

export type LogoMarqueeProps = {
  id?: string;
  /** accessible name of the strip (also the aria-label of the list) */
  label: string;
  logos: MarqueeLogo[];
  /** mono line above the strip */
  kicker?: string;
  /** seconds for one full loop, default 28 */
  speed?: number;
  /** pause the loop while hovered or focused, default true */
  pauseOnHover?: boolean;
};

function Item({ logo, hidden }: { logo: MarqueeLogo; hidden: boolean }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="logo-marquee-img" src={logo.src} alt={hidden ? "" : logo.alt} width={logo.width} height={logo.height} loading="lazy" decoding="async" draggable={false} />
  );
  return (
    <li className="logo-marquee-item">
      {logo.href ? (
        <a className="logo-marquee-a" href={logo.href} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined}>
          {img}
        </a>
      ) : (
        img
      )}
    </li>
  );
}

export default function LogoMarquee({ id, label, logos, kicker, speed = 28, pauseOnHover = true }: LogoMarqueeProps) {
  const style = { "--speed": `${speed}s` } as CSSProperties;
  return (
    <section id={id} className={`logo-marquee${pauseOnHover ? " logo-marquee-hov" : ""}`} data-watch="marquee" aria-label={label} style={style}>
      {kicker ? <p className="logo-marquee-kicker">{kicker}</p> : null}
      <div className="logo-marquee-view">
        <div className="logo-marquee-track">
          <ul className="logo-marquee-set">
            {logos.map((l, i) => (
              <Item key={i} logo={l} hidden={false} />
            ))}
          </ul>
          <ul className="logo-marquee-set logo-marquee-dup" aria-hidden="true">
            {logos.map((l, i) => (
              <Item key={i} logo={l} hidden />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
