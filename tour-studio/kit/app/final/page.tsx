import Link from "next/link";
import { ArrowRight, Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import { CONTACT_EMAIL, DEMO_MAILTO, PRODUCT_NAME } from "@/lib/config";
import { CHAPTERS, STEPS, firstStepOf, stepHref } from "@/lib/tour";
import { T } from "@/lib/tour-strings";
import { BrandMark, btn } from "@/components/tour-ui";

export const metadata = { title: "Final" };

// TEMPLATE: final screen. One primary CTA (DEMO_MAILTO or the agreed target), restart, chapter links.
// Rewrite the h1, the paragraph and ADAPT (what the buyer can have changed; 4-6 lines).
const ADAPT = ["Statusurile și pașii fluxului", "Regulile de calcul", "Documentele generate, cu identitatea ta", "Emailurile trimise clienților"];

export default function Final() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[960px] flex-col px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/" className="flex w-fit items-center gap-2 rounded">
        <BrandMark />
        <span className="text-sm font-semibold tracking-tight">{PRODUCT_NAME}</span>
      </Link>

      <section className="mt-12 sm:mt-20">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1 text-[13px] text-muted">
          <Check className="size-3.5 text-ok" aria-hidden /> {T.done(STEPS.length)}
        </p>
        <h1 className="mt-5 max-w-[680px] text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
          Rezultatul pentru cumpărător, într-o frază.
        </h1>
        <p className="mt-4 max-w-[580px] text-[16px] leading-relaxed text-muted">
          {PRODUCT_NAME} se configurează pe fluxul firmei tale, iar orice parte se adaptează la cerere.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={DEMO_MAILTO} className={`${btn("primary")} h-11 px-5 text-[15px]`}>
            {T.cta} <ArrowRight aria-hidden />
          </a>
          <Link href={stepHref(1)} className={`${btn("secondary")} h-11 px-4`}>
            <RotateCcw aria-hidden /> {T.resume}
          </Link>
        </div>
        <p className="mt-3 text-[13px] text-faint">{T.orWrite(CONTACT_EMAIL)}</p>
      </section>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-bg p-5 shadow-card" aria-labelledby="adapt">
          <h2 id="adapt" className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4 text-accent-text" aria-hidden /> {T.adaptsTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-[14px]">
            {ADAPT.map((a) => (
              <li key={a} className="flex gap-2.5"><Check className="mt-0.5 size-4 flex-none text-accent-text" aria-hidden /> {a}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-border bg-bg p-5 shadow-card" aria-labelledby="recap">
          <h2 id="recap" className="text-sm font-semibold">{T.revisit}</h2>
          <ol className="mt-2">
            {CHAPTERS.map((c, i) => (
              <li key={c.title} className="border-b border-border last:border-b-0">
                <Link href={stepHref(firstStepOf(i))} className="group flex items-center gap-3 py-2.5">
                  <span className="grid size-6 flex-none place-items-center rounded-full border border-border text-xs tabular-nums text-muted">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium group-hover:text-accent-text">{c.title}</span>
                    <span className="block text-[13px] text-muted">{c.desc}</span>
                  </span>
                  <ArrowRight className="size-4 flex-none text-faint group-hover:text-accent-text" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
