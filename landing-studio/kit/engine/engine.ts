/**
 * landing-studio · motion engine (implements kit CONTRACT.md).
 *
 *   const unmount = mountMotion({ breakpoint: 820 });
 *
 * One shared IntersectionObserver for reveals, one for [data-watch], one passive scroll listener,
 * one requestAnimationFrame loop that parks as soon as every scene has settled. Geometry is
 * measured once (and again on debounced resize, fonts.ready, load), never inside a frame.
 * Every style write goes through `write()`, which skips values that did not change.
 *
 * Scene children are driven by handlers keyed on an attribute. Built in: data-beat, data-pour,
 * data-deal, data-bar. Page level: data-px (parallax, --py) and data-watch=hero (--hx, --mx, --my). Add your own BEFORE the engine mounts (module top level of the scene file):
 *
 *   registerSceneHandler("data-orbit", (scene, items, env) => {
 *     const k = env.num(scene.dataset.orbitTurns, 1);
 *     return (f) => items.forEach((el, i) => f.write(el, "--a", fx(f.p * k + i / items.length)));
 *   });
 *
 * Without JS, under reduced motion, or after the boot failsafe (html.ls-static), the page is the
 * finished static document: the CSS gates every hidden state on html.js:not(.rm).
 */
import { back, easeOut, fx, inout, inView, JUMP_VH, seg, SETTLE, smoothProgress, smootherstep, trackProgress } from "./math";

export { fx } from "./math";

/* ------------------------------------------------------------------ types */

export type MotionOptions = {
  /** px; `wide` (px parallax, deal drop height) at and above this width. Default 820 */
  breakpoint?: number;
  /** ms smoothing constant for every scene; per scene `data-tau`. Default 80 */
  tau?: number;
  /** viewports; a progress gap bigger than this snaps instead of smoothing; per scene `data-jump`. Default 1.5 */
  jumpVh?: number;
  /** progress difference under which smoothing snaps onto the target. Default 0.0005 */
  settle?: number;
  /** viewports added around the viewport for `.live`. Default 0 (live = on screen) */
  liveMargin?: number;
  /** default parallax factor for `[data-px]` without a value. Default 0.07 */
  px?: number;
  /** rootMargin of the [data-watch] observer. Default "0px" */
  watchMargin?: string;
  /** where to look for attributes. Default document */
  root?: ParentNode;
};

const DEFAULTS = { breakpoint: 820, tau: 80, jumpVh: JUMP_VH, settle: SETTLE, liveMargin: 0, px: 0.07, watchMargin: "0px" };

export type Frame = {
  /** smoothed progress of this scene, 0..1 */
  p: number;
  scene: HTMLElement;
  y: number;
  vh: number;
  vw: number;
  wide: boolean;
  write: typeof write;
};
export type SceneUpdate = (f: Frame) => void;
export type Env = { opts: Required<Omit<MotionOptions, "root">>; num: typeof num };
/** Called once per scene that contains `[attr]` children; returns the per-frame update. */
export type SceneHandler = (scene: HTMLElement, items: HTMLElement[], env: Env) => SceneUpdate | void;

/* ---------------------------------------------------------------- helpers */

const cache = new WeakMap<HTMLElement, Record<string, string>>();
/** Deduped style write. `prop` is a CSS property or custom property name (kebab case). */
export function write(el: HTMLElement, prop: string, value: string): void {
  let c = cache.get(el);
  if (!c) cache.set(el, (c = {}));
  if (c[prop] === value) return;
  c[prop] = value;
  el.style.setProperty(prop, value);
}

