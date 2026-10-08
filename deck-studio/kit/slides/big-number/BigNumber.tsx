import { useEffect, useRef } from "react";
import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./big-number.css";

export type BigNumberData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the number; must come from a verified facts.md line */
  value: number;
  /** text in front of the number, e.g. "+" or "~" */
  pre?: string;
  /** text after the number, e.g. "%" or "x" */
  suf?: string;
  /** digits after the decimal comma; the count-up follows it */
  decimals?: number;
  /** what the number counts, smaller, beside it: "ore", "lei", "clienți" */
  unit?: string;
  /** what the number means, h2 size */
  meaning: string;
  /** mono source note, e.g. "sursa: facts.md F-012" */
  note?: string;
  /** everything at step 0, no count-up */
  immediate?: boolean;
};

export const steps = (d: BigNumberData) => (d.immediate ? 0 : 1);

const COUNT_MS = 1500;

/** Romanian decimal comma, no grouping, so the text is stable and the final value is exact. */
export const format = (v: number, decimals = 0, pre = "", suf = "") => pre + v.toFixed(decimals).replace(".", ",") + suf;

export default function BigNumber({ data }: SlideProps<BigNumberData>) {
  const root = useRef<HTMLDivElement>(null);
  const { value, pre = "", suf = "", decimals = 0, immediate } = data;
  const final = format(value, decimals, pre, suf);

  /* count 0 -> value when the number's <Step> gains .in; the final text is what the server renders,
     what reduced motion, print and the no-JS document show, and what we restore on leaving the step. */
  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(".big-number-num");
    const val = el?.querySelector<HTMLElement>(".big-number-val");
    if (!el || !val || immediate) return;
    let raf = 0;
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const run = () => {
      stop();
      const h = document.documentElement;
      if (h.classList.contains("rm") || h.classList.contains("print") || h.classList.contains("deck-static")) {
        val.textContent = final;
        return;
      }
      const t0 = performance.now();
      val.textContent = format(0, decimals, pre, suf);
      const tick = (now: number) => {
        const p = Math.max(0, Math.min(1, (now - t0) / COUNT_MS));
        const e = 1 - Math.pow(1 - p, 3);
        val.textContent = p >= 1 ? final : format(value * e, decimals, pre, suf);
        raf = p >= 1 ? 0 : requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    let was = el.classList.contains("in");
    const mo = new MutationObserver(() => {
      const now = el.classList.contains("in");
      if (now === was) return;
      was = now;
      if (now) run();
      else {
        stop();
        val.textContent = final;
      }
    });
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      stop();
    };
  }, [value, pre, suf, decimals, immediate, final]);

  const at = data.immediate ? 0 : 1;
  return (
    <div className="big-number-root" ref={root}>
      {data.kicker ? (
        <Step at={0} as="p" className="big-number-kicker">
          {data.kicker}
        </Step>
      ) : null}
      <Step at={at} as="div" className="big-number-num">
        <span className="big-number-val">{final}</span>
        {data.unit ? <span className="big-number-unit">{data.unit}</span> : null}
      </Step>
      <Step at={at} i={1} as="h2" className="big-number-meaning">
        {data.meaning}
      </Step>
      {data.note ? (
        <Step at={at} i={2} as="p" className="big-number-note">
          {data.note}
        </Step>
      ) : null}
    </div>
  );
}
