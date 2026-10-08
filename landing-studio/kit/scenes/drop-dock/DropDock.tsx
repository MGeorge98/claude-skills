"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import SplitWords from "@/kit/react/SplitWords";
import "./drop-dock.css";

/**
 * drop-dock: items are thrown into a container from off-screen corners, a counter ticks as each one lands,
 * the container shakes once and snaps. Flow scene (not pinned). One IntersectionObserver plus WAAPI, no scroll
 * listener, no rAF loop. The server HTML is the final state: every item docked, the counter at its total.
 */
export type DropDockItem = {
  /** icon node or a short label (2 to 3 characters), drawn in the round mark */
  mark?: ReactNode;
  name: string;
  /** one short line under the name */
  note?: ReactNode;
};

/** a plain noun, or Romanian singular / plural forms ("agent" / "agenți") */
export type CounterLabel = string | { one: string; many: string };

export type DropDockTiming = {
  /** ms after the start at which each item lands; more items continue the ladder by the last gap */
  land: number[];
  /** ms per throw */
  dur: number;
  /** ms of the container shake */
  shake: number;
  /** ms after the start: whatever is still running is forced to the final state */
  failsafe: number;
};

export const DROP_DOCK_TIMING: DropDockTiming = { land: [60, 280, 500], dur: 680, shake: 180, failsafe: 3500 };

export type DropDockProps = {
  id?: string;
  kicker?: ReactNode;
  heading?: string;
  lead?: ReactNode;
  /** the container's name, e.g. "Firma ta" */
  label: string;
  /** mono line beside the label */
  meta?: ReactNode;
  counterLabel: CounterLabel;
  items: DropDockItem[];
  /** under the container (a CTA link, a note) */
  children?: ReactNode;
  timing?: Partial<DropDockTiming>;
  /** visible fraction of the container that starts the throw */
  threshold?: number;
};

const count = (n: number, l: CounterLabel) => `${n} ${typeof l === "string" ? l : n === 1 ? l.one : l.many}`;

/** where each item starts: x "l" | "r" | fraction of vw, y "t" | "b" | fraction of vh, rotation in deg */
type From = { x: "l" | "r" | number; y: "t" | "b" | number; r: number };
const FROM: From[] = [
  { x: "l", y: "t", r: -22 },
  { x: "r", y: "t", r: 18 },
  { x: 0.5, y: "b", r: -14 },
  { x: "l", y: "b", r: 16 },
  { x: "r", y: "b", r: -18 },
  { x: 0.5, y: "t", r: 12 },
];

