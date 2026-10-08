import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * A fragment of a slide: `[data-step="at"]`. The runtime sets `.in` on it once the slide's step reaches `at`.
 * Its box is always laid out (opacity and transform only), so nothing on the slide moves when it enters.
 *   at    the step that reveals it (0 = enters with the slide)
 *   rv    variant: undefined rise, "mask" (SplitWords inside), "pop", "side", "wipe", "blur"
 *   i     ladder index inside one step (0..5), delay = i x --stagger
 *   swap  swap group name: inside one group only the newest revealed member is `.in` (put the members in
 *         a `.deck-swap` container so they share one cell)
 * The attributes never change after render, so React never fights the runtime over `className`.
 */
export type Rv = "mask" | "pop" | "side" | "wipe" | "blur";

export default function Step({
  at,
  rv,
  i = 0,
  swap,
  as: Tag = "div",
  className,
  style,
  children,
  ...rest
}: {
  at: number;
  rv?: Rv;
  i?: number;
  swap?: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [attr: `data-${string}`]: string | number | undefined;
}) {
  return (
    <Tag
      {...rest}
      data-step={at}
      data-rv={rv}
      data-step-swap={swap}
      className={className}
      style={{ ...style, ["--i" as string]: i }}
    >
      {children}
    </Tag>
  );
}
