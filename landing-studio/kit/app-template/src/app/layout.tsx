import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { BOOT_SCRIPT } from "@/kit/engine/boot";

/* the same value as --bg in src/styles/tokens.css (set by brand ingest) */
const THEME_COLOR = "#0b0b0c";

export const metadata: Metadata = {
  title: "Exemplu",
  description: "Exemplu",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: THEME_COLOR, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        {/* first in <head>, synchronous: js / rm / paused classes before paint, plus the 3.5s failsafe */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
