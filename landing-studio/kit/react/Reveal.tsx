"use client";

import { createElement, useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { observeReveal, unobserveReveal } from "../engine/engine";

export type RevealKind = "" | "mask" | "clip" | "blur" | "pop" | "wipe" | "side" | "path";

/**
 * One `[data-rv]` element. Server-rendered markup with the attribute works on its own (the engine
 * finds it at mount); use this component for reveals that mount later (client state, tabs) or
 * whose className React rewrites: `data-shown` survives the rewrite and puts `.in` back before paint.
 *
 *   <Reveal as="h2" kind="mask"><SplitWords text="Exemplu de titlu" /></Reveal>
 *   <Reveal as="figure" kind="clip" delay={160}>...</Reveal>
 */
export default function Reveal({
  as = "div",
  kind = "",
  delay,
  index,
  replay,
  className,
  style,
  children,
  ...rest
}: {
  as?: string;
  kind?: RevealKind;
  /** ms, written as --d */
  delay?: number;
  /** ladder step, written as --i (delay = i * --ls-stagger when no delay is given; max 6 steps) */
  index?: number;
  /** run on every entry and undo on every exit */
  replay?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    observeReveal(el);
    return () => unobserveReveal(el);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el?.hasAttribute("data-shown")) el.classList.add("in");
  });

  const vars: Record<string, string | number> = {};
  if (delay != null) vars["--d"] = delay + "ms";
  if (index != null) vars["--i"] = index;
  return createElement(
    as,
    {
      ref,
      className,
      "data-rv": kind,
      ...(replay ? { "data-replay": "" } : {}),
      style: { ...style, ...vars } as CSSProperties,
      ...rest,
    },
    children,
  );
}
