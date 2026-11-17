import Link from "next/link";
import { ArrowUpRight, Check, RotateCcw } from "lucide-react";
import { CTA_HREF, PRODUCT_NAME } from "@/lib/config";
import { STEPS, stepHref } from "@/lib/tour";
import { T } from "@/lib/tour-strings";
import { BrandMark, btn } from "@/components/tour-ui";
import { StepList } from "@/components/step-list";

export const metadata = { title: "Final" };

// TEMPLATE: final screen = a 3-line recap of what the tour proved (buyer's words, no figures you cannot back up)
// + ONE call to action (the landing's own CTA wording and target) + "Reia turul" + the step list.
const RECAP = ["Primul lucru pe care l-ai văzut, ca rezultat.", "Al doilea rezultat.", "Al treilea rezultat."];

export default function Final() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[980px] flex-col px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="flex w-fit items-center gap-2 rounded">
        <BrandMark />
        <span className="text-sm font-semibold tracking-tight">{PRODUCT_NAME}</span>
      </Link>

      <section className="mt-12 sm:mt-20">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1 text-[13px] text-muted">
          <Check className="size-3.5 text-ok" aria-hidden /> {T.done(STEPS.length)}
        </p>
        <h1 className="mt-5 max-w-[700px] text-balance text-[34px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[46px]">
          Titlul de final de pe landing (secțiunea cu formularul).
        </h1>
        <ul className="mt-6 grid gap-1.5 text-[15px]">
          {RECAP.map((l) => (
            <li key={l} className="flex items-start gap-2.5"><Check className="mt-1 size-4 flex-none text-ok" aria-hidden />{l}</li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={CTA_HREF} className={`${btn("primary")} h-12 px-6 text-[15px]`}>
            {T.cta} <ArrowUpRight aria-hidden />
          </a>
          <Link href={stepHref(1)} className={`${btn("secondary")} h-12 px-4`}>
            <RotateCcw aria-hidden /> {T.resume}
          </Link>
        </div>
        <p className="mt-3 text-[13px] text-muted">{T.ctaNote}</p>
      </section>

      <nav className="mt-14 border-t border-border pt-5" aria-labelledby="recap">
        <h2 id="recap" className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">{T.revisit}</h2>
        <StepList />
      </nav>

      <p className="mt-auto pt-12 text-[12.5px] text-faint">{T.mockNote}</p>
    </main>
  );
}
