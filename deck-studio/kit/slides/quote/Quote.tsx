import Step from "@/kit/react/Step";
import SplitWords from "@/kit/react/SplitWords";
import type { SlideProps } from "@/kit/react/Slide";
import "./quote.css";

export type QuoteData = {
  /** the quote, copied from facts.md, at most 24 words */
  text: string;
  /** who said it */
  attribution: string;
  /** their role, one short line */
  role?: string;
  /** round 160px portrait left of the attribution; local file in public/ or a data URI */
  portrait?: { src: string; alt: string; width: number; height: number };
  /** attribution at step 0 instead of step 1 */
  immediate?: boolean;
};

export const steps = (d: QuoteData) => (d.immediate ? 0 : 1);

export default function Quote({ data }: SlideProps<QuoteData>) {
  const at = data.immediate ? 0 : 1;
  const p = data.portrait;
  return (
    <figure className="quote-root">
      <Step at={0} rv="pop" as="span" className="quote-mark">
        <span aria-hidden="true">{"\u201C"}</span>
      </Step>
      <Step at={0} rv="mask" as="blockquote" className="quote-text">
        <SplitWords text={data.text} />
      </Step>
      <Step at={at} as="figcaption" className="quote-by">
        {p ? <img className="quote-portrait" src={p.src} alt={p.alt} width={p.width} height={p.height} /> : null}
        <span className="quote-who">
          <span className="quote-name">{data.attribution}</span>
          {data.role ? <span className="quote-role">{data.role}</span> : null}
        </span>
      </Step>
    </figure>
  );
}
