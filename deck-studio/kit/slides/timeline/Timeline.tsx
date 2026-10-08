import Step from "@/kit/react/Step";
import type { CSSProperties } from "react";
import type { SlideProps } from "@/kit/react/Slide";
import "./timeline.css";

export type TimelineMoment = {
  /** mono, uppercase, e.g. "Luna 1" */
  label: string;
  /** the moment in a few words */
  title: string;
  /** an optional line under the title, one short sentence */
  line?: string;
};

export type TimelineData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point, visible from step 0 */
  point: string;
  /** 3 to 7 moments, one per step, left to right */
  moments: TimelineMoment[];
  /** the last moment is larger and in the accent colour (default true) */
  hero?: boolean;
};

export const steps = (d: TimelineData) => d.moments.length;

/* The row is 1920 - 2 x 112 = 1696 px wide; columns are sized here so each segment can reach back to the
   previous dot. These numbers are layout only: they never depend on the step. */
const ROW = 1696;
const GAP = 24;
const HERO_WEIGHT = 1.35;

export default function Timeline({ data }: SlideProps<TimelineData>) {
  const ms = data.moments;
  const n = ms.length;
  const hero = data.hero !== false;
  const weights = ms.map((_, k) => (hero && k === n - 1 ? HERO_WEIGHT : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  const usable = ROW - GAP * (n - 1);
  const widths = weights.map((w) => (usable * w) / total);
  return (
    <div className="timeline-root" data-size={n > 5 ? "sm" : "md"}>
      {data.kicker ? (
        <Step at={0} as="p" className="timeline-kicker">
          {data.kicker}
        </Step>
      ) : null}
      <Step at={0} i={data.kicker ? 1 : 0} as="h2" className="timeline-point">
        {data.point}
      </Step>
      <div className="timeline-body">
        <div className="timeline-row" style={{ gap: GAP }}>
          <div
            className="timeline-rail"
            aria-hidden="true"
            style={{ left: widths[0] / 2, right: widths[n - 1] / 2 }}
          />
          {ms.map((m, k) => {
            const isHero = hero && k === n - 1;
            const at = k + 1;
            const segStyle: CSSProperties =
              k > 0
                ? { left: -(GAP + widths[k - 1] / 2), width: GAP + widths[k - 1] / 2 + widths[k] / 2 }
                : {};
            return (
              <div
                key={k}
                className={isHero ? "timeline-col timeline-hero" : "timeline-col"}
                style={{ width: widths[k] }}
              >
                <div className="timeline-track">
                  {k > 0 ? <Step at={at} className="timeline-seg" style={segStyle} /> : null}
                  <Step at={at} rv="pop" className="timeline-dot" style={{ ["--d" as string]: "340ms" }} />
                </div>
                <Step at={at} i={1} as="p" className="timeline-label">
                  {m.label}
                </Step>
                <Step at={at} i={2} as="h3" className="timeline-title">
                  {m.title}
                </Step>
                {m.line ? (
                  <Step at={at} i={3} as="p" className="timeline-line">
                    {m.line}
                  </Step>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
