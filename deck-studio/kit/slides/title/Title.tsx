import Step from "@/kit/react/Step";
import SplitWords, { wordCount } from "@/kit/react/SplitWords";
import type { SlideProps } from "@/kit/react/Slide";
import "./title.css";

export type TitleData = {
  /** the talk title; one string per line (2 or 3 lines read best) */
  title: string[];
  /** 0-based line drawn in the accent colour */
  accentLine?: number;
  /** "Nume Prenume · Rol" */
  speaker?: string;
  /** event name, mono */
  event?: string;
  /** date as written in facts.md, mono */
  date?: string;
  /** a file in public/, with its intrinsic size */
  logo?: { src: string; width: number; height: number; alt: string };
  /** a soft accent glow behind the title */
  glow?: "center" | "left" | false;
};

/** Everything enters with the slide (word masks, then the lines under it). */
export const steps = (_: TitleData) => 0;

export default function Title({ data }: SlideProps<TitleData>) {
  let start = 0;
  const after = data.title.reduce((n, l) => n + wordCount(l), 0);
  const tail = Math.min(5, Math.ceil((after * 45) / 70) + 1);
  return (
    <div className="title-root">
      {data.glow ? <div className={`title-glow title-glow-${data.glow}`} aria-hidden="true" /> : null}
      {data.logo ? (
        <Step at={0} className="title-logo">
          <img src={data.logo.src} width={data.logo.width} height={data.logo.height} alt={data.logo.alt} />
        </Step>
      ) : null}
      <div className="title-main">
        <Step at={0} rv="mask" as="h1" className="title-h">
          {data.title.map((line, n) => {
            const s = start;
            start += wordCount(line);
            return (
              <span key={n} className={n === data.accentLine ? "title-line title-accent" : "title-line"}>
                <SplitWords text={line} start={s} />
              </span>
            );
          })}
        </Step>
        {data.speaker ? (
          <Step at={0} i={tail} as="p" className="title-speaker">
            {data.speaker}
          </Step>
        ) : null}
      </div>
      {data.event || data.date ? (
        <Step at={0} i={Math.min(6, tail + 1)} className="title-meta">
          {data.event ? <span>{data.event}</span> : null}
          {data.event && data.date ? <span className="title-dot" aria-hidden="true" /> : null}
          {data.date ? <span>{data.date}</span> : null}
        </Step>
      ) : null}
    </div>
  );
}
