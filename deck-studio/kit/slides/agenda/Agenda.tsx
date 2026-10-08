import Step from "@/kit/react/Step";
import type { SlideProps } from "@/kit/react/Slide";
import "./agenda.css";

export type AgendaChapter = {
  /** as written, "01" (defaults to the position) */
  number?: string;
  name: string;
  /** a short line, right of the name */
  line?: string;
};

export type AgendaData = {
  /** mono, uppercase, under 32 characters */
  kicker?: string;
  /** the slide's one point */
  point?: string;
  /** 3 to 6 chapters */
  chapters: AgendaChapter[];
  /** 1-based chapter that is lit; earlier ones are marked done, later ones dimmed. Unset: all equal */
  current?: number;
  /** each chapter enters on its own step (max 6) */
  stepped?: boolean;
};

export const steps = (d: AgendaData) => (d.stepped ? Math.min(6, d.chapters.length) : 0);

export default function Agenda({ data }: SlideProps<AgendaData>) {
  const cur = data.current;
  return (
    <div className="agenda-root">
      {data.kicker ? (
        <Step at={0} as="p" className="agenda-kicker">
          {data.kicker}
        </Step>
      ) : null}
      {data.point ? (
        <Step at={0} i={data.kicker ? 1 : 0} as="h2" className="agenda-point">
          {data.point}
        </Step>
      ) : null}
      <ol className="agenda-list">
        {data.chapters.slice(0, 6).map((c, n) => {
          const k = n + 1;
          const state = cur ? (k < cur ? "done" : k === cur ? "now" : "next") : "all";
          return (
            <li key={n} className="agenda-li" data-state={state}>
              <Step at={data.stepped ? k : 0} i={data.stepped ? 0 : Math.min(5, n + 2)} className="agenda-row">
                <span className="agenda-n">{c.number ?? String(k).padStart(2, "0")}</span>
                <span className="agenda-name">{c.name}</span>
                {c.line ? <span className="agenda-line">{c.line}</span> : <span />}
                <span className="agenda-mark" aria-hidden="true">
                  {state === "done" ? (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M6 17l7 7L26 9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
              </Step>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
