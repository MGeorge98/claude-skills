/**
 * landing-studio · pure motion math. No DOM, no state: everything here is testable with
 * `node kit/engine/math.test.mjs` (Node 22.18+ strips the types natively).
 *
 * Three properties the engine rests on:
 *  1. Frame rate independence: the same scroll settles along the same curve in the same
 *     wall clock time at 60, 120 and 144 Hz (lerpK, expK).
 *  2. Exact settling: smoothed values land bit for bit on the target, so a page at rest
 *     writes nothing and the loop can park.
 *  3. Jumps snap: an anchor link or End key does not replay every scene in between.
 */

export const clamp = (v: number, a = 0, b = 1): number => (v < a ? a : v > b ? b : v);

/** Progress of p through the window [a, b], clamped to 0..1. */
export const seg = (p: number, a: number, b: number): number => (b === a ? (p >= b ? 1 : 0) : clamp((p - a) / (b - a)));

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** The reference frame per-frame constants are tuned at. */
export const FRAME_MS = 1000 / 60;

/** A per-frame lerp factor k tuned at 60 Hz, corrected for the real frame time dt (ms). */
export const lerpK = (k: number, dt: number): number => 1 - Math.pow(1 - k, dt / FRAME_MS);

/** The same thing written as a time constant: share of the gap closed in dt ms with constant tau ms. */
export const expK = (dt: number, tau: number): number => 1 - Math.exp(-dt / Math.max(1, tau));

/* ---- easing family: one ease-out, one in-out, one spring-like overshoot ---- */
/** cubic ease-out, the JS twin of --ls-ease */
export const easeOut = (t: number): number => 1 - Math.pow(1 - clamp(t), 3);
/** cubic in-out, the JS twin of --ls-inout */
export const inout = (t: number): number => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** ease-out back: lands with a small overshoot, the JS twin of --ls-spring */
export const back = (t: number): number => {
  const x = clamp(t);
  return 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
};
/** Perlin smootherstep: zero velocity and acceleration at both ends (beat hand-overs without a kink). */
export const smootherstep = (t: number): number => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** Default settle threshold for progress (0..1 space). */
export const SETTLE = 0.0005;
/** Default jump threshold in viewports. */
export const JUMP_VH = 1.5;

/**
 * One smoothing step of a scene's progress.
 *  - prev < 0 means "unknown" (first frame or after a measure): snap.
 *  - a gap larger than jumpVh viewports (gap * run px) snaps.
 *  - otherwise p += (target - p) * (1 - exp(-dt / tau)), and snaps once within `settle`.
 * Returns the new progress; it equals `target` exactly when settled.
 */
export function smoothProgress(
  prev: number,
  target: number,
  dt: number,
  tau: number,
  run: number,
  vh: number,
  jumpVh = JUMP_VH,
  settle = SETTLE,
): number {
  if (prev < 0 || tau <= 0) return target;
  if (Math.abs(target - prev) * run > jumpVh * vh) return target;
  const p = prev + (target - prev) * expK(dt, tau);
  return Math.abs(target - p) < settle ? target : p;
}

/**
 * Raw progress of a pinned track: 0 when the stage sticks to the top, 1 when the track ends.
 * top = track top in document px, span = track height - stage height.
 */
export const trackProgress = (y: number, top: number, span: number): number => (span > 0 ? clamp((y - top) / span) : 0);

/** Whether [top, top + h] (document px) intersects the viewport, grown by `margin` viewports. */
export const inView = (y: number, top: number, h: number, vh: number, margin = 0): boolean =>
  top + h > y - margin * vh && top < y + vh * (1 + margin);

/** Fixed-decimal string for CSS writes; dedupe compares these strings. */
export const fx = (v: number, d = 4): string => {
  const s = v.toFixed(d);
  return s === "-0" || /^-0\.0+$/.test(s) ? s.slice(1) : s;
};