export default function DropDock({ id, kicker, heading, lead, label, meta, counterLabel, items, children, timing, threshold = 0.4 }: DropDockProps) {
  const root = useRef<HTMLElement>(null);
  const t = { ...DROP_DOCK_TIMING, ...timing };
  const total = items.length;
  const final = count(total, counterLabel);
  const labelKey = typeof counterLabel === "string" ? counterLabel : `${counterLabel.one}|${counterLabel.many}`;

  useEffect(() => {
    const sec = root.current;
    const box = sec?.querySelector<HTMLElement>("[data-drop]");
    if (!sec || !box) return;
    const ctr = box.querySelector<HTMLElement>("[data-ctr]");
    const els = Array.from(box.querySelectorAll<HTMLElement>("[data-drop-item]"));
    const timers: number[] = [];
    const anims: Animation[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const setCtr = (s: string) => {
      if (ctr) ctr.textContent = s;
    };
    let io: IntersectionObserver | null = null;
    let started = false;
    // the server renders the final count (no-JS truth); with motion on, the counter starts at zero before the throw
    if (!document.documentElement.classList.contains("rm")) setCtr(count(0, counterLabel));

    const finish = () => {
      started = true;
      io?.disconnect();
      anims.forEach((a) => a.finish());
      setCtr(final);
      sec.classList.add("drop-dock-go", "drop-dock-done");
      box.classList.add("snap");
    };

    const land = (i: number) => {
      const L = t.land;
      if (i < L.length) return L[i];
      const gap = L.length > 1 ? L[L.length - 1] - L[L.length - 2] : 220;
      return L[L.length - 1] + (i - L.length + 1) * gap;
    };

    const drop = () => {
      started = true;
      io?.disconnect();
      at(t.failsafe, finish); // armed only now, once the container is on screen
      try {
        if (!Element.prototype.animate) return finish();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const spring = getComputedStyle(document.documentElement).getPropertyValue("--ls-spring").trim() || "cubic-bezier(.32,1.28,.36,1)";
        setCtr(count(0, counterLabel));
        sec.classList.add("drop-dock-go");
        els.forEach((el, i) => {
          const r = el.getBoundingClientRect(); // once, at the start of the throw
          const f = FROM[i % FROM.length];
          const ox = f.x === "l" ? -(r.width * 0.6) - 24 : f.x === "r" ? vw + r.width * 0.6 + 24 : f.x * vw;
          const oy = f.y === "t" ? -(r.height * 0.6) - 24 : f.y === "b" ? vh + r.height * 0.6 + 24 : f.y * vh;
          const dx = ox - (r.left + r.width / 2);
          const dy = oy - (r.top + r.height / 2);
          anims.push(
            el.animate(
              [{ transform: `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) rotate(${f.r}deg) scale(.94)` }, { transform: "none" }],
              { duration: t.dur, delay: land(i), easing: spring, fill: "backwards" },
            ),
          );
          at(land(i) + t.dur * 0.6, () => setCtr(count(i + 1, counterLabel)));
        });
        const snap = land(total - 1) + t.dur - 40;
        at(snap, () => {
          anims.push(
            box.animate(
              [
                { transform: "none" },
                { transform: "translate(-4px, 2px)", offset: 0.25 },
                { transform: "translate(3px, -2px)", offset: 0.55 },
                { transform: "translate(-1px, 1px)", offset: 0.8 },
                { transform: "none" },
              ],
              { duration: t.shake, easing: "linear" },
            ),
          );
          box.classList.add("snap");
        });
        at(snap + t.shake + 80, () => {
          setCtr(final);
          sec.classList.add("drop-dock-done");
        });
      } catch {
        finish();
      }
    };

    if (document.documentElement.classList.contains("rm") || typeof IntersectionObserver === "undefined") {
      finish();
    } else {
      // The root reaches far above the viewport, so a container the user jumped past still reports as
      // intersecting (ratio 1) and is finished at once instead of being missed between two frames.
      io = new IntersectionObserver(
        (es) => {
          if (started) return;
          const e = es[es.length - 1];
          if (!e.isIntersecting || e.intersectionRatio < threshold) return;
          if (e.boundingClientRect.bottom <= 0) finish();
          else drop();
        },
        { threshold: [0, threshold], rootMargin: "100000px 0px 0px 0px" },
      );
      io.observe(box);
    }

    return () => {
      io?.disconnect();
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, final, labelKey, threshold]);

  return (
    <section id={id} ref={root} className="drop-dock">
      {(kicker || heading || lead) && (
        <div className="drop-dock-head">
          {kicker && (
            <p className="drop-dock-kicker" data-rv="">
              {kicker}
            </p>
          )}
          {heading && (
            <h2 className="drop-dock-h" data-rv="mask">
              <SplitWords text={heading} step={60} />
            </h2>
          )}
          {lead && (
            <p className="drop-dock-lead" data-rv="" style={{ "--d": "200ms" } as CSSProperties}>
              {lead}
            </p>
          )}
        </div>
      )}
      <div className="drop-dock-box" data-drop="">
        <div className="drop-dock-top">
          <span className="drop-dock-label">{label}</span>
          {meta && <span className="drop-dock-meta">{meta}</span>}
          <span className="drop-dock-ctr" data-ctr="">
            {final}
          </span>
        </div>
        <ul className="drop-dock-list" style={{ "--n": Math.min(total, 3) } as CSSProperties}>
          {items.map((it, i) => (
            <li key={`${it.name}-${i}`} className="drop-dock-item" data-drop-item="">
              <div className="drop-dock-card">
                {it.mark != null && (
                  <span className="drop-dock-mark" aria-hidden="true">
                    {it.mark}
                  </span>
                )}
                <span className="drop-dock-txt">
                  <b className="drop-dock-name">{it.name}</b>
                  {it.note && <span className="drop-dock-note">{it.note}</span>}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {children && <div className="drop-dock-after">{children}</div>}
    </section>
  );
}
