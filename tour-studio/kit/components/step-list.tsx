import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STEPS, stepHref } from "@/lib/tour";

/** The steps with their story moments, used on the start and final screens. */
export function StepList() {
  return (
    <ol className="mt-2 grid gap-x-6 sm:grid-cols-2">
      {STEPS.map((s, i) => (
        <li key={s.id}>
          <Link href={stepHref(i + 1)} className="group flex items-center gap-3 border-b border-border py-2 text-[13.5px]">
            <span className="w-4 flex-none text-right tabular-nums text-faint">{i + 1}</span>
            <span className="min-w-0 flex-1">
              {s.moment && <span className="block text-[11.5px] font-semibold text-muted">{s.moment}</span>}
              <span className="block font-medium group-hover:underline">{s.title}</span>
            </span>
            <ArrowRight className="size-3.5 flex-none text-faint" aria-hidden />
          </Link>
        </li>
      ))}
    </ol>
  );
}
