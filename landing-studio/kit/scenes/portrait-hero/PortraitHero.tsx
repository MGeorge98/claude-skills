import type { CSSProperties } from "react";
import SplitWords from "@/kit/react/SplitWords";
import "./portrait-hero.css";

/**
 * portrait-hero: portrait-led hero. One-shot reveal through the kit's [data-rv] (the IO adds .in).
 * The portrait is clip-revealed on a child of an observed wrapper (a fully clipped observed element never
 * intersects), authored at final size and scaled from .94 up to 1, never above. Name and role are word masks,
 * bio lines and the link row step in on a ladder of at most 6 (--i). Not pinned. Without JS or under html.rm
 * the finished section is what paints.
 */
export type PortraitImage = { src: string; alt: string; width: number; height: number };
export type PortraitLink = { label: string; href: string };

export type PortraitHeroProps = {
  id?: string;
  portrait: PortraitImage;
  name: string;
  role?: string;
  /** short lines, at most 6 are shown */
  bio?: string[];
  links?: PortraitLink[];
  /** mono kicker above the name */
  label?: string;
  /** desktop: portrait on the right, text on the left */
  flip?: boolean;
};

const MAX = 6;
const STEP = 70; // ms between ladder steps
const BASE = 220; // ms before the first bio line

const lad = (i: number) => ({ "--i": i, "--d": `${BASE + i * STEP}ms` }) as CSSProperties;

export default function PortraitHero({ id, portrait, name, role, bio = [], links, label, flip }: PortraitHeroProps) {
  const lines = bio.slice(0, MAX);
  const nameWords = name.trim().split(/\s+/).length;
  return (
    <section id={id} className={`portrait-hero${flip ? " portrait-hero-flip" : ""}`}>
      <div className="portrait-hero-media">
        <figure className="portrait-hero-card" data-rv="clip">
          {/* plain img with explicit size: the box is reserved before the file arrives */}
          <img className="portrait-hero-img" src={portrait.src} alt={portrait.alt} width={portrait.width} height={portrait.height} decoding="async" />
        </figure>
      </div>

      <div className="portrait-hero-text">
        {label && (
          <p className="portrait-hero-label" data-rv style={{ "--d": "0ms" } as CSSProperties}>
            {label}
          </p>
        )}
        <h2 className="portrait-hero-name" data-rv="mask">
          <SplitWords text={name} base={120} step={60} />
        </h2>
        {role && (
          <p className="portrait-hero-role" data-rv="mask">
            <SplitWords text={role} start={0} base={120 + nameWords * 60} step={40} />
          </p>
        )}
        {lines.length > 0 && (
          <ul className="portrait-hero-bio">
            {lines.map((t, i) => (
              <li key={i} className="portrait-hero-line" data-rv style={lad(i)}>
                {t}
              </li>
            ))}
          </ul>
        )}
        {links && links.length > 0 && (
          <ul className="portrait-hero-links" data-rv style={lad(Math.min(lines.length, MAX - 1))}>
            {links.map((l) => {
              const ext = /^https?:/.test(l.href);
              return (
                <li key={l.href}>
                  <a className="portrait-hero-link" href={l.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
