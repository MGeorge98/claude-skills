"use client";

// Tour engine, cursor mode. Per step: navigate, reset the mock screen from the step number, then for each beat
// scroll the target into view, glide our own cursor to it (X and Y eased differently, so the path curves),
// press + ripple, click the real element (the same control a visitor can click), let the screen react; finally
// outline the step's whole block and grow the caption card out of the cursor tip. No dark mask.
// Content: lib/tour.ts. Words: lib/tour-strings.ts. Colours: the --pointer*, --ring* tokens in app/globals.css.
// Mock state: lib/demo-state.ts (the engine resets it per step and writes the reserved `typed` / `typing` fields:
// `typed[<data-tour id>]` is the text typed into that field, `typing` is the id being typed into, or null).
// No framer-motion here on purpose: under reduced motion it logs a dev-console warning for every motion element.
// Mounted once in app/layout.tsx inside <Suspense>. Product-agnostic: do not edit per demo; fix bugs here and in the skill.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Pause, Play, X } from "lucide-react";
import { CHAPTERS, FINAL_ROUTE, STEPS, STEP_PARAM, stepHref, type Beat } from "@/lib/tour";
import { T } from "@/lib/tour-strings";
import { resetDemo, setDemo } from "@/lib/demo-state";
import { btn } from "@/components/tour-ui";

type Pt = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
type Card = { n: number; left: number; top: number; origin: string; ring: Box | null };

const TOP = 76; // a scrolled block lands just under the sticky header
const PHONE = 640; // below this width the card is a bottom sheet
const CARD_W = 344;
const RING_PAD = 6;
const SAVED = "tour-step";
const AUTO = "tour-auto";
const AUTO_MS = 7000;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));
const boxOf = (el: Element, pad = 0): Box => {
  const r = el.getBoundingClientRect();
  return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
};
const hit = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const q = (id: string) => document.querySelector<HTMLElement>(`[data-tour="${id}"]`);

class Dead extends Error {}

/** The caption card's spot: beside the cursor if that leaves the target and the whole ring block uncovered,
 *  else beside the block (and the cursor moves to the card's corner), else a free viewport corner. */
function placeCard(tip: Pt, w: number, h: number, target: Box, ring: Box | null, vw: number, vh: number) {
  const g = 18, m = 12, top0 = 64;
  const avoid = ring ? [target, ring] : [target];
  const fits = (l: number, t: number, also = avoid) => {
    const b = { x: l, y: t, w, h };
    return l >= m && t >= top0 && l + w <= vw - m && t + h <= vh - m && !also.some((a) => hit(a, b));
  };
  // 1. around the cursor tip; the card grows from the corner touching the tip
  const near: [number, number, string][] = [
    [tip.x + g, tip.y + g, "0% 0%"],
    [tip.x - w - 8, tip.y + g, "100% 0%"],
    [tip.x + g, tip.y - h - 8, "0% 100%"],
    [tip.x - w - 8, tip.y - h - 8, "100% 100%"],
  ];
  for (const [l, t, o] of near) if (fits(l, t)) return { left: l, top: t, origin: o, tip, free: true };
  // 2. beside the whole block; the cursor rests just outside the card's corner nearest the block
  const R = ring ?? target;
  const ty = clamp(R.y, top0, vh - h - m), tx = clamp(R.x, m, vw - w - m);
  const side: [number, number, string, Pt][] = [
    [R.x + R.w + g, ty, "0% 0%", { x: R.x + R.w + 8, y: ty + 4 }],
    [R.x - w - g, ty, "100% 0%", { x: R.x - 8, y: ty + 4 }],
    [tx, R.y + R.h + g, "0% 0%", { x: tx + 4, y: R.y + R.h + 8 }],
    [tx, R.y - h - g, "0% 100%", { x: tx + 4, y: R.y - 8 }],
  ];
  for (const [l, t, o, p] of side) if (fits(l, t)) return { left: l, top: t, origin: o, tip: p, free: true };
  // 3. a viewport corner that at least leaves the clicked target free
  const corners: [number, number, string, Pt][] = [
    [vw - w - m, vh - h - m, "0% 0%", { x: vw - w - m - 6, y: vh - h - m - 6 }],
    [m, vh - h - m, "100% 0%", { x: m + w + 6, y: vh - h - m - 6 }],
    [vw - w - m, top0, "0% 100%", { x: vw - w - m - 6, y: top0 + h + 6 }],
  ];
  for (const [l, t, o, p] of corners) if (fits(l, t, [target])) return { left: l, top: t, origin: o, tip: p, free: false };
  return { left: vw - w - m, top: vh - h - m, origin: "0% 0%", tip: { x: vw - w - m - 6, y: vh - h - m - 6 }, free: false };
}

