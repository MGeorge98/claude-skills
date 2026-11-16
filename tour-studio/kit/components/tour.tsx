"use client";

// Tour engine: spotlight + popover (bottom sheet on phones), step in the URL, keys, reduced motion, resume button.
// Product-agnostic: content comes from lib/tour.ts, words from lib/tour-strings.ts. Mount once in app/layout.tsx inside <Suspense>.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play, SlidersHorizontal, X } from "lucide-react";
import { CHAPTERS, FINAL_ROUTE, STEPS, STEP_PARAM, stepHref } from "@/lib/tour";
import { T } from "@/lib/tour-strings";
import { btn } from "@/components/tour-ui";

type Box = { x: number; y: number; w: number; h: number };
const PAD = 6; // breathing room around the target
const TOP = 72; // where a scrolled target lands: just under the sticky header, which MUST stay ONE 56px row on phones too (hide secondary items, scroll the tabs). Match the demo header.
// Any other floating button (chat, help, resume) must hide while a step is active, or it lands inside the spotlight.
const PHONE = 640; // below this width the popover becomes a bottom sheet
const SAVED = "tour-step"; // sessionStorage key for the resume button
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));

/** Rounded hole in a full-screen rect (even-odd), so the dim layer blocks clicks everywhere except the target.
 *  Always the same command list, so framer-motion can tween `d` between steps. */
const holePath = (b: Box, vw: number, vh: number, r = 12) =>
  `M0 0H${vw}V${vh}H0Z M${b.x + r} ${b.y}H${b.x + b.w - r}A${r} ${r} 0 0 1 ${b.x + b.w} ${b.y + r}V${b.y + b.h - r}A${r} ${r} 0 0 1 ${b.x + b.w - r} ${b.y + b.h}H${b.x + r}A${r} ${r} 0 0 1 ${b.x} ${b.y + b.h - r}V${b.y + r}A${r} ${r} 0 0 1 ${b.x + r} ${b.y}Z`;

/** Popover beside the target, never over it: below, above, right, left, else the bottom-right corner. */
function place(b: Box, w: number, h: number, vw: number, vh: number) {
  const g = 14, m = 12, left = clamp(b.w > 2 * w ? b.x + b.w - w : b.x, m, vw - w - m), top = clamp(b.y, 64, vh - h - m);
  if (b.y + b.h + g + h <= vh - m) return { left, top: b.y + b.h + g };
  if (b.y - g - h >= 64) return { left, top: b.y - g - h };
  if (b.x + b.w + g + w <= vw - m) return { left: b.x + b.w + g, top };
  if (b.x - g - w >= m) return { left: b.x - g - w, top };
  return { left: vw - w - m, top: vh - h - m };
}

