import type { ComponentType, ReactNode } from "react";

/** One entry of THE ORDER in src/deck.tsx. */
export type Transition = "fade" | "none" | "wipe";
export type SlideDef<D = any> = {
  /** unique, kebab-case; becomes data-slide */
  id: string;
  /** a folder name under src/slides (see kit/slides/INDEX.md) */
  type: string;
  data: D;
  /** presenter notes: lines, "- " bullets, **bold** */
  notes?: string;
  transition?: Transition;
};

/** What a slide type component receives. `step` is the slide's current step (its final step in print). */
export type SlideProps<D = any> = { data: D; step: number };

/** A slide type module: `export default` the component, `export const steps = (data) => number`. */
export type SlideType<D = any> = { Component: ComponentType<SlideProps<D>>; steps: (data: D) => number };

/** The section the runtime drives. <Deck> renders one per SlideDef; slide types render inside it. */
export default function Slide({
  id,
  type,
  steps,
  transition = "fade",
  index,
  className,
  children,
}: {
  id: string;
  type: string;
  steps: number;
  transition?: Transition;
  index: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className={className ? `slide ${className}` : "slide"}
      data-slide={id}
      data-type={type}
      data-steps={steps}
      data-transition={transition}
      aria-roledescription="slide"
      aria-label={String(index + 1)}
    >
      {children}
    </section>
  );
}
