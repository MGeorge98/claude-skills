import type { CSSProperties, ReactNode } from "react";
import SplitWords from "@/kit/react/SplitWords";
import "./hero-words.css";

/**
 * hero-words: first-screen hero. The headline rises word by word out of masks, kicker / lead / CTAs / right slot
 * fade up on a fixed timeline. Pure CSS from the first paint (never waits for hydration or an observer).
 * Hidden states live only in keyframes with fill backwards/both, so the base state is always the final one.
 */
export type HeroCta = { label: string; href: string; external?: boolean };

export type HeroTiming = {
  /** ms after first paint */
  kicker: number;
  title: number;
  /** ms between headline words */
  step: number;
  lead: number;
  ctas: number;
  right: number;
  below: number;
};

export const HERO_TIMING: HeroTiming = { kicker: 200, title: 420, step: 90, lead: 800, ctas: 1000, right: 600, below: 1000 }; // lead + --ls-t-reveal is the hero LCP: 2026-10-08 the old 1450 gave 2870 ms throttled

export type HeroWordsProps = {
  id?: string;
  /** header row (logos, author), spans the full width */
  top?: ReactNode;
  kicker?: ReactNode;
  /** plain words, split on spaces */
  title: string;
  /** words appended after `title`, painted with the accent gradient and a single sheen */
  titleAccent?: string;
  lead?: ReactNode;
  primary?: HeroCta;
  secondary?: HeroCta;
  /** two-column mode from 1024px: this slot sits on the right (the form today) */
  right?: ReactNode;
  /** under the headline (left column in split mode), e.g. a product card */
  below?: ReactNode;
  /** backdrop layer behind everything, e.g. <NetworkBackdrop /> */
  children?: ReactNode;
  timing?: Partial<HeroTiming>;
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** a string lead keeps its last two words together (no orphan, no break inside "e-mail" at 390) */
function tail(lead: ReactNode): ReactNode {
  if (typeof lead !== "string") return lead;
  const m = lead.match(/^(.*\S)\s+(\S+\s+\S+)$/s);
  return m ? (
    <>
      {m[1]} <span className="hero-words-nw">{m[2]}</span>
    </>
  ) : (
    <span className="hero-words-nw">{lead}</span>
  );
}
const words = (s?: string) => (s ? s.trim().split(/\s+/).length : 0);

function Cta({ c, kind }: { c: HeroCta; kind: "primary" | "secondary" }) {
  const ext = c.external ?? /^https?:/.test(c.href);
  return (
    <a className={`hero-words-btn hero-words-btn-${kind}`} href={c.href} {...(ext ? { target: "_blank", rel: "noreferrer" } : {})}>
      {c.label}
      {kind === "primary" && <span aria-hidden="true"> →</span>}
    </a>
  );
}

export default function HeroWords({ id, top, kicker, title, titleAccent, lead, primary, secondary, right, below, children, timing }: HeroWordsProps) {
  const t = { ...HERO_TIMING, ...timing };
  return (
    <section id={id} className={`hero-words${right ? " hero-words-split" : ""}`} data-watch="hero">
      {children && <div className="hero-words-back">{children}</div>}
      {top && <header className="hero-words-top">{top}</header>}

      <div className="hero-words-head">
        {kicker && (
          <p className="hero-words-kicker hero-words-in" style={d(t.kicker)}>
            {kicker}
          </p>
        )}
        <h1 className="hero-words-h1">
          <SplitWords text={title} base={t.title} step={t.step} />
          {titleAccent && (
            <>
              {" "}
              <span className="hero-words-acc">
                <SplitWords text={titleAccent} start={words(title)} base={t.title} step={t.step} />
              </span>
            </>
          )}
        </h1>
        {lead && (
          <p className="hero-words-lead hero-words-in" style={d(t.lead)}>
            {tail(lead)}
          </p>
        )}
        {(primary || secondary) && (
          <div className="hero-words-ctas hero-words-in" style={d(t.ctas)}>
            {primary && <Cta c={primary} kind="primary" />}
            {secondary && <Cta c={secondary} kind="secondary" />}
          </div>
        )}
      </div>

      {right && (
        <div className="hero-words-right hero-words-in" style={d(t.right)}>
          {right}
        </div>
      )}
      {below && (
        <div className="hero-words-below hero-words-in" style={d(t.below)}>
          {below}
        </div>
      )}
    </section>
  );
}
