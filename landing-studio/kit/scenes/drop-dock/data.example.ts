/**
 * Exemplu: placeholder copy shaped like the MBV Summit agent dock (~/Downloads/SPEECH, 2026-10-08). Replace every
 * string per project from facts.md; nothing here is a fact about a client. No em dashes, diacritics kept.
 */
import type { DropDockProps } from "./DropDock";

export const dropDockExample: DropDockProps = {
  id: "echipa",
  kicker: "Exemplu · echipa ta",
  heading: "Trei ajutoare intră în echipă",
  lead: "Fiecare preia o sarcină repetitivă și o predă înapoi gata făcută.",
  label: "Firma ta",
  meta: "Exemplu",
  counterLabel: { one: "ajutor", many: "ajutoare" },
  items: [
    { mark: "01", name: "Ajutorul de oferte", note: "intră o cerere, iese o ofertă de verificat" },
    { mark: "02", name: "Ajutorul de e-mail", note: "intră un mesaj, iese un răspuns în ciornă" },
    { mark: "03", name: "Ajutorul de rapoarte", note: "intră un tabel, iese un rezumat de o pagină" },
  ],
};
