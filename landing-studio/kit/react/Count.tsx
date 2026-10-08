import type { CSSProperties } from "react";

/**
 * A count-up number. The server renders the final value (no JS, reduced motion, crawlers);
 * the engine counts from 0 to `to` when it scrolls into view. Decimals follow `to` ("4.5").
 *
 *   <Count to={120} suf="+" />   <Count to="4.5" suf=" ore" ms={1200} />
 */
export default function Count({
  to,
  pre = "",
  suf = "",
  ms,
  className,
  style,
}: {
  to: number | string;
  pre?: string;
  suf?: string;
  /** duration, default 1500 */
  ms?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={className} style={style} data-count={String(to)} data-pre={pre || undefined} data-suf={suf || undefined} data-ms={ms}>
      {pre}
      {to}
      {suf}
    </span>
  );
}
