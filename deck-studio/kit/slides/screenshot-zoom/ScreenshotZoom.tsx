import type { CSSProperties } from "react";
import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./screenshot-zoom.css";

export type ZoomRegion = {
  /** left, top, width, height in the image's own pixels (natural size, not display size) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** the pill text, 1 to 3 words */
  label: string;
  /** one short sentence under the pill */
  note?: string;
};

export type ScreenshotZoomData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point, one line, visible from step 0 */
  point: string;
  /** a local file in public/, natural width and height in px (capture at 2x so zooms stay sharp) */
  image: { src: string; alt: string; width: number; height: number };
  /** 1 to 4 regions, one per step, in image pixels */
  regions: ZoomRegion[];
  /** a browser bar over the frame: true for dots only, a string to print it as the address */
  chrome?: boolean | string;
};

export const steps = (d: ScreenshotZoomData) => Math.min(4, d.regions.length);

/* geometry at 1920 x 1080: the side column is fixed, the frame takes the rest */
const MAX_W = 1200;
const MAX_H = 720;
const BAR = 48;
const MARGIN = 0.88;
const px = (n: number) => `${Math.round(n * 100) / 100}px`;

/**
 * The frame shows the image laid out at its natural size and scaled down to fit (scale k <= 1).
 * Zooming to a region raises the scale towards the region, capped at 1 (natural size, never an upscale),
 * and translates so the region sits in the middle of the frame without showing past the image edges.
 * The transforms are plain data, set as --z0..--z4 on the root; the CSS picks one through `.in`.
 */
export function zoomGeometry(d: ScreenshotZoomData) {
  const { width: W, height: H } = d.image;
  const maxH = d.chrome ? MAX_H - BAR : MAX_H;
  const k = Math.min(MAX_W / W, maxH / H, 1);
  const fw = Math.round(W * k);
  const fh = Math.round(H * k);
  const t = (s: number, x: number, y: number) => `translate(${px(x)}, ${px(y)}) scale(${Math.round(s * 10000) / 10000})`;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const z = d.regions.slice(0, 4).map((r) => {
    const s = clamp(Math.min(fw / r.w, fh / r.h) * MARGIN, k, 1);
    const tx = clamp(fw / 2 - s * (r.x + r.w / 2), fw - s * W, 0);
    const ty = clamp(fh / 2 - s * (r.y + r.h / 2), fh - s * H, 0);
    return t(s, tx, ty);
  });
  return { k, fw, fh, z0: t(k, 0, 0), z };
}

export default function ScreenshotZoom({ data }: SlideProps<ScreenshotZoomData>) {
  const regions = data.regions.slice(0, 4);
  const g = zoomGeometry(data);
  const vars: Record<string, string> = { "--z0": g.z0 };
  g.z.forEach((v, n) => (vars[`--z${n + 1}`] = v));
  const two = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="screenshot-zoom-root" style={vars as CSSProperties}>
      {data.kicker ? (
        <Step at={0} as="p" className="screenshot-zoom-kicker">
          {data.kicker}
        </Step>
      ) : null}
      <Step at={0} i={data.kicker ? 1 : 0} as="h2" className="screenshot-zoom-point">
        {data.point}
      </Step>
      <div className="screenshot-zoom-body">
        <Step at={0} i={2} className="screenshot-zoom-card" style={{ width: g.fw }}>
          {data.chrome ? (
            <div className="screenshot-zoom-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              {typeof data.chrome === "string" ? <span className="screenshot-zoom-url">{data.chrome}</span> : null}
            </div>
          ) : null}
          <div className="screenshot-zoom-view" style={{ width: g.fw, height: g.fh }}>
            <div className="screenshot-zoom-layer" style={{ width: data.image.width, height: data.image.height }}>
              <img
                className="screenshot-zoom-img"
                src={data.image.src}
                alt={data.image.alt}
                width={data.image.width}
                height={data.image.height}
                decoding="async"
              />
              {regions.map((r, n) => (
                <span
                  key={n}
                  className="screenshot-zoom-mark"
                  data-r={n + 1}
                  aria-hidden="true"
                  style={{ left: r.x, top: r.y, width: r.w, height: r.h, ["--k" as string]: g.k }}
                >
                  <b>{n + 1}</b>
                </span>
              ))}
            </div>
          </div>
        </Step>
        <div className="screenshot-zoom-side">
          <ol className="screenshot-zoom-list">
            {regions.map((r, n) => (
              <li key={n} className="screenshot-zoom-item" data-r={n + 1}>
                <span className="screenshot-zoom-n">{two(n + 1)}</span>
                <span className="screenshot-zoom-item-text">
                  <span className="screenshot-zoom-item-label">{r.label}</span>
                  {r.note ? <span className="screenshot-zoom-item-note">{r.note}</span> : null}
                </span>
              </li>
            ))}
          </ol>
          <div className="deck-swap screenshot-zoom-caps">
            {regions.map((r, n) => (
              <Step key={n} at={n + 1} swap="zoom" data-r={n + 1} className="screenshot-zoom-cap">
                <p className="screenshot-zoom-count">
                  {two(n + 1)} / {two(regions.length)}
                </p>
                <p className="screenshot-zoom-pill">{r.label}</p>
                {r.note ? <p className="screenshot-zoom-note">{r.note}</p> : null}
              </Step>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
