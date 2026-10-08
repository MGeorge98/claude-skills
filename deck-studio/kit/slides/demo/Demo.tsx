import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./demo.css";

export type DemoData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point, one line, visible from step 0 */
  point: string;
  /** the live page; never hardcoded in the component */
  url: string;
  /** a screenshot of the same page, local in public/, shown until the iframe loads and always in print */
  fallback: { src: string; alt: string; width: number; height: number };
  /** the small badge top right, default "demo live" */
  badge?: string;
  /** one short line under the frame */
  note?: string;
};

export const steps = (_d: DemoData) => 0;

/* geometry at 1920 x 1080 */
const MAX_W = 1696;
const MAX_H = 690;
/** after this long without a load the fallback stays for good (a late load must not swap the picture mid-talk) */
const GIVE_UP_MS = 4000;

type Live = "wait" | "live" | "off";

export default function Demo({ data }: SlideProps<DemoData>) {
  const { width: W, height: H } = data.fallback;
  const k = Math.min(MAX_W / W, MAX_H / H);
  const fw = Math.round(W * k);
  const fh = Math.round(H * k);
  const [live, setLive] = useState<Live>("wait");
  const [armed, setArmed] = useState(false);
  const view = useRef<HTMLDivElement>(null);
  const seen = useRef({ load: false, reach: false });
  const settleRef = useRef<() => void>(() => {});

  // The frame is created the first time the card is actually on screen (its slide is current, or the presenter
  // shows it), never in ?print and never in the prerendered no-JS document: those show the fallback only.
  useEffect(() => {
    const el = view.current;
    if (!el || new URLSearchParams(window.location.search).has("print") || typeof IntersectionObserver !== "function") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((x) => x.isIntersecting)) {
        setArmed(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // live = the frame fired load AND the address answered a plain no-cors request, both within 4 s of the frame
  // being created. The probe catches a dead or offline address: Chrome fires load on its own error page too.
  useEffect(() => {
    if (!armed) return;
    seen.current = { load: false, reach: false };
    setLive("wait");
    let gone = false;
    const settle = () => {
      if (!gone && seen.current.load && seen.current.reach) setLive((s) => (s === "wait" ? "live" : s));
    };
    settleRef.current = settle;
    fetch(data.url, { mode: "no-cors", cache: "no-store" }).then(
      () => { seen.current.reach = true; settle(); },
      () => { if (!gone) setLive((s) => (s === "wait" ? "off" : s)); },
    );
    const t = window.setTimeout(() => { if (!gone) setLive((s) => (s === "wait" ? "off" : s)); }, GIVE_UP_MS);
    return () => { gone = true; window.clearTimeout(t); };
  }, [armed, data.url]);

  const onLoad = (e: SyntheticEvent<HTMLIFrameElement>) => {
    // a same-origin frame that loaded nothing (about:blank) is a failed load; a cross-origin frame is opaque
    try {
      const doc = e.currentTarget.contentDocument;
      if (doc && doc.URL === "about:blank") return;
    } catch {
      /* cross-origin: trust the load event, the probe decides */
    }
    seen.current.load = true;
    settleRef.current();
  };

  return (
    <div className="demo-root">
      {data.kicker ? (
        <Step at={0} as="p" className="demo-kicker">
          {data.kicker}
        </Step>
      ) : null}
      <Step at={0} i={data.kicker ? 1 : 0} as="h2" className="demo-point">
        {data.point}
      </Step>
      <Step at={0} i={2} className="demo-card" style={{ width: fw }}>
        <div className="demo-bar">
          <span className="demo-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="demo-url">{data.url}</span>
          <span className="demo-badge">
            <i aria-hidden="true" />
            {data.badge ?? "demo live"}
          </span>
        </div>
        <div ref={view} className="demo-view" data-no-nav="" data-live={live} style={{ width: fw, height: fh }}>
          {armed ? (
            <iframe
              className="demo-frame"
              data-no-nav=""
              src={data.url}
              title={`Demo: ${data.url}`}
              width={fw}
              height={fh}
              onLoad={onLoad}
            />
          ) : null}
          <img
            className="demo-fallback"
            src={data.fallback.src}
            alt={data.fallback.alt}
            width={data.fallback.width}
            height={data.fallback.height}
          />
        </div>
      </Step>
      {data.note ? (
        <Step at={0} i={3} as="p" className="demo-note">
          {data.note}
        </Step>
      ) : null}
    </div>
  );
}
