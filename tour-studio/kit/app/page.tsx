import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/config";
import { MINUTES, STEPS, stepHref } from "@/lib/tour";
import { StepList } from "@/components/step-list";
import { T } from "@/lib/tour-strings";
import { BrandMark, btn } from "@/components/tour-ui";

// TEMPLATE: start screen = a story opening, not a menu.
// 1. The pain in ONE concrete image, in the landing's own words (a moment, a time, a number the buyer recognises),
//    with the same moment "with the product" beside it. Step 1 of the tour must pay this image off.
// 2. The promise (the landing's headline), one paragraph, the start button.
// 3. A compact list of the steps with their moments. Replace every placeholder line below; invent nothing.
const PAIN = { kicker: `Fără ${PRODUCT_NAME}`, title: "Momentul care doare, cu ora și locul lui.", lines: ["Detaliul 1 al durerii", "Detaliul 2", "Detaliul 3"] };
const RELIEF = { kicker: `Cu ${PRODUCT_NAME}`, title: "Același moment, rezolvat.", lines: ["Ce face produsul în locul omului", "Ce vede omul a doua zi"] };

export default function Start() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[980px] flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center gap-2">
        <BrandMark />
        <span className="text-sm font-semibold tracking-tight">{PRODUCT_NAME}</span>
      </div>

      <section aria-label="Înainte și după" className="mt-10 grid gap-3 sm:mt-14 md:grid-cols-2">
        {[PAIN, RELIEF].map((c, i) => (
          <div key={c.kicker} className={i === 0 ? "rounded-[20px] bg-fg p-5 text-bg shadow-card sm:p-6" : "rounded-[20px] border border-border bg-bg p-5 shadow-card sm:p-6"}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${i === 0 ? "opacity-60" : "text-muted"}`}>{c.kicker}</p>
            <h2 className="mt-2 text-balance text-[20px] font-bold leading-snug tracking-[-0.02em] sm:text-[22px]">{c.title}</h2>
            <ul className="mt-4 grid gap-1.5 text-[13px]">
              {c.lines.map((l) => <li key={l} className={`rounded-[12px] px-3 py-2 ${i === 0 ? "bg-white/10" : "bg-page"}`}>{l}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-10 sm:mt-14">
        <h1 className="max-w-[720px] text-balance text-[34px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
          Promisiunea de pe landing, cuvânt cu cuvânt.
        </h1>
        <p className="mt-4 max-w-[580px] text-[16px] leading-relaxed text-muted">
          Ce face produsul, cu cuvintele landingului. Urmărim o zi la {COMPANY_NAME}, de la primul moment până la ultimul.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link href={stepHref(1)} className={`${btn("primary")} h-12 px-6 text-[15px]`}>
            {T.start} <ArrowRight aria-hidden />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted"><Clock className="size-3.5" aria-hidden /> {T.badge(STEPS.length, MINUTES)}</span>
        </div>
        <p className="mt-3 text-[13px] text-faint">{T.keysHint}</p>
      </section>

      <nav className="mt-12 border-t border-border pt-5" aria-labelledby="pasi">
        <h2 id="pasi" className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">{T.jump}</h2>
        <StepList />
      </nav>

      <p className="mt-auto pt-12 text-[12.5px] text-faint">{T.mockNote}</p>
    </main>
  );
}
