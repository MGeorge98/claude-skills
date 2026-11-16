import { btn } from "@/components/tour-ui";

export const metadata = { title: "Exemplu" };

// Placeholder screen so the kit runs out of the box. Delete it once the real mock screens exist.
// The pattern to copy: a static screen, data-tour on a SHORT element (one card, one strip, one button row).
export default function Exemplu() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-40 pt-6 sm:px-6 sm:pt-8">
      <h1 className="mb-5 text-xl font-semibold">Exemplu</h1>
      <div data-tour="exemplu-sumar" className="grid grid-cols-3 rounded-lg border border-border bg-bg shadow-card">
        {["12 noi", "4 în lucru", "18.400 lei"].map((k) => <div key={k} className="p-4 text-lg font-medium tabular-nums">{k}</div>)}
      </div>
      <ul data-tour="exemplu-lista" className="mt-4 rounded-lg border border-border bg-bg shadow-card">
        {["Înregistrarea 1042", "Înregistrarea 1041", "Înregistrarea 1040"].map((r) => <li key={r} className="border-b border-border px-4 py-3 last:border-b-0">{r}</li>)}
      </ul>
      <div data-tour="exemplu-actiune" className="mt-4 flex w-fit gap-2">
        <button type="button" className={btn("primary")}>Aprobă</button>
        <button type="button" className={btn("secondary")}>Descarcă PDF</button>
      </div>
    </main>
  );
}
