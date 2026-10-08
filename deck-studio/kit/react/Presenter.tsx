import { useEffect, useState, type ReactNode } from "react";

/**
 * The presenter view (`?presenter`): the current slide (driven by the runtime like the main window),
 * the next slide at its final frame, this slide's notes, the elapsed timer (starts on the first move,
 * `T` resets it) and the step k / N. Both windows move together over BroadcastChannel("deck:<id>").
 */
export default function Presenter({
  current,
  next,
  notes,
  slide,
  total,
  step,
  steps,
  startedAt,
}: {
  /** the full deck stage (`.deck-viewport[data-deck-main] > .deck-stage`), driven by the runtime */
  current: ReactNode;
  /** the next slide's <Slide> section, or null at the end */
  next: ReactNode;
  notes?: string;
  slide: number;
  total: number;
  step: number;
  steps: number;
  startedAt: number | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);
  const secs = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div className="presenter">
      <div className="presenter-col">
        <div className="presenter-label">Acum</div>
        {current}
        <div className="presenter-meta">
          <span className="presenter-timer" data-timer>{clock}</span>
          <span>
            slide {slide + 1} / {total} · pas {step} / {steps}
          </span>
        </div>
      </div>
      <div className="presenter-col">
        <div className="presenter-label">Urmează</div>
        <div className="deck-viewport presenter-next">
          <div className="deck-stage">{next ?? <div className="slide is-current presenter-end">final</div>}</div>
        </div>
        <div className="presenter-label">Note</div>
        <div className="presenter-notes" data-no-nav>
          {notes ? renderNotes(notes) : <p className="presenter-notes-empty">fără note</p>}
        </div>
      </div>
    </div>
  );
}

/** Markdown-ish: blank-line paragraphs, "- " bullets, **bold**. */
function renderNotes(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={out.length}>{list.map((l, i) => <li key={i}>{bold(l)}</li>)}</ul>);
    list = [];
  };
  for (const raw of src.trim().split("\n")) {
    const line = raw.trim();
    if (/^[-*] /.test(line)) { list.push(line.slice(2)); continue; }
    flush();
    if (line) out.push(<p key={out.length}>{bold(line)}</p>);
  }
  flush();
  return out;
}
function bold(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p));
}
