import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { PRODUCT_NAME } from "@/lib/config";
import { T } from "@/lib/tour-strings";
import { Tour } from "@/components/tour";

// FONT: load the SOURCE app's font here (same family, same loader) and expose it as --font-sans, e.g.
//   const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });  then <html className={sans.variable}>
// latin-ext is required for ă ș ț.

export const metadata: Metadata = {
  title: { default: PRODUCT_NAME, template: `%s · ${PRODUCT_NAME}` },
  description: "TODO: one sentence, the start screen's promise.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={T.lang}>
      <body>
        {children}
        {/* useSearchParams needs a Suspense boundary or the static build fails. */}
        <Suspense fallback={null}>
          <Tour />
        </Suspense>
      </body>
    </html>
  );
}
