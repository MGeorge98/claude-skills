import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import SplitWords from "@/kit/react/SplitWords";
import "./brand-pour.css";

/**
 * brand-pour: a pinned chapter where the page becomes another brand and comes back. The guest brand pours down
 * in staggered columns (entry window), the content changes brand with it (--g, a pure function of --p, so
 * scrolling back is exact), four content groups take turns, then the host brand pours back (exit window).
 * Column transforms are written by the engine from [data-pour][data-d]; everything else is CSS of --p.
 * Paint budget: <= 120 paints per 2s scroll at 390 (scripts/perf.cjs). Only transform and opacity move here:
 * solid columns, a static glow layer faded by opacity, host-coloured twins cross-faded by opacity.
 */
export type GuestPalette = {
  /** CSS background of the guest chapter, may stack gradients (sliced across the columns) */
  bg: string;
  /** solid base under bg */
  base: string;
  /** main accent: buttons, dots */
  accent: string;
  /** lighter accent: counters, kicker, gradient end */
  accentHi: string;
  /** soft tint: gradient middle */
  soft: string;
  /** pale tint: pill text, second stack line */
  pale: string;
  /** body copy colour */
  body: string;
  /** headline colour */
  ink: string;
  /** button label on accent */
  onAccent: string;
  /** optional static per-column colours for the pour (cycled); default: every column is `base` */
  tints?: string[];
};

/** host palette the content returns to; defaults to the brand tokens of the page */
export type HostPalette = { bg: string; accent: string; accent2: string; ink: string; onAccent: string; pale: string };

export type Window = [number, number];

export type BrandPourProps = {
  label: string;
  id?: string;
  guest: GuestPalette;
  host?: Partial<HostPalette>;
  /** pour columns: 24 desktop, 12 below 820px */
  cols?: { desktop: number; mobile: number };
  /** the guest pours in over this window: column starts spread over [a, b - .12], each .12 long; colour switch follows */
  enter?: Window;
  /** the host pours back over this window: column starts spread over [a, b - .12], each .12 long */
  exit?: Window;
  /** smoothing constant in ms; the cascades read better a bit lazier than the default 80 */
  tau?: number;
  /** track length in vh */
  len?: { mobile: number; desktop: number };
  /** group windows [in, out]; the first group is in from the start, the last never leaves */
  windows?: { intro: Window; items: Window; stack: Window; thesis: Window };

  pill?: string;
  title: string;
  titleAccent?: string;
  body?: string;
  shot?: { src: string; alt: string; width: number; height: number; sizes?: string };
  itemsKicker?: string;
  items: string[];
  stack?: string[];
  thesis?: string;
  thesisAccent?: string;
  cta?: { label: string; href: string };
};

export const POUR_DEFAULTS = {
  cols: { desktop: 24, mobile: 12 },
  enter: [0, 0.22] as Window,
  exit: [0.8, 1] as Window,
  tau: 120,
  len: { mobile: 470, desktop: 560 },
  windows: { intro: [-1, 0.3] as Window, items: [0.31, 0.59] as Window, stack: [0.6, 0.71] as Window, thesis: [0.72, 9] as Window },
};

/** each column pours over this much progress; the spread of starts is the window minus this */
const POUR_LEN = 0.12;
/** largest possible column offset from pourOffsets (.1 + 4 x .003), so both column sets share one scale */
const POUR_DMAX = 0.112;

type V = CSSProperties & Record<`--${string}`, string | number>;
const fx = (n: number) => Number(n.toFixed(4));
const words = (s?: string) => (s ? s.trim().split(/\s+/).length : 0);

/** middle columns lead, the edges follow, plus a fixed step ((j * 37) % 5) so the edge is a staircase.
 *  Offsets are in progress units, 0 .. .112; the engine normalises by .112. */
export function pourOffsets(n: number) {
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, j) => ({
    j,
    d: ((Math.abs(j - mid) / mid) ** 1.7 * 0.1 + ((j * 37) % 5) * 0.003).toFixed(4),
    x: `${((j / (n - 1)) * 100).toFixed(3)}%`,
  }));
}