/** Number from a data attribute string, with a fallback for missing or invalid values. */
export function num(v: string | undefined | null, d: number): number {
  if (v == null || v.trim() === "") return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
/** item's own data attribute first, then the scene's (camelCase dataset key). */
const inh = (el: HTMLElement, scene: HTMLElement, key: string, d: number) => num(el.dataset[key] ?? scene.dataset[key], d);

/* --------------------------------------------------------------- reveals */

const isProxied = (el: HTMLElement) => (el.dataset.rv === "clip" || el.dataset.rv === "wipe") && !!el.parentElement;
const proxyOf = new Map<Element, Set<HTMLElement>>();
let rio: IntersectionObserver | null = null;
let replayIo: IntersectionObserver | null = null;

/** Count-up: `data-count` (target), `data-suf`, `data-pre`, `data-ms` (default 1500). Decimals follow the target. */
export function countUp(el: HTMLElement): void {
  const raw = el.dataset.count ?? "";
  const to = Number(raw);
  if (!to || document.documentElement.classList.contains("rm")) return;
  const dec = raw.includes(".") ? raw.split(".")[1].length : 0;
  const pre = el.dataset.pre ?? "";
  const suf = el.dataset.suf ?? "";
  const ms = num(el.dataset.ms, 1500);
  const t0 = performance.now();
  let last = "";
  const step = (now: number) => {
    const k = easeOut((now - t0) / ms);
    const txt = pre + (to * k).toFixed(dec) + suf;
    if (txt !== last) el.textContent = last = txt;
    if (k < 1) requestAnimationFrame(step);
  };
  el.textContent = pre + (0).toFixed(dec) + suf;
  requestAnimationFrame(step);
}

function show(el: HTMLElement) {
  if (el.classList.contains("in")) return;
  el.classList.add("in");
  el.setAttribute("data-shown", "");
  if (el.dataset.count !== undefined) countUp(el);
}

function revealIo(): IntersectionObserver {
  return (rio ??= new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        const t = e.target as HTMLElement;
        rio!.unobserve(t);
        const set = proxyOf.get(t);
        if (set) {
          set.forEach(show);
          proxyOf.delete(t);
        }
        if ((t.dataset.rv !== undefined && !isProxied(t)) || t.dataset.count !== undefined) show(t);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
  ));
}

/* data-replay: runs on every entry, undoes itself once fully out. Two thresholds = hysteresis,
   so a trackpad parked on the edge cannot strobe it. */
function replayObserver(): IntersectionObserver {
  return (replayIo ??= new IntersectionObserver(
    (es) => {
      for (const e of es) {
        const t = e.target as HTMLElement;
        if (!e.isIntersecting) {
          t.classList.remove("in");
          t.removeAttribute("data-shown");
        } else if (e.intersectionRatio >= 0.35) show(t);
      }
    },
    { threshold: [0, 0.35] },
  ));
}

/** Observe one `[data-rv]` / `[data-count]` element (idempotent). Clip and wipe go through the parent. */
export function observeReveal(el: HTMLElement): void {
  if (typeof IntersectionObserver === "undefined") return show(el);
  if (el.hasAttribute("data-replay")) return replayObserver().observe(el);
  if (el.classList.contains("in")) return;
  if (isProxied(el)) {
    const p = el.parentElement!;
    let s = proxyOf.get(p);
    if (!s) proxyOf.set(p, (s = new Set()));
    s.add(el);
    revealIo().observe(p);
  } else revealIo().observe(el);
}

export function unobserveReveal(el: HTMLElement): void {
  replayIo?.unobserve(el);
  if (!rio) return;
  if (isProxied(el)) {
    const p = el.parentElement!;
    const s = proxyOf.get(p);
    s?.delete(el);
    if (s && !s.size) proxyOf.delete(p);
    if (!s?.size && !(p as HTMLElement).dataset?.rv) rio.unobserve(p);
  } else rio.unobserve(el);
}

/* ------------------------------------------------------- scene handlers */

/**
 * `[data-beat][data-a][data-b]`: fades/rises in over [a, a+in], out over [b-out, b] (none with data-last;
 * a beat with a <= 0 starts visible). Optional `[data-sub]` children step in across the beat.
 * Params (on the beat or the scene): data-beat-in .07, data-beat-out .06, data-beat-y 46 (px),
 * data-sub-in .05, data-sub-x 18 (px), data-sub-from .08 (resting opacity).
 */
export const beats: SceneHandler = (scene, items) => {
  const bs = items.map((el) => ({
    el,
    a: num(el.dataset.a, 0),
    b: num(el.dataset.b, 1),
    last: el.dataset.last !== undefined,
    win: inh(el, scene, "beatIn", 0.07),
    wout: inh(el, scene, "beatOut", 0.06),
    y: inh(el, scene, "beatY", 46),
    subs: Array.from(el.querySelectorAll<HTMLElement>("[data-sub]")),
    sWin: inh(el, scene, "subIn", 0.05),
    sX: inh(el, scene, "subX", 18),
    sFrom: inh(el, scene, "subFrom", 0.08),
  }));
  return ({ p, write: w }) => {
    for (const b of bs) {
      const i = b.a <= 0 ? 1 : smootherstep(seg(p, b.a, b.a + b.win));
      const out = b.last ? 0 : smootherstep(seg(p, b.b - b.wout, b.b));
      const o = i * (1 - out);
      w(b.el, "opacity", fx(o, 3));
      w(b.el, "transform", `translate3d(0,${fx((1 - i) * b.y - out * b.y, 1)}px,0) scale(${fx(0.96 + 0.04 * i - out * 0.02)})`);
      w(b.el, "visibility", o < 0.01 ? "hidden" : "visible");
      const n = Math.max(1, b.subs.length);
      b.subs.forEach((sub, k) => {
        const start = b.a + 0.03 + (k * (b.b - b.a - 0.12)) / n;
        const q = easeOut(seg(p, start, start + b.sWin));
        w(sub, "opacity", fx(b.sFrom + (1 - b.sFrom) * q, 3));
        w(sub, "transform", `translate3d(${fx((1 - q) * b.sX, 1)}px,0,0)`);
      });
    }
  };
};

