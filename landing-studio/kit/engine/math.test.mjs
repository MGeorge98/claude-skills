// node kit/engine/math.test.mjs  (Node 22.13+: uses node:module stripTypeScriptTypes, no deps,
// and works wherever the kit sits, whatever the nearest package.json says about "type")
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const src = stripTypeScriptTypes(readFileSync(new URL("./math.ts", import.meta.url), "utf8"));
const { clamp, seg, lerpK, expK, smoothProgress, trackProgress, inView, easeOut, inout, back, smootherstep, fx, FRAME_MS } =
  await import("data:text/javascript;base64," + Buffer.from(src).toString("base64"));

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok", name); };
const close = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} != ${b}`);

t("clamp", () => { assert.equal(clamp(-1), 0); assert.equal(clamp(2), 1); assert.equal(clamp(5, 0, 10), 5); });
t("seg windows", () => {
  assert.equal(seg(0.1, 0.2, 0.4), 0);
  close(seg(0.3, 0.2, 0.4), 0.5);
  assert.equal(seg(0.5, 0.2, 0.4), 1);
  assert.equal(seg(0.5, 0.5, 0.5), 1); // zero width window does not divide by zero
});
t("lerpK is frame rate independent", () => {
  close(lerpK(0.2, FRAME_MS), 0.2);
  const one60 = lerpK(0.2, FRAME_MS * 2);
  const two120 = 1 - (1 - lerpK(0.2, FRAME_MS)) ** 2;
  close(one60, two120);
  close(1 - (1 - expK(8, 80)) ** 2, expK(16, 80));
});
t("easings hit their ends", () => {
  for (const f of [easeOut, inout, back, smootherstep]) { close(f(0), 0); close(f(1), 1); }
  assert.ok(Math.max(...Array.from({ length: 99 }, (_, i) => back(i / 100))) > 1, "back overshoots");
});
t("smoothing: unknown prev snaps", () => assert.equal(smoothProgress(-1, 0.4, 16, 80, 1000, 800), 0.4));
t("smoothing: moves toward target, not onto it", () => {
  const p = smoothProgress(0.2, 0.3, 16, 80, 1000, 800);
  assert.ok(p > 0.2 && p < 0.3);
});
t("smoothing: settles exactly on target", () => {
  let p = 0, frames = 0;
  while (p !== 0.5 && frames < 1000) { p = smoothProgress(p, 0.5, 16, 80, 1000, 800); frames++; }
  assert.equal(p, 0.5);
  assert.ok(frames < 60, `settled in ${frames} frames`);
});
t("smoothing: jumps over 1.5vh snap", () => {
  // run 4000px, vh 800: a 0.31 gap is 1240px (< 1200? no, 1240 > 1200) => snap
  assert.equal(smoothProgress(0, 0.31, 16, 80, 4000, 800), 0.31);
  assert.notEqual(smoothProgress(0, 0.29, 16, 80, 4000, 800), 0.29);
  assert.equal(smoothProgress(0, 0.29, 16, 80, 4000, 800, 1), 0.29); // custom jump threshold
});
t("trackProgress + inView", () => {
  assert.equal(trackProgress(500, 1000, 2000), 0);
  close(trackProgress(2000, 1000, 2000), 0.5);
  assert.equal(trackProgress(9000, 1000, 2000), 1);
  assert.equal(trackProgress(1200, 1000, 0), 0);
  assert.equal(inView(0, 900, 100, 800), false);
  assert.equal(inView(0, 700, 100, 800), true);
  assert.equal(inView(0, 900, 100, 800, 0.5), true);
});
t("fx never writes -0", () => { assert.equal(fx(-0.00001), "0.0000"); assert.equal(fx(0.5, 2), "0.50"); });
console.log(`\n${n} passed`);
