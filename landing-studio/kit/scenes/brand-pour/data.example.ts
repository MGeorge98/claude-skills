/**
 * Exemplu: the Firmio chapter of the MBV Summit page (2026-10-08). Guest palette taken from firmio.ro on that day;
 * re-sample the guest brand from its own site for every new project. Copy must come from the facts ledger.
 */
import type { BrandPourProps } from "./BrandPour";

export const pourExample: BrandPourProps = {
  label: "Firmio",
  guest: {
    bg: "radial-gradient(90% 55% at 50% -5%, rgba(139, 92, 246, 0.34), transparent 70%), radial-gradient(60% 45% at 100% 100%, rgba(192, 132, 252, 0.16), transparent 70%), radial-gradient(50% 40% at 0% 70%, rgba(99, 102, 241, 0.14), transparent 70%), linear-gradient(180deg, #1a1040 0%, #16143a 22%, #0a0e1a 62%)",
    base: "#0a0e1a",
    accent: "#8b5cf6",
    accentHi: "#a78bfa",
    soft: "#c4b5fd",
    pale: "#ddd6fe",
    body: "#c9c6e0",
    ink: "#ffffff",
    onAccent: "#ffffff",
  },
  pill: "Firmio",
  title: "Tot business-ul într-un singur loc. Și îl întreb",
  titleAccent: "orice.",
  body: "Uite cum îmi conduc eu firma. Mi-am construit un soft. Și am început să pun ordine.",
  shot: { src: "/firmio.png", alt: "Firmio: cifrele firmei într-o singură aplicație", width: 1734, height: 872 },
  itemsKicker: "Trei întrebări de investitor",
  items: [
    "Cât la sută din venituri îți aduce cel mai mare client?",
    "Pe care proiect câștigi bani și pe care pierzi?",
    "Câți bani îți intră în următoarele 6 luni și cât din ei reprezintă marja de profit?",
  ],
  stack: ["Știi cifrele.", "Știi cine ce face.", "Știi ce ai promis."],
  thesis: "Cu cât firma are mai puțină nevoie de tine,",
  thesisAccent: "cu atât valorează mai mult.",
  cta: { label: "Vreau să văd mai multe despre Firmio", href: "https://firmio.ro" },
};
