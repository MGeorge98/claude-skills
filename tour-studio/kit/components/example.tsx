"use client";

// The pattern to copy for real mock screens:
// - every control the cursor clicks is a real button that changes lib/demo-state.ts (so a visitor's click works too);
// - each input's value is bound to DemoState.typed[<its data-tour id>] (the engine types into that buffer);
// - a beat/step `until` waits for an element the screen shows after its own animation (here: the results);
// - what the screen shows depends on the story's clock and state (nothing appears before it happens);
// - figures are COMPUTED from the mock records, so they agree everywhere they appear;
// - data-tour on the WHOLE block (the ring) and on the small control (the click target).

import { useEffect } from "react";
import { Check, Search } from "lucide-react";
import { btn, cn } from "@/components/tour-ui";
import { setDemo, useDemo } from "@/lib/demo-state";

const RECORDS = [
  { id: "1042", client: "Firma Exemplu", value: 4200, at: 8 },
  { id: "1041", client: "Atelier Model", value: 1850, at: 7.5 },
  { id: "1040", client: "Studio Probă", value: 3100, at: 13 }, // arrives at 13:00 in the story
];
const lei = (v: number) => `${v.toLocaleString("ro-RO")} lei`;

export function ExampleView() {
  const { clock, selected, approved, typed, typing, search } = useDemo();
  const name = typed["exemplu-intrebare"] ?? "", min = typed["exemplu-minim"] ?? "";
  const field = (id: string, v: string) => setDemo((s) => ({ typed: { ...s.typed, [id]: v }, search: "idle" }));
  // the search "runs" for a moment (a stand-in for any animation the tour must wait for); instant under reduced motion
  useEffect(() => {
    if (search !== "pending") return;
    const t = setTimeout(() => setDemo({ search: "done" }), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700);
    return () => clearTimeout(t);
  }, [search]);
  const rows = RECORDS.filter((r) => clock == null || r.at <= clock);
  const waiting = rows.filter((r) => !approved.includes(r.id));
  const sel = rows.find((r) => r.id === selected);
  const hits = RECORDS.filter((r) => (clock == null || r.at <= clock) && r.client.toLowerCase().includes(name.toLowerCase()) && r.value >= Number(min || 0));
  return (
    <>
      <div data-tour="exemplu-cifre" className="grid grid-cols-3 rounded-lg border border-border bg-bg shadow-card">
        {[["Cereri azi", rows.length], ["De aprobat", waiting.length], ["Valoare", lei(rows.reduce((a, r) => a + r.value, 0))]].map(([k, v]) => (
          <div key={k} className="p-4">
            <p className="text-[13px] text-muted">{k}</p>
            <p className="text-lg font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <section data-tour="exemplu-lista" className="rounded-lg border border-border bg-bg shadow-card">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">Cereri</h2>
        <ul>
          {rows.map((r) => (
            <li key={r.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                data-tour={r.id === "1042" ? "exemplu-rand" : undefined}
                onClick={() => setDemo({ selected: selected === r.id ? null : r.id })}
                className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-hover", selected === r.id && "bg-accent-soft")}
              >
                <span className="font-medium">#{r.id} · {r.client}</span>
                <span className="ml-auto tabular-nums text-muted">{lei(r.value)}</span>
                {approved.includes(r.id) ? (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[12px] font-medium text-accent-text">Aprobată</span>
                ) : (
                  <span className="rounded-full bg-warn-bg px-2 py-0.5 text-[12px] font-medium text-warn">De aprobat</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {sel && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-page px-4 py-3 text-[13px]">
            <span>Cererea #{sel.id} de la <b>{sel.client}</b>, {lei(sel.value)}</span>
            {approved.includes(sel.id) ? (
              <span className="ml-auto inline-flex items-center gap-1 font-medium text-ok"><Check className="size-4" aria-hidden />Aprobată, clientul a fost anunțat</span>
            ) : (
              <button type="button" data-tour="exemplu-aproba" onClick={() => setDemo((s) => ({ approved: [...s.approved, sel.id] }))} className={cn(btn("primary", "sm"), "ml-auto")}>
                Aprobă
              </button>
            )}
          </div>
        )}
      </section>

      <section data-tour="exemplu-cautare" className="rounded-lg border border-border bg-bg p-4 shadow-card">
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) setDemo({ search: "pending" }); }} className="flex flex-wrap items-center gap-2">
          {/* each input reads its own buffer: typed[<its data-tour id>] */}
          <label className={cn("flex min-w-0 flex-1 basis-[200px] items-center gap-2 rounded border bg-bg px-3 py-1.5", typing === "exemplu-intrebare" ? "border-fg" : "border-border-strong")}>
            <Search className="size-4 flex-none text-muted" aria-hidden />
            <input data-tour="exemplu-intrebare" value={name} onChange={(e) => field("exemplu-intrebare", e.target.value)}
              placeholder="Client" aria-label="Client" className="min-w-0 flex-1 bg-transparent py-1 outline-none placeholder:text-muted" />
          </label>
          <label className={cn("flex w-[150px] items-center gap-2 rounded border bg-bg px-3 py-1.5", typing === "exemplu-minim" ? "border-fg" : "border-border-strong")}>
            <input data-tour="exemplu-minim" value={min} onChange={(e) => field("exemplu-minim", e.target.value.replace(/\D/g, ""))} inputMode="numeric"
              placeholder="Sumă minimă" aria-label="Sumă minimă" className="min-w-0 flex-1 bg-transparent py-1 outline-none placeholder:text-muted" />
            <span className="text-muted">lei</span>
          </label>
          <button type="submit" data-tour="exemplu-trimite" className={btn("primary", "sm")}>Caută</button>
        </form>
        {search === "pending" && <p className="mt-3 text-[13px] text-muted motion-safe:animate-pulse">Se caută…</p>}
        {search === "done" && (
          <ul data-tour="exemplu-rezultate" className="mt-3 grid gap-1 text-[13px]" aria-live="polite">
            {hits.length ? hits.map((r) => <li key={r.id}>#{r.id} · {r.client} · {lei(r.value)} · {approved.includes(r.id) ? "aprobată" : "de aprobat"}</li>) : <li className="text-muted">Niciun rezultat.</li>}
          </ul>
        )}
      </section>
    </>
  );
}