/**
 * `[data-pour=in|out][data-d]` columns: each slides from -dist% to 0 on an in-out curve.
 * data-d is normalised by the largest data-d in the scene (or data-pour-dmax). Scene params:
 * data-pour-in "start,spread" (0,0.1), data-pour-out "start,spread" (0.8,0.08), data-pour-len .12, data-pour-dist 101.
 */
export const pour: SceneHandler = (scene, items) => {
  const pair = (v: string | undefined, a: number, b: number) => {
    const [x, y] = (v ?? "").split(",");
    return [num(x, a), num(y, b)];
  };
  const [is, isp] = pair(scene.dataset.pourIn, 0, 0.1);
  const [os, osp] = pair(scene.dataset.pourOut, 0.8, 0.08);
  const len = num(scene.dataset.pourLen, 0.12);
  const dist = num(scene.dataset.pourDist, 101);
  const dmax = num(scene.dataset.pourDmax, Math.max(0, ...items.map((c) => num(c.dataset.d, 0)))) || 1;
  const cols = items.map((el) => {
    const dn = Math.min(1, num(el.dataset.d, 0) / dmax);
    return { el, a: el.dataset.pour === "out" ? os + dn * osp : is + dn * isp };
  });
  return ({ p, write: w }) => {
    for (const c of cols) w(c.el, "transform", `translate3d(0,${fx((inout(seg(p, c.a, c.a + len)) - 1) * dist, 1)}%,0)`);
  };
};

/**
 * `[data-deal=i]` cards drop in one after another and land rotated, pushing the ones below down;
 * `[data-deal-sh]` (a shadow) darkens as they land. Per card: data-a, data-b (window), data-r (landing deg);
 * defaults a = [0,.33,.66][i], b = a+.3, r = [-4,3,-1.5][i]. Scene params: data-deal-r0 18 (start deg),
 * data-deal-x 22 (start vw), data-deal-y .6 / data-deal-y-sm .4 (drop in vh, wide / narrow), data-deal-nudge 18 (px).
 */
export const deal: SceneHandler = (scene, items) => {
  const A = [0, 0.33, 0.66];
  const R = [-4, 3, -1.5];
  const n = items.length;
  const cards = items.map((el, idx) => {
    const i = num(el.dataset.deal, idx);
    const a = num(el.dataset.a, A[i] ?? i / n);
    return { el, a, b: num(el.dataset.b, Math.min(1, a + 0.3)), r: num(el.dataset.r, R[i] ?? 0) };
  });
  const sh = scene.querySelector<HTMLElement>("[data-deal-sh]");
  const r0 = num(scene.dataset.dealR0, 18);
  const x0 = num(scene.dataset.dealX, 22);
  const yW = num(scene.dataset.dealY, 0.6);
  const yN = num(scene.dataset.dealYSm, 0.4);
  const nudgePx = num(scene.dataset.dealNudge, 18);
  return ({ p, vh, wide, write: w }) => {
    let landed = 0;
    cards.forEach((c, i) => {
      const q = seg(p, c.a, c.b);
      const e = back(q);
      landed += easeOut(q);
      let nudge = 0;
      for (let j = i + 1; j < cards.length; j++) nudge += easeOut(seg(p, cards[j].a + (cards[j].b - cards[j].a) * 0.55, cards[j].b));
      const ty = (1 - e) * vh * (wide ? yW : yN) + nudge * nudgePx;
      const tx = (1 - e) * x0 - nudge * 1.4;
      const rot = r0 + (c.r - r0) * e;
      const sc = (0.9 + 0.1 * e) * Math.pow(0.97, nudge);
      w(c.el, "transform", `translate3d(${fx(tx, 1)}vw,${fx(ty, 1)}px,0) rotate(${fx(rot, 2)}deg) scale(${fx(sc)})`);
      w(c.el, "opacity", fx(Math.min(1, q * 5), 3));
    });
    if (sh) {
      w(sh, "opacity", fx(landed / Math.max(1, n), 3));
      w(sh, "transform", `scale(${fx(0.7 + 0.12 * landed, 3)})`);
    }
  };
};

