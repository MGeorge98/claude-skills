// Every fixed string of the tour engine and of the start/final screens. Another language = edit this file only.
// Romanian is the default; keep correct diacritics (ă â î ș ț, comma-below).

const plural = (k: number, one: string, many: string) => (k === 1 ? `1 ${one}` : `${k} ${k >= 20 ? "de " : ""}${many}`);

export const T = {
  lang: "ro",
  // engine
  next: "Următorul",
  back: "Înapoi",
  finish: "Încheie turul",
  close: "Închide turul",
  resume: "Reia turul",
  progress: "Progresul turului",
  adaptable: "Se poate adapta:",
  chapter: (i: number, title: string) => `Capitolul ${i} · ${title}`,
  count: (n: number, total: number) => `${n} din ${total}`,
  // start and final screens
  steps: (k: number) => plural(k, "pas", "pași"),
  badge: (k: number, minutes: number) => `Tur ghidat · ${plural(k, "pas", "pași")} · cam ${minutes} minute`,
  start: "Începe turul",
  keysHint: "Navighezi cu „Următorul” sau cu tastele săgeți.",
  jump: "Sau sari direct la un capitol",
  done: (k: number) => `Ai parcurs toți cei ${k} pași`,
  adaptsTitle: "Se adaptează la cerere",
  revisit: "Revezi un capitol",
  orWrite: (email: string) => `sau scrie-ne la ${email}`,
  cta: "Cere o demonstrație",
  demoSubject: "Demonstrație",
  mockNote: "Date fictive, create pentru demonstrație.",
};
