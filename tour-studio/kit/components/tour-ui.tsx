import { PRODUCT_NAME } from "@/lib/config";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Button classes used by the engine and the start/final screens. Restyle to match the source app's buttons. */
export const btn = (variant: "primary" | "secondary" | "ghost" = "secondary", size: "sm" | "md" = "md") =>
  cn(
    "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded border font-medium transition-[background-color,border-color,opacity,transform] duration-micro ease-out active:scale-[.98] [&_svg]:size-4 [&_svg]:shrink-0",
    variant === "primary" && "border-accent bg-accent text-accent-fg hover:opacity-90",
    variant === "secondary" && "border-border bg-bg text-fg hover:border-border-strong hover:bg-hover",
    variant === "ghost" && "border-transparent bg-transparent text-fg hover:bg-hover",
    size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm"
  );

/** Square with the product's initials; replace with the demo's logo when there is one. */
export function BrandMark({ className }: { className?: string }) {
  const initials = PRODUCT_NAME.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span aria-hidden className={cn("grid size-7 flex-none place-items-center rounded-md bg-accent text-[11px] font-semibold tracking-tight text-accent-fg", className)}>
      {initials}
    </span>
  );
}