/** `[data-bar]`: a progress bar, scaleX(p). */
export const bar: SceneHandler = (_scene, items) => ({ p, write: w }) => {
  for (const el of items) w(el, "transform", `scaleX(${fx(p)})`);
};

/**
 * `[data-px="0.07"]` parallax (page level, not a scene child): writes `--py` (px) from the element's
 * distance to the viewport centre; 0px below the breakpoint. Apply it in CSS with `translate: 0 var(--py)`.
 */
export function px(items: HTMLElement[], k: number) {
  const xs = items.map((el) => ({ el, k: num(el.dataset.px, k), c: 0, py: 0 }));
  return {
    measure(y: number) {
      for (const x of xs) {
        const r = x.el.getBoundingClientRect();
        x.c = r.top + y + r.height / 2 - x.py; // minus the parallax already applied
      }
    },
    update(y: number, vh: number, wide: boolean) {
      for (const x of xs) {
        x.py = wide ? Number(fx((x.c - (y + vh / 2)) * -x.k, 1)) : 0;
        write(x.el, "--py", x.py + "px");
      }
    },
  };
}

/**
 * `[data-watch=hero]` (page level, not a scene child): writes `--hx` = clamp(scrollY / (vh x .8)), the hero's
 * scroll retreat 0..1, on every scroll frame; and, at and above the breakpoint on a fine hover pointer, the
 * pointer position `--mx` / `--my` in [-1, 1] from the viewport centre, rAF-throttled. Off on touch and under
 * html.rm (the vars stay unset; CSS reads them with a 0 fallback). Pointer writes skip while html.paused.
 */
export function hero(items: HTMLElement[]) {
  let mx = 0, my = 0, praf = 0, wide = false;
  const fine = typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;
  const html = document.documentElement;
  const flush = () => {
    praf = 0;
    for (const el of items) {
      write(el, "--mx", fx(mx, 3));
      write(el, "--my", fx(my, 3));
    }
  };
  const onMove = (e: PointerEvent) => {
    if (!wide || e.pointerType === "touch" || html.classList.contains("paused")) return;
    mx = Math.max(-1, Math.min(1, (e.clientX / innerWidth) * 2 - 1));
    my = Math.max(-1, Math.min(1, (e.clientY / innerHeight) * 2 - 1));
    if (!praf) praf = requestAnimationFrame(flush);
  };
  const on = fine && items.length > 0;
  if (on) addEventListener("pointermove", onMove, { passive: true });
  return {
    update(y: number, vh: number, w: boolean) {
      if (wide && !w) {
        mx = my = 0;
        flush();
      }
      wide = w;
      const hx = fx(Math.max(0, Math.min(1, y / Math.max(1, vh * 0.8))), 3);
      for (const el of items) write(el, "--hx", hx);
    },
    off() {
      if (on) removeEventListener("pointermove", onMove);
      cancelAnimationFrame(praf);
    },
  };
}

const handlers = new Map<string, SceneHandler>([
  ["data-beat", beats],
  ["data-pour", pour],
  ["data-deal", deal],
  ["data-bar", bar],
]);
let attachActive: ((attr: string, fn: SceneHandler) => void) | null = null;

/** Add a scene child handler. Call at module top level so it exists before mountMotion runs. */
export function registerSceneHandler(attr: string, fn: SceneHandler): void {
  handlers.set(attr, fn);
  attachActive?.(attr, fn);
}

/* ----------------------------------------------------------------- mount */

type Scene = {
  el: HTMLElement;
  stage: Element | null;
  top: number;
  h: number;
  span: number;
  p: number;
  live: boolean;
  tau: number;
  jump: number;
  upd: SceneUpdate[];
  attrs: Set<string>;
};

