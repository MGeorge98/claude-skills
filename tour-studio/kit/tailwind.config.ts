import type { Config } from "tailwindcss";

// Token names the kit uses. Values live in app/globals.css; copy them from the SOURCE app.
const v = (name: string) => `var(--${name})`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-sans)", "-apple-system", "Segoe UI", "sans-serif"] },
      colors: {
        page: v("page"),
        bg: { DEFAULT: v("bg"), subtle: v("bg-subtle") },
        fg: v("fg"),
        muted: v("fg-muted"),
        faint: v("fg-faint"),
        border: { DEFAULT: v("border"), strong: v("border-strong") },
        hover: v("hover"),
        accent: { DEFAULT: v("accent"), fg: v("accent-fg"), soft: v("accent-soft"), text: v("accent-text") },
        ok: v("ok"),
      },
      borderRadius: { DEFAULT: "10px", md: "10px", lg: "12px" },
      boxShadow: { pop: v("shadow"), card: v("shadow-card") },
      transitionTimingFunction: { out: "cubic-bezier(.2,.8,.2,1)" },
      transitionDuration: { micro: "150ms" },
    },
  },
  plugins: [],
} satisfies Config;
