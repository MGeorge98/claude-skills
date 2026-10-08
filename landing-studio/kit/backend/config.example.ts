/**
 * Config unic pentru backend (formular + e-mail). Copiază în src/config.ts.
 * Toate textele de mai jos sunt Exemplu: înlocuiește-le cu datele clientului.
 * Nimic inventat: dacă nu ai un fapt, lasă câmpul gol și blocul dispare.
 */
export const site = {
  eveniment: "Exemplu Summit", // numele evenimentului sau al paginii
  titlu: "Ai primit un instrument la cheie",
  sursa: "exemplu-qr", // se scrie în fiecare contact salvat
  contact: {
    // Lasă gol ce nu vrei să apară.
    whatsapp: "", // ex. "40722000000", fără + și fără spații
    email: "",
    instagram: "https://www.instagram.com/exemplu/",
    tiktok: "",
    linkedin: "https://www.linkedin.com/in/exemplu/",
    facebook: "",
    site: "https://exemplu.ro",
  },
  firma: {
    nume: "Exemplu SRL",
    termeni: "https://exemplu.ro/termeni",
    confidentialitate: "https://exemplu.ro/confidentialitate",
  },
  linkuri: {
    curs: "https://exemplu.ro/curs",
    aplicatie: "https://exemplu.ro/aplicatie",
    produs: "https://exemplu.ro/produs",
  },
} as const;

/** Ce bifează omul în formular. Id-urile sunt singurele acceptate de API. */
export const interese = [
  { id: "curs", label: "Vreau cursul pentru mine" },
  { id: "curs-echipa", label: "Vreau cursul pentru echipa mea" },
  { id: "aplicatie", label: "Vreau o aplicație pentru firma mea" },
] as const;

export type InteresId = (typeof interese)[number]["id"];

/** Ce primește persoana (cardul din e-mail). */
export const oferta = {
  nume: "Instrumentul din Exemplu",
  intra: "Datele tale din ultimele 12 luni", // chip INTRĂ
  iese: "Un raport clar, într-un fișier", // chip IESE
  bullets: [
    "Primul rezultat pe care îl poți folosi azi",
    "Cum se schimbă, de la o lună la alta",
    "Ce merită verificat mai întâi",
  ],
} as const;

export interface EmailLink { label: string; href: string }
export interface EmailStep { t: string; d: string }
export interface EmailJourney { t: string; d: string; extra?: string; b: string; href: string }

/** Conținutul e-mailului pentru participant. */
export const email = {
  fromName: "Ana Exemplu", // semnătura și numele expeditorului
  fromRole: "Fondator, Exemplu SRL",
  subject: "Ce ți-am promis la {eveniment}", // {eveniment} se înlocuiește
  greeting: "Salut, {nume}!", // {nume} = numele complet, cum l-a scris omul
  greetingEmpty: "Salut!",
  heroAccent: "promis.", // ultimul cuvânt din titlu, colorat
  heroTitle: "Uite instrumentul", // titlul = salut + heroTitle + heroAccent
  lead: "Mulțumesc că ai fost la {eveniment}.", // linia de sub titlu
  kicker: "Ce ți-am promis pe scenă",
  signoff: "Dacă te blochezi la ceva, răspunde la acest e-mail. Citesc eu.",
  steps: {
    kicker: "Ce poți face de mâine?",
    title: "Trei lucruri.",
    accent: "Trei ore.",
    items: [
      { t: "Primul pas.", d: "O frază scurtă care spune exact ce face omul azi." },
      { t: "Al doilea pas.", d: "O frază scurtă, fără promisiuni care nu se pot verifica." },
      { t: "Al treilea pas.", d: "O frază scurtă, cu rezultatul concret." },
    ] as EmailStep[],
  },
  journey: {
    kicker: "Mai departe",
    title: "Iată cum poți continua",
    accent: "drumul",
    // Exact 4 trepte; ultima e accentuată (violet).
    items: [
      { t: "Curs", d: "Învață să-ți construiești singur instrumentele.", b: "Vreau la curs", href: site.linkuri.curs },
      { t: "Training în echipă", d: "Același curs, ținut la voi.", b: "Curs pentru echipa mea", href: site.linkuri.curs },
      { t: "Aplicație personalizată", d: "O aplicație făcută pe firma ta.", b: "Vreau o aplicație", href: site.linkuri.aplicatie },
      { t: "Produsul", d: "Cel mai mare pas.", b: "Vreau să văd produsul", href: site.linkuri.produs },
    ] as EmailJourney[],
  },
  /** Sunt acceptate până la 2 logo-uri (cid). Fișierele: public/email-logo-<id>.png */
  logos: [
    { id: "brand", alt: "Exemplu SRL", w: 120, h: 77, badge: "EXEMPLU" },
    { id: "event", alt: "Exemplu Summit", w: 110, h: 45, badge: "SUMMIT" },
  ],
  /** Blocurile active, în ordine. Scoate un nume ca să dispară blocul. */
  sections: ["header", "hero", "offer", "steps", "journey", "signature", "footer"],
} as const;

export type EmailSection = "header" | "hero" | "offer" | "steps" | "journey" | "signature" | "footer";