export function mountMotion(options: MotionOptions = {}): () => void {
  if (typeof window === "undefined") return () => {};
  const { root: scope = document, ...rest } = options;
  const o = { ...DEFAULTS } as Env["opts"];
  for (const [k, v] of Object.entries(rest)) if (v !== undefined) (o as Record<string, unknown>)[k] = v; // undefined keeps the default
  const html = document.documentElement;
  if (html.classList.contains("ls-static")) return () => {}; // boot failsafe already gave up on motion
  const rm = html.classList.contains("rm");
  html.classList.add("mo");
  const env: Env = { opts: o, num };
  const q = <T extends Element = HTMLElement>(s: string) => Array.from(scope.querySelectorAll<HTMLElement>(s)) as unknown as T[];

  /* reveals and count-ups */
  const rv = q("[data-rv],[data-count]");
  rv.forEach(observeReveal);

  /* loops: pause anything under [data-watch] while it is off screen */
  const wio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("off", !e.isIntersecting)), {
    rootMargin: o.watchMargin,
  });
  q("[data-watch]").forEach((el) => wio.observe(el));
  const offBase = () => {
    rv.forEach(unobserveReveal);
    wio.disconnect();
  };

  const sceneEls = q("[data-scene]");
  if (rm) {
    sceneEls.forEach((el) => write(el, "--p", "1")); // reduced motion = final state
    html.classList.add("ls-ready");
    return offBase;
  }

  const scenes: Scene[] = sceneEls.map((el) => ({
    el,
    stage: el.querySelector(":scope > .ls-stage") ?? el.firstElementChild,
    top: 0,
    h: 0,
    span: 0,
    p: -1,
    live: false,
    tau: num(el.dataset.tau, o.tau),
    jump: num(el.dataset.jump, o.jumpVh),
    upd: [],
    attrs: new Set(),
  }));
  const pxs = px(q("[data-px]"), o.px);
  const heroes = hero(q('[data-watch="hero"]'));
  let vh = innerHeight;
  let vw = innerWidth;
  let wide = vw >= o.breakpoint;
  let raf = 0;
  let last = 0;
  const F: Frame = { p: 0, scene: html, y: 0, vh, vw, wide, write };

  const frame = (now: number) => {
    raf = 0;
    const y = scrollY;
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    let moving = false;
    F.y = y;
    F.vh = vh;
    F.vw = vw;
    F.wide = wide;
    for (const s of scenes) {
      const target = trackProgress(y, s.top, s.span);
      const p = smoothProgress(s.p, target, dt, s.tau, Math.max(1, s.span), vh, s.jump, o.settle);
      if (p !== target) moving = true;
      const live = inView(y, s.top, s.h, vh, o.liveMargin);
      if (live !== s.live) {
        s.el.classList.toggle("live", live);
        s.live = live;
      }
      if (p === s.p) continue;
      s.p = p;
      write(s.el, "--p", fx(p));
      F.p = p;
      F.scene = s.el;
      for (const u of s.upd) u(F);
    }
    pxs.update(y, vh, wide);
    heroes.update(y, vh, wide);
    if (moving) raf = requestAnimationFrame(frame);
    else last = 0; // parked until the next scroll
  };

  const measure = () => {
    vh = innerHeight;
    vw = innerWidth;
    wide = vw >= o.breakpoint;
    const y = scrollY;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      s.top = r.top + y;
      s.h = r.height;
      s.span = Math.max(0, s.h - (s.stage instanceof HTMLElement ? s.stage.offsetHeight : vh));
      s.p = -1;
    }
    pxs.measure(y);
    cancelAnimationFrame(raf);
    last = 0;
    frame(performance.now());
  };

  const attach = (attr: string, fn: SceneHandler) => {
    for (const s of scenes) {
      if (s.attrs.has(attr)) continue;
      const items = Array.from(s.el.querySelectorAll<HTMLElement>(`[${attr}]`));
      if (!items.length) continue;
      s.attrs.add(attr);
      const u = fn(s.el, items, env);
      if (u) s.upd.push(u);
      s.p = -1;
    }
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = window.setTimeout(measure, 120);
  };
  let alive = true;
  const onFonts = () => alive && measure();

  try {
    handlers.forEach((fn, attr) => attach(attr, fn));
    attachActive = attach;
    measure();
    html.classList.add("ls-ready");
  } catch (err) {
    // a failed setup must leave the finished static page, never a blank one
    html.classList.remove("js");
    html.classList.add("ls-static");
    cancelAnimationFrame(raf);
    heroes.off();
    offBase();
    console.error(err);
    return () => {};
  }
  document.fonts?.ready.then(onFonts).catch(() => {});
  addEventListener("load", measure);
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);

  return () => {
    alive = false;
    if (attachActive === attach) attachActive = null;
    offBase();
    heroes.off();
    cancelAnimationFrame(raf);
    clearTimeout(rt);
    removeEventListener("load", measure);
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onResize);
  };
}
