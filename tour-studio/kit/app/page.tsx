import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/config";
import { CHAPTERS, MINUTES, STEPS, firstStepOf, stepHref } from "@/lib/tour";
import { T } from "@/lib/tour-strings";
import { BrandMark, btn } from "@/components/tour-ui";

// TEMPLATE: start screen. Rewrite the h1 (the promise) and the paragraph; the rest is generic.
export default function Start() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[960px] flex-col px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex items-center gap-2">
        <BrandMark />
        <span className="text-sm font-semibold tracking-tight">{PRODUCT_NAME}</span>
      </div>

      <section className="mt-14 sm:mt-24">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1 text-[13px] text-muted">
          <Clock className="size-3.5" aria-hidden /> {T.badge(STEPS.length, MINUTES)}
        </p>
        <h1 className="mt-5 max-w-[680px] text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[48px]">
          Promisiunea produsului, într-o frază pe care cumpărătorul o recunoaște.
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted">
          Ce face produsul pentru el, în două propoziții. Vezi cum arată, pe exemplul {COMPANY_NAME}.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={stepHref(1)} className={`${btn("primary")} h-11 px-5 text-[15px]`}>
            {T.start} <ArrowRight aria-hidden />
          </Link>
          <span className="text-[13px] text-muted">{T.keysHint}</span>
        </div>
      </section>

      <section className="mt-16 sm:mt-20" aria-labelledby="chapters">
        <h2 id="chapters" className="text-xs font-medium uppercase tracking-[0.06em] text-muted">{T.jump}</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2">
          {CHAPTERS.map((c, i) => (
            <li key={c.title}>
              <Link href={stepHref(firstStepOf(i))} className="group flex h-full items-start gap-4 rounded-lg border border-border bg-bg p-4 shadow-card transition-colors duration-micro hover:border-border-strong">
                <span className="grid size-8 flex-none place-items-center rounded-full border border-border text-[13px] font-medium tabular-nums text-muted group-hover:border-accent group-hover:text-accent-text">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{c.title}</span>
                  <span className="block text-[13px] text-muted">{c.desc}</span>
                  <span className="mt-2 block text-[13px] tabular-nums text-faint">{T.steps(STEPS.filter((s) => s.chapter === i).length)}</span>
                </span>
                <ArrowRight className="mt-1 size-4 flex-none text-faint transition-transform duration-micro group-hover:translate-x-0.5 group-hover:text-accent-text" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-auto pt-16 text-[13px] text-faint">{T.mockNote}</p>
    </main>
  );
}
