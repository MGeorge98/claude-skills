import type { CSSProperties, ReactNode } from "react";
import SplitWords from "@/kit/react/SplitWords";
import "./intro-sequence.css";

/**
 * intro-sequence: a short timed intro painted OVER the page's first scene (logo stroke draw, wordmark words rise
 * out of masks, a curtain lifts). The page underneath is already rendered and painted, so LCP and layout never wait
 * for it: the overlay is position fixed (CLS 0) and scroll is not locked.
 *
 * The whole timeline is CSS from the first paint. The overlay is display none by default and only exists under
 * html.js:not(.rm):not(.paused), so no JS, reduced motion, Pause motion and ls-static never see it. The curtain lift
 * ends at `duration` on its own; a failsafe animation hides the overlay at --ls-failsafe whatever happens.
 *
 * The small inline script (inside dangerouslySetInnerHTML, so React never diffs or re-runs it) runs while the
 * document parses, right after the overlay: a second load in the same session hides it before the first paint
 * (sessionStorage), a click, tap, key or wheel skips it, and at the end it goes to display none.
 */
export type IntroSequenceProps = {
  /** an SVG path `d` in a 64 x 64 box (drawn as a stroke), or your own node (give its strokes pathLength="1") */
  logo?: string | ReactNode;
  /** text, split into word masks */
  wordmark: string;
  /** total ms until the curtain is gone, clamped to 1200..2000 */
  duration?: number;
  /** small mono line under the wordmark */
  label?: string;
  /** element id, also the sessionStorage key suffix */
  id?: string;
};

export const INTRO_DEFAULT_MS = 1600;
/** fraction of the duration where the curtain starts to lift; a skip after this point just lets it finish */
const LIFT_AT = 0.72;
/** the skip lift lasts 60% of the normal lift (exit twin) */
const SKIP_MS = (d: number) => Math.round(d * (1 - LIFT_AT) * 0.6);

function script(id: string, d: number) {
  const key = JSON.stringify(`ls-intro:${id}`);
  return (
    `(function(){try{var h=document.documentElement,o=document.getElementById(${JSON.stringify(id)});if(!o)return;` +
    `var G='intro-sequence-gone';` +
    `try{if(sessionStorage.getItem(${key})==='1'){o.classList.add(G);return;}sessionStorage.setItem(${key},'1');}catch(e){}` +
    `var c=h.classList;if(!c.contains('js')||c.contains('rm')||c.contains('paused')){o.classList.add(G);return;}` +
    `var t0=Date.now(),done=false,E=['pointerdown','keydown','wheel','touchmove'],end;` +
    `function off(){E.forEach(function(n){removeEventListener(n,skip,true);});}` +
    `function gone(){done=true;off();o.classList.add(G);}` +
    `function skip(){if(done)return;done=true;off();if(Date.now()-t0>=${Math.round(d * LIFT_AT)})return;` +
    `clearTimeout(end);o.classList.add('intro-sequence-skip');setTimeout(function(){o.classList.add(G);},${SKIP_MS(d) + 40});}` +
    `E.forEach(function(n){addEventListener(n,skip,{capture:true,passive:true});});` +
    `end=setTimeout(gone,${d + 40});` +
    `}catch(e){var x=document.getElementById(${JSON.stringify(id)});if(x)x.classList.add('intro-sequence-gone');}})();`
  );
}

export default function IntroSequence({ logo, wordmark, duration = INTRO_DEFAULT_MS, label, id = "intro" }: IntroSequenceProps) {
  const d = Math.min(2000, Math.max(1200, Math.round(duration)));
  const style = { "--intro-sequence-d": `${d}ms`, "--intro-sequence-skip": `${SKIP_MS(d)}ms` } as CSSProperties;
  return (
    <>
      <div id={id} className="intro-sequence" style={style} aria-hidden="true" suppressHydrationWarning>
        <div className="intro-sequence-in">
          {logo && (
            <div className="intro-sequence-logo">
              {typeof logo === "string" ? (
                <svg viewBox="0 0 64 64" fill="none" focusable="false">
                  <path className="intro-sequence-fill" d={logo} />
                  <path className="intro-sequence-stroke" d={logo} pathLength={1} />
                </svg>
              ) : (
                logo
              )}
            </div>
          )}
          <p className="intro-sequence-word">
            <SplitWords text={wordmark} base={Math.round(d * 0.3)} step={70} />
          </p>
          {label && <p className="intro-sequence-label">{label}</p>}
        </div>
      </div>
      <div hidden dangerouslySetInnerHTML={{ __html: `<script>${script(id, d)}</script>` }} />
    </>
  );
}
