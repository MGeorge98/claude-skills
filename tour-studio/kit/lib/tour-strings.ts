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
  autoOn: "Pornește redarea automată",
  autoOff: "Oprește redarea automată",
  count: (n: number, total: number) => `${n} din ${total}`,
  // start and final screens
  badge: (k: number, minutes: number) => `Tur ghidat · ${plural(k, "pas", "pași")} · cam ${minutes} ${minutes === 1 ? "minut" : "minute"}`,
  start: "Începe turul",
  keysHint: "Cursorul îți arată, tu mergi mai departe cu „Următorul” sau cu săgețile.",
  jump: "Sau sari direct la un pas",
  done: (k: number) => `Ai parcurs toți cei ${k} pași`,
  revisit: "Revezi un pas",
  cta: "Programează o demonstrație",
  ctaNote: "Îți răspundem în cel mult o zi lucrătoare.",
  mockNote: "Date fictive, create pentru demonstrație.",
};