/** Scroll horizontal panes (the court board, the calendar on phones) so the element sits in their visible part. */
function revealX(el: HTMLElement) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (p.scrollWidth <= p.clientWidth + 1 || !/(auto|scroll)/.test(getComputedStyle(p).overflowX)) continue;
    const sticky = p.querySelector<HTMLElement>("[data-sticky]")?.offsetWidth ?? 0; // a sticky label column
    const pr = p.getBoundingClientRect(), r = el.getBoundingClientRect();
    const left = pr.left + sticky, right = pr.right;
    if (r.left < left + 8 || r.right > right - 8) {
      const mid = (left + right) / 2;
      p.scrollLeft += r.left + r.width / 2 - mid;
    }
  }
}

export function Tour() {
  const params = useSearchParams(), pathname = usePathname(), router = useRouter();
  const [reduce, setReduce] = useState(false); // read on the client only (never branch server markup on it)
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setReduce(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  const n = Number(params.get(STEP_PARAM)) || 0;
  const step = STEPS[n - 1];
  const active = !!step && step.route === pathname;

  const xEl = useRef<HTMLDivElement>(null), yEl = useRef<HTMLDivElement>(null), pressEl = useRef<HTMLDivElement>(null);
  const rippleLayer = useRef<HTMLDivElement>(null);
  const cardEl = useRef<HTMLDivElement>(null);
  const pos = useRef<Pt | null>(null);
  const lastPointer = useRef<Pt | null>(null);
  const running = useRef(false); // a tour is on (the cursor keeps its place between steps and routes)
  const anims = useRef<Animation[]>([]);
  const [cursorOn, setCursorOn] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [mobile, setMobile] = useState(false);
  const [auto, setAuto] = useState(false);
  const cardOpen = useRef(false);
  const shown = !!card && card.n === n && active;
  cardOpen.current = shown;
  const base = useRef<Box | null>(null); // where the ring block was when the card appeared

  const go = useCallback((i: number) => {
    if (i < 1) return;
    if (i > STEPS.length) return router.push(FINAL_ROUTE);
    if (STEPS[i - 1].route === pathname) router.replace(stepHref(i), { scroll: false });
    else router.push(stepHref(i)); // a new page starts at its top
  }, [pathname, router]);
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  useEffect(() => {
    try { setAuto(sessionStorage.getItem(AUTO) === "1"); } catch {}
    const onDown = (e: PointerEvent) => { lastPointer.current = { x: e.clientX, y: e.clientY }; };
    addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () => removeEventListener("pointerdown", onDown, { capture: true });
  }, []);

  const place = (p: Pt) => {
    pos.current = p;
    if (xEl.current) xEl.current.style.transform = `translateX(${p.x}px)`;
    if (yEl.current) yEl.current.style.transform = `translateY(${p.y}px)`;
  };

  // The step's run. Everything awaits through `live()`, so a newer step (or closing) cancels it cleanly.
  useEffect(() => {
    if (!step) {
      running.current = false; // the next tour starts from the visitor's click again
      document.body.style.paddingBottom = "";
      setCard(null);
      setCursorOn(false);
      return;
    }
    if (!active) { setCard(null); return; } // navigation in progress
    try { sessionStorage.setItem(SAVED, String(n)); } catch {}
    const phone = innerWidth < PHONE;
    setMobile(phone);
    document.body.style.paddingBottom = phone ? "45vh" : ""; // room for low targets to rise above the sheet
    setCard(null);
    base.current = null;
    resetDemo(step.setup); // the screen's state comes from the step number, not from earlier animations

    let dead = false;
    const timers = new Set<number>();
    const live = () => { if (dead) throw new Dead(); };
    const sleep = (ms: number) => new Promise<void>((res) => { const t = window.setTimeout(() => { timers.delete(t); res(); }, ms); timers.add(t); });
    const frame = () => new Promise<void>((res) => requestAnimationFrame(() => res()));
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const find = async (id: string) => {
      const t0 = performance.now();
      for (;;) {
        live();
        const el = q(id);
        if (el && el.getBoundingClientRect().height > 0) return el;
        if (performance.now() - t0 > 4000) { console.warn(`[tour] no [data-tour="${id}"] on ${pathname}`); throw new Dead(); }
        await frame();
      }
    };
    // Scroll only as much as needed: the whole ring block if it fits, else the target; phones keep it above the sheet.
    const bring = async (el: HTMLElement) => {
      revealX(el);
      const bottom = innerHeight * (phone ? 0.55 : 1) - 16;
      const ringEl = step.ring ? q(step.ring) : null;
      const R = ringEl && ringEl.contains(el) && getComputedStyle(ringEl).position !== "fixed" ? ringEl.getBoundingClientRect() : null;
      const r = el.getBoundingClientRect();
      const box = R && R.height <= bottom - TOP ? R : r;
      const dy = box.top < TOP ? box.top - TOP : box.bottom > bottom ? Math.min(box.bottom - bottom, r.top - TOP) : 0;
      if (Math.abs(dy) > 1) scrollTo({ top: scrollY + dy, behavior: instant ? "auto" : "smooth" });
      let still = 0, last = NaN;
      const t0 = performance.now();
      while (still < 4 && performance.now() - t0 < 1500) {
        await frame(); live();
        const y = el.getBoundingClientRect().top;
        still = Math.abs(y - last) < 0.5 ? still + 1 : 0;
        last = y;
      }
    };
    const fitRing = async () => {
      const ringEl = step.ring ? q(step.ring) : null;
      if (!ringEl || getComputedStyle(ringEl).position === "fixed") return;
      const R = ringEl.getBoundingClientRect();
      const bottom = innerHeight * (phone ? 0.55 : 1) - 16;
      if (R.height > bottom - TOP || (R.top >= TOP && R.bottom <= bottom)) return;
      const dy = R.top < TOP ? R.top - TOP : R.bottom - bottom;
      const from = pos.current;
      scrollTo({ top: scrollY + dy, behavior: instant ? "auto" : "smooth" });
      let still = 0, last = NaN;
      const t0 = performance.now();
      while (still < 4 && performance.now() - t0 < 1500) {
        await frame(); live();
        const y = ringEl.getBoundingClientRect().top;
        still = Math.abs(y - last) < 0.5 ? still + 1 : 0;
        last = y;
      }
      // the cursor stays on the element it clicked
      const t = q(step.target);
      if (t && from) await glide(pointOn(t));
      else if (from) await glide({ x: from.x, y: from.y - dy });
    };
    const glide = async (to: Pt) => {
      const from = pos.current ?? to;
      const d = Math.hypot(to.x - from.x, to.y - from.y);
      place(to);
      if (instant || d < 2 || !xEl.current || !yEl.current) return;
      const duration = Math.min(880, 260 + d * 0.45); // short hops quick, long moves slower, capped
      const a = xEl.current.animate([{ transform: `translateX(${from.x}px)` }, { transform: `translateX(${to.x}px)` }], { duration, easing: "cubic-bezier(.5,0,.25,1)" });
      const b = yEl.current.animate([{ transform: `translateY(${from.y}px)` }, { transform: `translateY(${to.y}px)` }], { duration, easing: "cubic-bezier(.25,.55,.3,1)" });
      anims.current = [a, b];
      try { await Promise.all([a.finished, b.finished]); } catch {}
      live();
    };
    const press = async (p: Pt) => {
      if (instant) return;
      pressEl.current?.animate([{ transform: "scale(1)" }, { transform: "scale(.8)" }, { transform: "scale(1)" }], { duration: 220, easing: "ease-out" });
      const layer = rippleLayer.current;
      if (layer) {
        const r = document.createElement("span");
        r.className = "tour-ripple";
        r.style.left = `${p.x}px`;
        r.style.top = `${p.y}px`;
        layer.appendChild(r);
        r.animate([{ transform: "translate(-50%,-50%) scale(.2)", opacity: 0.9 }, { transform: "translate(-50%,-50%) scale(1.7)", opacity: 0 }], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" })
          .finished.then(() => r.remove(), () => r.remove());
      }
      await sleep(120);
    };
    const pointOn = (el: HTMLElement): Pt => {
      const r = el.getBoundingClientRect();
      // the tip lands a little left of centre on wide elements, like a hand aiming at the label
      return { x: r.left + Math.min(r.width / 2, Math.max(18, r.width * 0.35)), y: r.top + r.height / 2 };
    };
    let clicked: Box | null = null; // the last clicked element's box (the click may replace the element)
    // `until`: a data-tour id or a CSS selector that must exist (and be visible) before the tour moves on
    const appear = async (until: string, timeout: number) => {
      const sel = /^[\[.#]/.test(until) ? until : `[data-tour="${until}"]`;
      const t0 = performance.now();
      for (;;) {
        live();
        const el = document.querySelector<HTMLElement>(sel);
        if (el && el.getBoundingClientRect().height > 0) return;
        if (performance.now() - t0 > timeout) { console.warn(`[tour] still no ${sel} after ${timeout} ms`); return; }
        await frame();
      }
    };
    const beat = async (b: Beat, click: boolean) => {
      const el = await find(b.target);
      await bring(el);
      await glide(pointOn(el));
      if (b.hover) { await sleep(instant ? 0 : 380); return; }
      if (click) { await press(pos.current!); live(); clicked = boxOf(el, 4); el.click(); }
      if (b.typing) {
        // one buffer per field (keyed by the beat's target), so a step can fill several inputs in turn
        const text = b.typing;
        for (let i = 1; i <= text.length; i++) {
          live();
          const part = instant ? text : text.slice(0, i);
          setDemo((st) => ({ typed: { ...st.typed, [b.target]: part }, typing: b.target }));
          if (instant) break;
          await sleep(38 + (text.charCodeAt(i - 1) % 5) * 9);
        }
        setDemo({ typing: null });
      }
      if (b.until) await appear(b.until, b.timeout ?? 4000); // wait for the screen's own reaction (an animation, a reply)
      await sleep(instant ? 0 : b.wait ?? 420);
    };

    (async () => {
      try {
        // first step of a visit: the cursor starts where the visitor clicked "Începe turul" (or mid-screen)
        if (!pos.current || !running.current) place(lastPointer.current ?? { x: innerWidth * 0.5, y: innerHeight * 0.62 });
        running.current = true;
        setCursorOn(true);
        if (!instant) await sleep(260);
        for (const b of step.before ?? []) await beat(b, true);
        await beat({ target: step.target, wait: 450, until: step.until, timeout: step.timeout }, true);
        live();
        await fitRing(); // the click may have grown the block: bring the whole of it back into view
        const targetEl = q(step.target);
        const ringEl = step.ring ? q(step.ring) : null;
        let target = targetEl ? boxOf(targetEl, 4) : clicked ?? { x: pos.current!.x - 20, y: pos.current!.y - 20, w: 40, h: 40 };
        let ring = ringEl ? boxOf(ringEl, RING_PAD) : null;
        base.current = ringEl ?? targetEl ? boxOf((ringEl ?? targetEl)!, RING_PAD) : null;
        if (phone) {
          setCard({ n, left: 0, top: 0, origin: "50% 100%", ring });
        } else {
          const vw = document.documentElement.clientWidth; // not innerWidth: the scrollbar would sit under the card
          const h = cardEl.current?.offsetHeight || 260;
          let spot = placeCard(pos.current!, CARD_W, h, target, ring, vw, innerHeight);
          // No free spot beside the cursor or the block: if block + card stack in the viewport, lift the block
          // to the top and put the card under it, rather than covering any part of the block.
          if (!spot.free && ringEl && ring && ring.h + h + 40 <= innerHeight - TOP && ring.y > TOP) {
            const dy = ring.y + RING_PAD - TOP;
            scrollTo({ top: scrollY + dy, behavior: instant ? "auto" : "smooth" });
            let still = 0, last = NaN;
            const t0 = performance.now();
            while (still < 4 && performance.now() - t0 < 1500) {
              await frame(); live();
              const y = ringEl.getBoundingClientRect().top;
              still = Math.abs(y - last) < 0.5 ? still + 1 : 0;
              last = y;
            }
            ring = boxOf(ringEl, RING_PAD);
            const t = q(step.target);
            target = t ? boxOf(t, 4) : { ...target, y: target.y - dy };
            place({ x: pos.current!.x, y: pos.current!.y - dy }); // the cursor rides along with its target
            spot = placeCard(pos.current!, CARD_W, h, target, ring, vw, innerHeight);
          }
          base.current = boxOf(ringEl ?? targetEl!, RING_PAD);
          await glide(spot.tip);
          setCard({ n, left: spot.left, top: spot.top, origin: spot.origin, ring });
        }
      } catch (e) {
        if (!(e instanceof Dead)) throw e;
      }
    })();

    // After the card is up, the block, the cursor and the card move together when the page scrolls or resizes.
    const follow = () => {
      const ringEl = q(step.ring ?? step.target);
      if (!ringEl || !cardOpen.current || !base.current) return;
      const now = boxOf(ringEl, RING_PAD);
      const dx = now.x - base.current.x, dy = now.y - base.current.y;
      if (!dx && !dy) return;
      base.current = now;
      if (pos.current) place({ x: pos.current.x + dx, y: pos.current.y + dy });
      setCard((c) => (c ? { ...c, left: c.left + dx, top: c.top + dy, ring: c.ring ? now : null } : c));
    };
    addEventListener("scroll", follow, { passive: true });
    addEventListener("resize", follow);
    return () => {
      dead = true;
      timers.forEach(clearTimeout);
      anims.current.forEach((a) => a.cancel());
      removeEventListener("scroll", follow);
      removeEventListener("resize", follow);
      setDemo({ typing: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, active]);

  useEffect(() => { if (shown) cardEl.current?.focus({ preventScroll: true }); }, [shown, n]); // eslint-disable-line react-hooks/exhaustive-deps

  // Optional auto-play: off by default; the visitor turns it on from the card.
  useEffect(() => {
    if (!shown || !auto) return;
    const t = setTimeout(() => go(n + 1), AUTO_MS);
    return () => clearTimeout(t);
  }, [shown, auto, n, go]);
  const toggleAuto = () => setAuto((a) => { try { sessionStorage.setItem(AUTO, a ? "0" : "1"); } catch {} return !a; });

  useEffect(() => {
    if (!step) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") go(n + 1);
      else if (e.key === "ArrowLeft") go(n - 1);
      else if (e.key === "Escape") close();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [step, n, go, close]);

  const resume = () => {
    // the last step seen if it is on this page, else this page's first step, else the last step seen
    let saved = 0;
    try { saved = Number(sessionStorage.getItem(SAVED)) || 0; } catch {}
    go(STEPS[saved - 1]?.route === pathname ? saved : STEPS.findIndex((s) => s.route === pathname) + 1 || saved || 1);
  };
  const showResume = !step && pathname !== "/" && pathname !== FINAL_ROUTE;
  const pct = (n / STEPS.length) * 100;

  return (
    <>
      {/* the cursor: our own arrow, outside the accessibility tree, never catches a click */}
      <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ opacity: cursorOn && step ? 1 : 0, transition: "opacity .2s" }}>
        <div ref={xEl}>
          <div ref={yEl}>
            <div ref={pressEl} className="origin-top-left drop-shadow-[0_4px_8px_rgba(14,19,32,.35)]">
              <svg width="26" height="30" viewBox="0 0 26 30" className="-translate-x-[3px] -translate-y-[2px]">
                <path d="M3 2.5 L3 24.5 L8.6 19.4 L12.6 28 L16.9 26 L12.9 17.6 L20.6 17.4 Z" fill="var(--pointer)" stroke="var(--pointer-edge)" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div ref={rippleLayer} aria-hidden className="pointer-events-none fixed inset-0 z-[89]" />

      {/* a thin outline around the whole block the step is about, while the caption is open */}
      {shown && card!.ring && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[65] rounded-[18px] shadow-[0_0_0_2px_var(--ring),0_0_0_6px_var(--ring-glow)] motion-safe:animate-[tour-ring_.25s_ease-out]"
          style={{ left: card!.ring!.x, top: card!.ring!.y, width: card!.ring!.w, height: card!.ring!.h }}
        />
      )}

      {step && (
        <div
          key={n}
          ref={cardEl}
          role="dialog"
          aria-modal="false"
          aria-labelledby="tour-title"
          aria-hidden={!shown}
          tabIndex={-1}
          style={{
            // grows out of the cursor (desktop) or rises (phone sheet); CSS only, instant under reduced motion
            opacity: shown ? 1 : 0,
            transform: shown ? "none" : mobile ? "translateY(24px)" : "scale(.55)",
            transition: reduce ? "none" : "transform 300ms cubic-bezier(.2,.9,.25,1.06), opacity 160ms ease-out",
            ...(mobile ? {} : { left: shown ? card!.left : -9999, top: shown ? card!.top : 0, transformOrigin: card?.origin, width: CARD_W }),
          }}
          className={(mobile
            ? "fixed inset-x-0 bottom-0 z-[70] max-h-[46vh] overflow-y-auto rounded-t-2xl border-t border-border bg-bg p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-pop outline-none"
            : "fixed z-[70] rounded-[16px] border border-border bg-bg p-5 shadow-pop outline-none") + (shown ? "" : " pointer-events-none")}
        >
          <div className="flex items-start gap-2">
            <p className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
              {step.moment && (
                <span className="inline-flex flex-none items-center gap-1 rounded-full bg-[var(--pointer)] px-2 py-[3px] normal-case tracking-normal text-[var(--pointer-edge)]">
                  <Clock className="size-3" aria-hidden />{step.moment}
                </span>
              )}
              <span className="truncate">{CHAPTERS[step.chapter].title}</span>
            </p>
            <button type="button" onClick={toggleAuto} aria-pressed={auto} aria-label={auto ? T.autoOff : T.autoOn} title={auto ? T.autoOff : T.autoOn}
              className="-mt-1.5 ml-auto grid size-8 flex-none place-items-center rounded-full text-muted hover:bg-hover hover:text-fg">
              {auto ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
            </button>
            <button type="button" onClick={close} aria-label={T.close} title={T.close} className="-mr-2 -mt-1.5 grid size-8 flex-none place-items-center rounded-full text-muted hover:bg-hover hover:text-fg">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <h2 id="tour-title" className="mt-1 text-balance text-[17px] font-bold leading-snug tracking-[-0.02em]">{step.title}</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{step.body}</p>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-border" role="progressbar" aria-label={T.progress} aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={n}>
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[13px] tabular-nums text-muted" aria-live="polite">{T.count(n, STEPS.length)}</span>
            <button type="button" onClick={() => go(n - 1)} disabled={n === 1} className={`${btn("ghost", "sm")} ml-auto disabled:opacity-40`}>
              <ArrowLeft aria-hidden /> {T.back}
            </button>
            <button type="button" onClick={() => go(n + 1)} className={btn("primary", "sm")}>
              {n === STEPS.length ? T.finish : T.next} <ArrowRight aria-hidden />
            </button>
          </div>
        </div>
      )}

      {showResume && (
        <button type="button" onClick={resume} className={`${btn("primary")} fixed bottom-5 right-5 z-50 h-10 rounded-full px-4 shadow-pop`}>
          <Play aria-hidden /> {T.resume}
        </button>
      )}
    </>
  );
}