/** columns are solid (transform only, no gradient slices: those repainted every frame). `tints` optionally gives
 *  each guest column a static colour, cycled, set once and never animated. */
function Pour({ kind, n, size, tints }: { kind: "in" | "out"; n: number; size: "d" | "m"; tints?: string[] }) {
  return (
    <div className={`brand-pour-cols brand-pour-cols-${kind} brand-pour-cols-${size}`} aria-hidden="true">
      {pourOffsets(n).map(({ j, d }) => (
        <i key={j} data-pour={kind} data-d={d} style={kind === "in" && tints?.length ? ({ "--c": tints[j % tints.length] } as V) : undefined} />
      ))}
    </div>
  );
}

/** cross-fade pair: the guest-coloured layer is real, the host-coloured twin sits on top (aria-hidden) and its
 *  opacity follows --g. No colour is ever interpolated, so nothing repaints while the brand switches. */
function Dual({ className, children }: { className: string; children: ReactNode }) {
  // block-level for text (full line doubled), inline-grid for small chips: see .brand-pour-dual in the css
  return (
    <span className={`brand-pour-dual ${className}`}>
      <span className="brand-pour-dual-g">{children}</span>
      <span className="brand-pour-dual-h" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

export default function BrandPour(props: BrandPourProps) {
  const { label, id, guest, host = {}, pill, title, titleAccent, body, shot, itemsKicker, items, stack = [], thesis, thesisAccent, cta } = props;
  const cols = props.cols ?? POUR_DEFAULTS.cols;
  const enter = props.enter ?? POUR_DEFAULTS.enter;
  const exit = props.exit ?? POUR_DEFAULTS.exit;
  const len = props.len ?? POUR_DEFAULTS.len;
  const W = props.windows ?? POUR_DEFAULTS.windows;

  // intro inner timings scale with the intro end (today .3): pill .06, title .07 (+.008/word), body .13,
  // shot rise .10 over .14, shot dismiss .24 over .07
  const ib = W.intro[1];
  const k = ib / 0.3;
  // items: one at a time; each dims/leaves when the next arrives, the last stays
  const n = items.length;
  const istep = (W.items[1] - W.items[0] - 0.01) / Math.max(1, n);
  const sstep = Math.min(0.035, (W.stack[1] - W.stack[0] - 0.02) / Math.max(1, stack.length));
  const nn = String(n).padStart(2, "0");

  const style: V = {
    "--len": `${len.mobile}vh`,
    "--len-d": `${len.desktop}vh`,
    "--bp-bg": guest.bg,
    "--bp-base": guest.base,
    "--bp-accent": guest.accent,
    "--bp-accent-hi": guest.accentHi,
    "--bp-soft": guest.soft,
    "--bp-pale": guest.pale,
    "--bp-body": guest.body,
    "--bp-ink": guest.ink,
    "--bp-on": guest.onAccent,
    ...(host.bg && { "--bp-h-bg": host.bg }),
    ...(host.accent && { "--bp-h-accent": host.accent }),
    ...(host.accent2 && { "--bp-h-accent-2": host.accent2 }),
    ...(host.ink && { "--bp-h-ink": host.ink }),
    ...(host.onAccent && { "--bp-h-on": host.onAccent }),
    ...(host.pale && { "--bp-h-pale": host.pale }),
    "--bp-e0": enter[0],
    "--bp-e1": enter[1],
    "--bp-x0": exit[0],
    "--bp-x1": exit[1],
    "--bp-sh0": fx(0.1 * k),
    "--bp-sh1": fx(0.14 * k),
    "--bp-shx": fx(ib - 0.06),
  };
  const g = (w: Window): V => ({ "--a": w[0], "--b": w[1] });
  const a = (x: number): V => ({ "--a": fx(x) });

  return (
    <section
      id={id}
      className={`ls-scene brand-pour${shot ? " brand-pour-has-shot" : ""}`}
      data-scene
      data-tau={props.tau ?? POUR_DEFAULTS.tau}
      data-pour-in={`${enter[0]},${fx(Math.max(0, enter[1] - enter[0] - POUR_LEN))}`}
      data-pour-out={`${exit[0]},${fx(Math.max(0, exit[1] - exit[0] - POUR_LEN))}`}
      data-pour-len={POUR_LEN}
      data-pour-dmax={POUR_DMAX}
      aria-label={label}
      style={style}
    >
      <div className="ls-stage brand-pour-stage">
        <Pour kind="in" n={cols.desktop} size="d" tints={guest.tints} />
        <Pour kind="in" n={cols.mobile} size="m" tints={guest.tints} />
        {/* the guest gradient is one static layer that fades in once the columns have landed (opacity only) */}
        <div className="brand-pour-glow" aria-hidden="true" />
        <Pour kind="out" n={cols.desktop} size="d" />
        <Pour kind="out" n={cols.mobile} size="m" />

        <div className="brand-pour-g brand-pour-intro" style={g(W.intro)}>
          <div className="brand-pour-copy">
            {/* the pill is up before the pour starts (a < 0), so the pinned frame at p=0 is never empty */}
            {pill && (
              <p className="brand-pour-r" style={a(-0.05)}>
                <Dual className="brand-pour-pill">
                  <i aria-hidden="true" />
                  {pill}
                </Dual>
              </p>
            )}
            <h2 className="brand-pour-h" style={{ "--ha": fx(0.07 * k) } as V}>
              {/* the whole line is doubled so both layers wrap identically; in the host twin only the accent shows */}
              <Dual className="brand-pour-hd">
                <span className="brand-pour-plain">
                  <SplitWords text={title} />
                </span>
                {titleAccent && (
                  <>
                    {" "}
                    <span className="brand-pour-acc" style={{ "--i0": words(title) } as V}>
                      <SplitWords text={titleAccent} />
                    </span>
                  </>
                )}
              </Dual>
            </h2>
            {body && (
              <p className="brand-pour-body brand-pour-r" style={a(0.13 * k)}>
                {body}
              </p>
            )}
          </div>
          {shot && (
            <div className="brand-pour-shot">
              <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes={shot.sizes ?? "(max-width: 820px) 92vw, 720px"} decoding="async" />
            </div>
          )}
        </div>

        <div className="brand-pour-g brand-pour-items" style={g(W.items)}>
          {itemsKicker && <p className="brand-pour-k">{itemsKicker}</p>}
          <ol>
            {items.map((q, i) => (
              <li key={i} style={{ "--a": fx(W.items[0] + 0.01 + i * istep), "--c": i < n - 1 ? fx(W.items[0] + 0.01 + (i + 1) * istep) : 2 } as V}>
                <span className="brand-pour-n">
                  {String(i + 1).padStart(2, "0")} / {nn}
                </span>
                <p>{q}</p>
              </li>
            ))}
          </ol>
        </div>

        {stack.length > 0 && (
          <div className="brand-pour-g brand-pour-stack" style={g(W.stack)}>
            <p className="brand-pour-know">
              {stack.map((l, i) => (
                <span key={i} style={a(W.stack[0] + 0.01 + i * sstep)}>
                  {l}
                </span>
              ))}
            </p>
          </div>
        )}

        {(thesis || cta) && (
          <div className="brand-pour-g brand-pour-thesis" style={g(W.thesis)}>
            {thesis && (
              <p className="brand-pour-th brand-pour-r" style={a(W.thesis[0] + 0.01)}>
                <Dual className="brand-pour-thd">
                  <span className="brand-pour-plain">{thesis}</span> {thesisAccent && <span className="brand-pour-grad">{thesisAccent}</span>}
                </Dual>
              </p>
            )}
            {cta && (
              <div className="brand-pour-btns brand-pour-r" style={a(W.thesis[0] + 0.04)}>
                <a className="brand-pour-btn" href={cta.href} {...(/^https?:/.test(cta.href) ? { target: "_blank", rel: "noreferrer" } : {})}>
                  <span className="brand-pour-btn-l">
                    {cta.label} <span aria-hidden="true">→</span>
                  </span>
                  <span className="brand-pour-btn-h" aria-hidden="true">
                    <span>
                      {cta.label} <span>→</span>
                    </span>
                  </span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