export function Tour() {
  const params = useSearchParams(), pathname = usePathname(), router = useRouter();
  const reduce = !!useReducedMotion();
  const n = Number(params.get(STEP_PARAM)) || 0;
  const step = STEPS[n - 1];
  const [box, setBox] = useState<Box | null>(null);
  const [view, setView] = useState({ vw: 0, vh: 0 });
  const [instant, setInstant] = useState(false);
  const [pending, setPending] = useState(true);
  const [size, setSize] = useState({ w: 380, h: 240 });
  const pop = useRef<HTMLDivElement>(null);
  const mobile = view.vw > 0 && view.vw < PHONE;

  const go = useCallback((i: number) => {
    if (i < 1) return;
    if (i > STEPS.length) return router.push(FINAL_ROUTE);
    if (STEPS[i - 1].route === pathname) router.replace(stepHref(i), { scroll: false });
    else router.push(stepHref(i)); // a new page starts at its top
  }, [pathname, router]);
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  // Find the target on its route, scroll only as much as needed, wait for the scroll to settle, then light it up.
  useEffect(() => {
    if (!step) { document.body.style.paddingBottom = ""; return setBox(null); }
    if (step.route !== pathname) return;
    try { sessionStorage.setItem(SAVED, String(n)); } catch {}
    // Phones: room under the page so a target near the bottom can still scroll above the sheet.
    document.body.style.paddingBottom = innerWidth < PHONE ? "45vh" : "";
    setPending(true);
    let el: HTMLElement | null = null, raf = 0, ready = false, still = 0, last = NaN;
    const t0 = performance.now();
    const measure = (inst: boolean) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      // clientWidth, not innerWidth: innerWidth includes the scrollbar and the popover would sit on it.
      setView({ vw: document.documentElement.clientWidth, vh: innerHeight });
      setInstant(inst);
      setBox({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 });
    };
    const settle = () => {
      const y = el!.getBoundingClientRect().top;
      still = Math.abs(y - last) < 0.5 ? still + 1 : 0;
      last = y;
      measure(false); // the spotlight chases the target while the page scrolls
      if (still >= 5 || performance.now() - t0 > 2500) { ready = true; setPending(false); }
      else raf = requestAnimationFrame(settle);
    };
    const find = () => {
      el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!el) {
        if (performance.now() - t0 < 3000) raf = requestAnimationFrame(find);
        else console.warn(`[tour] no [data-tour="${step.target}"] on ${pathname}`);
        return;
      }
      ro.observe(el);
      const r = el.getBoundingClientRect();
      // Fully in view (phones: above the sheet) stays put; below the fold moves up just enough; too tall aligns its top.
      const bottom = innerHeight * (innerWidth < PHONE ? 0.55 : 1) - 16;
      const dy = r.top < TOP || r.height > bottom - TOP ? r.top - TOP : r.bottom > bottom ? r.bottom - bottom : 0;
      if (Math.abs(dy) > 1) scrollTo({ top: scrollY + dy, behavior: reduce ? "auto" : "smooth" });
      raf = requestAnimationFrame(settle);
    };
    const onMove = () => ready && measure(true);
    const ro = new ResizeObserver(onMove);
    find();
    addEventListener("scroll", onMove, { passive: true });
    addEventListener("resize", onMove);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener("scroll", onMove); removeEventListener("resize", onMove); };
  }, [step, n, pathname, reduce]);

  useLayoutEffect(() => {
    if (pop.current) setSize({ w: pop.current.offsetWidth, h: pop.current.offsetHeight });
  }, [box, mobile]);
  useEffect(() => { if (!pending) pop.current?.focus({ preventScroll: true }); }, [pending, n]);

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

  if (!step) {
    if (pathname === "/" || pathname === FINAL_ROUTE) return null;
    const resume = () => {
      // The last step seen if it is on this page, else this page's first step, else the last step seen.
      let saved = 0;
      try { saved = Number(sessionStorage.getItem(SAVED)) || 0; } catch {}
      go(STEPS[saved - 1]?.route === pathname ? saved : STEPS.findIndex((s) => s.route === pathname) + 1 || saved || 1);
    };
    return (
      <button type="button" onClick={resume} className={`${btn("primary")} fixed bottom-5 right-5 z-50 h-10 rounded-full px-4 shadow-pop`}>
        <Play aria-hidden /> {T.resume}
      </button>
    );
  }

  // Ease-out tween, not a spring: a spring overshoots and the cut-out path folds over itself.
  const tween = instant || reduce ? { duration: 0 } : { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const };
  const pos = box && !mobile ? place(box, size.w, size.h, view.vw, view.vh) : null;
  const pct = (n / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {box && (
        <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
          <svg className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden>
            <motion.path className="pointer-events-auto" fill="rgba(15,23,42,0.5)" fillRule="evenodd" initial={false} animate={{ d: holePath(box, view.vw, view.vh) }} transition={tween} />
            <motion.rect fill="none" stroke="var(--accent-fg)" strokeWidth={2} rx={12} initial={false} animate={{ x: box.x, y: box.y, width: box.w, height: box.h }} transition={tween} />
          </svg>
          <motion.div
            ref={pop}
            role="dialog"
            aria-modal="false"
            aria-labelledby="tour-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: reduce ? 0 : 8, ...(pos ?? {}) }}
            animate={{ opacity: pending ? 0 : 1, y: 0, ...(pos ?? {}) }}
            transition={pos && !reduce && !instant ? { ...tween, opacity: { duration: 0.2 } } : { duration: 0, opacity: { duration: reduce ? 0 : 0.2 } }}
            className={mobile
              ? "fixed inset-x-0 bottom-0 z-[70] max-h-[46vh] overflow-y-auto rounded-t-2xl border-t border-border bg-bg p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-pop outline-none"
              : "fixed left-0 top-0 z-[70] w-[380px] rounded-xl border border-border bg-bg p-5 shadow-pop outline-none"}
          >
            <div className="flex items-start gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">{T.chapter(step.chapter + 1, CHAPTERS[step.chapter].title)}</p>
              <button type="button" onClick={close} aria-label={T.close} className="-mr-2 -mt-1.5 ml-auto grid size-8 flex-none place-items-center rounded text-muted hover:bg-hover hover:text-fg">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <h2 id="tour-title" className="mt-1 text-[17px] font-semibold leading-snug tracking-tight">{step.title}</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{step.body}</p>
            {step.adaptable && (
              <p className="mt-3 flex gap-2 rounded-md bg-accent-soft px-3 py-2 text-[13px] text-accent-text">
                <SlidersHorizontal className="mt-0.5 size-3.5 flex-none" aria-hidden />
                <span><span className="font-medium">{T.adaptable}</span> {step.adaptable}</span>
              </p>
            )}
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-border" role="progressbar" aria-label={T.progress} aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={n}>
              <motion.div className="h-full rounded-full bg-accent" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: reduce ? 0 : 0.3 }} />
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
