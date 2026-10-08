"use client";
import type { CSSProperties, FormEvent } from "react";
import "./before-after.css";

/**
 * before-after: two same-size images stacked, the top one (after) clipped on its left side by --x, so it shows right of the handle.
 * A native range input drives --x through one onInput handler (keyboard comes for free).
 * The frame carries data-rv="mask" (neutral variant: the frame itself stays visible, the engine adds .in);
 * only --x moves on reveal, and the clipped element is an image, never the observed box.
 */
export type BeforeAfterImage = {
  src: string;
  alt: string;
  /** intrinsic pixel size, always set so the frame never shifts (CLS 0) */
  width: number;
  height: number;
};

export type BeforeAfterProps = {
  id?: string;
  /** accessible name of the slider and the section */
  label: string;
  before: BeforeAfterImage;
  after: BeforeAfterImage;
  labels?: { before: string; after: string };
  caption?: string;
  heading?: string;
  /** mono kicker above the heading */
  kicker?: string;
  /** resting position, handle position, percent from the left; "before" shows to its left (default 50) */
  start?: number;
};

const DEFAULT_LABELS = { before: "Înainte", after: "După" };

/** the only listener: write --x on the frame and stop the reveal transition from lagging the drag */
function onSlide(e: FormEvent<HTMLInputElement>) {
  const frame = e.currentTarget.parentElement;
  if (!frame) return;
  frame.style.setProperty("--x", `${e.currentTarget.value}%`);
  frame.dataset.moved = "1";
}

export default function BeforeAfter({ id, label, before, after, labels = DEFAULT_LABELS, caption, heading, kicker, start = 50 }: BeforeAfterProps) {
  const s = Math.min(100, Math.max(0, start));
  const hid = `${id ?? "before-after"}-h`;
  return (
    <section id={id} className="before-after" aria-label={heading ? undefined : label} aria-labelledby={heading ? hid : undefined}>
      {(kicker || heading) && (
        <header className="before-after-head">
          {kicker && (
            <p className="before-after-kicker" data-rv>
              {kicker}
            </p>
          )}
          {heading && (
            <h2 className="before-after-h" id={hid} data-rv style={{ "--d": "80ms" } as CSSProperties}>
              {heading}
            </h2>
          )}
        </header>
      )}
      <figure className="before-after-fig">
        <div
          className="before-after-frame"
          data-rv="mask"
          style={{ "--ba-start": `${s}%`, aspectRatio: `${before.width} / ${before.height}` } as CSSProperties}
        >
          <img className="before-after-img before-after-before" src={before.src} alt={before.alt} width={before.width} height={before.height} decoding="async" />
          <img className="before-after-img before-after-after" src={after.src} alt={after.alt} width={after.width} height={after.height} decoding="async" />
          <span className="before-after-tag before-after-tag-l" aria-hidden="true">
            {labels.before}
          </span>
          <span className="before-after-tag before-after-tag-r" aria-hidden="true">
            {labels.after}
          </span>
          <input
            className="before-after-range"
            type="range"
            min={0}
            max={100}
            step={1}
            defaultValue={s}
            aria-label={`${label}: ${labels.before} / ${labels.after}`}
            onInput={onSlide}
          />
          <span className="before-after-handle" aria-hidden="true">
            <span className="before-after-line" />
            <span className="before-after-knob">
              <svg viewBox="0 0 24 24" width="20" height="20" focusable="false">
                <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </div>
        {caption && <figcaption className="before-after-cap">{caption}</figcaption>}
      </figure>
    </section>
  );
}
