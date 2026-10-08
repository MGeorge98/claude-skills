/**
 * Exemplu: the MBV Summit lead form (2026-10-08). Keys are the kit defaults (CONTRACT lead payload); legal links and the
 * company name are that client's. Replace all of it per project.
 */
import type { FormCopy, FormKeys } from "./FormPopup";

export const formEndpointExample = "/api/lead";

export const formKeysExample: Partial<FormKeys> = { name: "nume", company: "companie", email: "email", phone: "telefon", consent: "acord", interests: "interese" };

export const formCopyExample: FormCopy = {
  fields: {
    name: { label: "Nume", placeholder: "Numele tău" },
    company: { label: "Companie", placeholder: "Firma ta" },
    email: { label: "E-mail", placeholder: "tu@firma.ro" },
    phone: { label: "Telefon", placeholder: "07xx xxx xxx" },
  },
  interests: {
    legend: "Te mai interesează ceva? (opțional)",
    options: [
      { id: "curs", label: "Vreau cursul de AI pentru mine" },
      { id: "curs-companie", label: "Vreau cursul pentru echipa mea" },
      { id: "aplicatie", label: "Vreau o aplicație software pentru firma mea" },
      { id: "firmio", label: "Vreau să văd Firmio pe firma mea" },
    ],
  },
  consent: [
    "Accept ",
    { label: "Termenii și condițiile", href: "https://curs.cleancodeculture.com/terms" },
    " și ",
    { label: "Politica de confidențialitate", href: "https://curs.cleancodeculture.com/privacy-policy" },
    " și sunt de acord cu prelucrarea datelor mele personale de către Clean Code Culture SRL, ca să-mi trimită agentul pe e-mail și să mă contacteze în legătură cu ce am bifat mai sus.",
  ],
  submit: "Trimite-mi agentul",
  sending: "Se trimite…",
  note: "Gratuit. Îl primești pe e-mail în câteva secunde.",
  errors: {
    network: "Nu am ajuns la server. Verifică internetul și mai încearcă o dată.",
    generic: "Ceva n-a mers. Mai încearcă o dată.",
  },
  done: {
    kicker: "Gata",
    title: "Verifică-ți e-mailul.",
    titleNoEmail: "Te-am înregistrat.",
    body: "Ți-am trimis agentul și ghidul în PDF pe {email}. Dacă nu-l vezi în două minute, uită-te și în Spam sau Promoții.",
    bodyNoEmail: "Îți trimit agentul pe {email} în cel mai scurt timp.",
    footnote: "Mai jos ai cele trei lucruri de făcut de mâine.",
  },
  download: { label: "Descarcă agentul (ZIP)", href: "/agenti.zip", note: "Îl primești și pe e-mail, cu ghidul în PDF." },
  popup: {
    title: "Gata! Tocmai ți-am trimis agentul pe e-mail.",
    titleNoEmail: "Te-am înregistrat. Îți trimit agentul pe e-mail în cel mai scurt timp.",
    body: "Ești curios unde te poate duce AI-ul? Uite care poate fi călătoria ta.",
    cta: "Vezi călătoria",
    targetId: "traseu",
  },
};
