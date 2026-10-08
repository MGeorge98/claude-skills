import { promises as fs } from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { email as cfg, interese, oferta, site, type EmailSection } from "@/config";
import type { Lead } from "./leads";

/*
 * E-mailul pentru participant, construit din config.email.sections.
 * Logo-urile pleacă ca atașamente inline (cid) și stau pe pastile închise la culoare:
 * Gmail pe iOS inversează culorile, iar un logo transparent devine ilizibil fără fundal.
 * Fișierele se așteaptă în public/email-logo-<id>.png (le va genera scripts/email-logos).
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const smtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function transport() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

const from = () => process.env.MAIL_FROM || process.env.SMTP_USER || "";

/** Fișierele din ATTACH_DIR (implicit agenti/) pleacă atașate, în afară de CITESTE.txt și fișierele ascunse. */
async function attachments() {
  const dir = path.join(process.cwd(), process.env.ATTACH_DIR || "agenti");
  try {
    const names = await fs.readdir(dir);
    return names
      .filter((n) => !n.startsWith(".") && n.toLowerCase() !== "citeste.txt")
      .map((n) => ({ filename: n, path: path.join(dir, n) }));
  } catch {
    return [];
  }
}

/** Linkurile sociale din config, fără cele goale. */
function sociale() {
  const c = site.contact;
  const l: { label: string; href: string }[] = [];
  if (c.instagram) l.push({ label: "Instagram", href: c.instagram });
  if (c.tiktok) l.push({ label: "TikTok", href: c.tiktok });
  if (c.linkedin) l.push({ label: "LinkedIn", href: c.linkedin });
  if (c.facebook) l.push({ label: "Facebook", href: c.facebook });
  if (c.whatsapp) l.push({ label: "WhatsApp", href: `https://wa.me/${c.whatsapp}` });
  if (c.email) l.push({ label: c.email, href: `mailto:${c.email}` });
  if (c.site) l.push({ label: c.site.replace(/^https?:\/\//, "").replace(/\/+$/, ""), href: c.site });
  return l;
}

export const cidOf = (id: string) => `logo-${id}@landing-studio`;

export interface ParticipantOpts {
  /** Linkul direct la arhivă (din SITE_URL); gol = fără buton. */
  zipUrl?: string;
  /** Unde e fișierul: atașat, la un link (ATTACH_URL) sau vine separat. */
  unde?: { kind: "atasat" } | { kind: "link"; url: string } | { kind: "separat" };
  /** Ce logo-uri există ca fișier (id => true). Fără fișier apare un badge text. */
  logos?: Record<string, boolean>;
  /** Suprascrie lista de blocuri din config (ordinea contează). */
  sections?: readonly EmailSection[];
}

const numeOf = (lead: Pick<Lead, "nume">) => (lead.nume || "").trim().replace(/\s+/g, " ").slice(0, 60).trim();
const fill = (s: string, nume: string) => s.replace(/\{eveniment\}/g, site.eveniment).replace(/\{nume\}/g, nume);

const F = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const M = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
/** Paleta e-mailului. Fără negru sau alb pur. Schimb-o aici ca să ia culorile brandului. */
const C = {
  bg: "#0B0F14",
  surf: "#121922",
  line: "#252E3A",
  green: "#3CC98F",
  teal: "#6FD9B1",
  t1: "#F2F5F7",
  t2: "#CDD5DB",
  tm: "#98A4AD",
  chip: "#10281F",
  chipLine: "#1D4A37",
  violet: "#8B5CF6",
  violetBtn: "#6D3FE0",
  pill: "#1A2430",
};

/** Subiectul, HTML-ul și textul simplu. Pur: nu citește fișiere și nu trimite nimic. */
export function renderParticipant(lead: Pick<Lead, "nume">, opts: ParticipantOpts = {}) {
  const zipUrl = opts.zipUrl || "";
  const unde = opts.unde || { kind: "atasat" as const };
  const logos = opts.logos || Object.fromEntries(cfg.logos.map((l) => [l.id, true]));
  const sections: readonly EmailSection[] = opts.sections || cfg.sections;
  const on = (s: EmailSection) => sections.includes(s);
  const nume = numeOf(lead);
  const salut = nume ? fill(cfg.greeting, nume) : cfg.greetingEmpty;
  const subject = fill(cfg.subject, nume);
  const leadLine = fill(cfg.lead, nume);

  const undeText =
    unde.kind === "atasat"
      ? "Îl găsești atașat în acest e-mail."
      : unde.kind === "link"
        ? `Îl descarci de aici: ${unde.url}`
        : "Ți-l trimit într-un mesaj separat, în scurt timp.";
  const undeHtml =
    unde.kind === "link"
      ? `Îl descarci de aici: <a href="${esc(unde.url)}" style="color:${C.teal} !important;text-decoration:underline;">${esc(unde.url)}</a>`
      : esc(undeText);

  const soc = sociale();

  /* ---------- text simplu (în pas cu blocurile active) ---------- */
  const t: string[] = [];
  if (on("hero")) t.push(`${salut} ${cfg.heroTitle} ${cfg.heroAccent}\n\n${leadLine} ${undeText}${zipUrl ? `\nDescarcă (ZIP): ${zipUrl}` : ""}`);
  if (on("offer"))
    t.push(`${oferta.nume.toUpperCase()}\nIntră: ${oferta.intra}\nIese: ${oferta.iese}\n${oferta.bullets.map((x) => `- ${x}`).join("\n")}`);
  if (on("steps")) t.push(`${cfg.steps.kicker.toUpperCase()} ${cfg.steps.title} ${cfg.steps.accent}\n${cfg.steps.items.map((p, i) => `0${i + 1}. ${p.t} ${p.d}`).join("\n")}`);
  if (on("journey"))
    t.push(`${cfg.journey.kicker.toUpperCase()}: ${cfg.journey.title} ${cfg.journey.accent}\n${cfg.journey.items.map((j, i) => `0${i + 1}. ${j.t}: ${j.d}${j.extra ? ` ${j.extra}` : ""}\n    ${j.b}: ${j.href}`).join("\n")}`);
  if (on("signature")) t.push(`${cfg.signoff}\n\n${cfg.fromName}\n${cfg.fromRole}${soc.length ? `\n${soc.map((s) => `${s.label}: ${s.href}`).join("\n")}` : ""}`);
  if (on("footer"))
    t.push(`© ${site.firma.nume}\nTermeni: ${site.firma.termeni}\nConfidențialitate: ${site.firma.confidentialitate}\nAi primit acest e-mail pentru că ai completat formularul la ${site.eveniment}.`);
  const text = t.join("\n\n");

  /* ---------- piese HTML ---------- */
  const link = (href: string, label: string, color: string = C.teal, extra = "") =>
    `<a href="${esc(href)}" target="_blank" style="color:${color} !important;text-decoration:none;${extra}">${label}</a>`;

  const kicker = (s: string, color: string = C.green) =>
    `<p class="tg" style="margin:0 0 12px;font-family:${M};font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:${color};">${esc(s)}</p>`;

  const chip = (s: string) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.chip}" class="chip" style="background-color:${C.chip};border:1px solid ${C.chipLine};border-radius:999px;padding:5px 11px;font-family:${M};font-size:11px;line-height:14px;letter-spacing:1.5px;text-transform:uppercase;color:${C.teal};">${esc(s)}</td></tr></table>`;

  const btn = (href: string, label: string, o: { bg: string; fg: string; border: string; size?: number; pad?: string }) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${o.bg}" style="background-color:${o.bg};border:1px solid ${o.border};border-radius:10px;mso-padding-alt:0;"><a href="${esc(href)}" target="_blank" style="display:inline-block;padding:${o.pad || "14px 26px"};font-family:${F};font-size:${o.size || 16}px;line-height:20px;font-weight:700;color:${o.fg} !important;text-decoration:none;border-radius:10px;">${label}</a></td></tr></table>`;

  const rule = (color: string = C.line) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" bgcolor="${color}" style="background-color:${color};height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr></table>`;

  /** Logo pe pastilă închisă: rămâne lizibil și când clientul de e-mail inversează culorile. */
  const logo = (l: (typeof cfg.logos)[number]) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.pill}" style="background-color:${C.pill};border-radius:12px;padding:8px 12px;">${
      logos[l.id]
        ? `<img src="cid:${cidOf(l.id)}" width="${l.w}" height="${l.h}" alt="${esc(l.alt)}" style="display:block;width:${l.w}px;height:${l.h}px;border:0;outline:none;color:${C.t1};font-family:${F};font-size:14px;font-weight:700;">`
        : `<span style="font-family:${M};font-size:12px;font-weight:700;letter-spacing:1.5px;color:${C.t1};">${esc(l.badge)}</span>`
    }</td></tr></table>`;

  const cell = (inner: string, pad: string, cls = "px") => `<tr><td class="${cls}" style="padding:${pad};">${inner}</td></tr>`;

  const block: Record<EmailSection, () => string> = {
    header: () => {
      const [a, b] = cfg.logos;
      return `<tr><td class="pxh" style="padding:0 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="left" valign="middle" style="padding:0 0 12px;">${a ? logo(a) : ""}</td>
<td align="right" valign="middle" style="padding:0 0 12px;">${b ? logo(b) : ""}</td>
</tr></table></td></tr>
${cell(rule(C.green), "0 32px")}`;
    },
    hero: () =>
      cell(
        `${kicker(`${site.eveniment} · ${cfg.kicker}`)}
<h1 class="t1 h1" style="margin:0 0 14px;font-family:${F};font-size:32px;line-height:38px;font-weight:800;letter-spacing:-0.5px;color:${C.t1};">${esc(salut)} ${esc(cfg.heroTitle)} <span style="color:${C.teal};">${esc(cfg.heroAccent)}</span></h1>
<p class="t2" style="margin:0 0 ${zipUrl ? 24 : 8}px;font-family:${F};font-size:16px;line-height:25px;color:${C.t2};">${esc(leadLine)} ${undeHtml}</p>
${zipUrl ? btn(zipUrl, "Descarcă fișierul (ZIP)", { bg: C.green, fg: C.bg, border: C.green }) : ""}`,
        "36px 32px 8px",
      ),
    offer: () => {
      const bullets = oferta.bullets
        .map(
          (x) => `<tr>
<td width="18" valign="top" class="tg" style="padding:3px 0 7px;font-family:${F};font-size:15px;line-height:22px;color:${C.green};">&#9679;</td>
<td valign="top" class="t1" style="padding:3px 0 7px;font-family:${F};font-size:15px;line-height:22px;color:${C.t1};">${esc(x)}</td>
</tr>`,
        )
        .join("");
      return cell(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.surf}" class="surf" style="background-color:${C.surf};border:1px solid ${C.line};border-radius:16px;border-collapse:separate;">
<tr><td class="pxs" style="padding:22px 24px 6px;">
<p class="tm" style="margin:0 0 6px;font-family:${M};font-size:11px;line-height:14px;letter-spacing:2px;text-transform:uppercase;color:${C.tm};">Ce primești</p>
<p class="t1" style="margin:0 0 18px;font-family:${F};font-size:21px;line-height:27px;font-weight:800;color:${C.t1};">${esc(oferta.nume)}</p>
${rule()}
</td></tr>
<tr><td class="pxs" style="padding:16px 24px 4px;">${chip("Intră")}
<p class="t1" style="margin:10px 0 0;font-family:${F};font-size:15px;line-height:22px;color:${C.t1};">${esc(oferta.intra)}</p></td></tr>
<tr><td class="pxs" style="padding:18px 24px 4px;">${chip("Iese")}
<p class="t1" style="margin:10px 0 8px;font-family:${F};font-size:15px;line-height:22px;color:${C.t1};">${esc(oferta.iese)}</p></td></tr>
<tr><td class="pxs" style="padding:4px 24px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${bullets}</table></td></tr>
</table>`,
        "28px 32px 8px",
      );
    },
    steps: () => {
      const items = cfg.steps.items
        .map(
          (p, i) => `<tr><td style="padding:${i ? "18px" : "4px"} 0 18px;${i < cfg.steps.items.length - 1 ? `border-bottom:1px solid ${C.line};` : ""}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="44" valign="top" class="tg" style="font-family:${M};font-size:13px;line-height:22px;font-weight:700;letter-spacing:1px;color:${C.green};">0${i + 1}</td>
<td valign="top">
<p class="t1" style="margin:0 0 4px;font-family:${F};font-size:16px;line-height:22px;font-weight:700;color:${C.t1};">${esc(p.t)}</p>
<p class="t2" style="margin:0;font-family:${F};font-size:15px;line-height:23px;color:${C.t2};">${esc(p.d)}</p>
</td></tr></table></td></tr>`,
        )
        .join("");
      return cell(
        `${kicker(cfg.steps.kicker)}
<h2 class="t1 h2" style="margin:0 0 18px;font-family:${F};font-size:24px;line-height:30px;font-weight:800;color:${C.t1};">${esc(cfg.steps.title)} <span style="color:${C.teal};">${esc(cfg.steps.accent)}</span></h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>`,
        "40px 32px 4px",
      );
    },
    journey: () => {
      const n = cfg.journey.items.length;
      const rows = cfg.journey.items
        .map((j, i) => {
          const last = i === n - 1;
          const acc = last ? C.violet : C.green;
          const b = last
            ? btn(j.href, `${esc(j.b)} &rarr;`, { bg: C.violetBtn, fg: C.t1, border: C.violetBtn, size: 14, pad: "12px 18px" })
            : btn(j.href, `${esc(j.b)} &rarr;`, { bg: C.chip, fg: C.teal, border: C.chipLine, size: 14, pad: "12px 18px" });
          const extra = (j as { extra?: string }).extra;
          return `<tr><td style="padding:0 0 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.surf}" class="surf" style="background-color:${C.surf};border:1px solid ${last ? C.violet : C.line};border-radius:14px;border-collapse:separate;">
<tr>
<td width="4" bgcolor="${acc}" style="background-color:${acc};width:4px;border-radius:14px 0 0 14px;font-size:0;line-height:0;">&nbsp;</td>
<td class="pxs" style="padding:18px 20px 20px;">
<p style="margin:0 0 6px;font-family:${M};font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.5px;color:${acc};">0${i + 1}</p>
<p class="t1" style="margin:0 0 4px;font-family:${F};font-size:17px;line-height:23px;font-weight:700;color:${C.t1};">${esc(j.t)}</p>
<p class="t2" style="margin:0 0 ${extra ? 8 : 14}px;font-family:${F};font-size:15px;line-height:22px;color:${C.t2};">${esc(j.d)}</p>
${extra ? `<p style="margin:0 0 14px;font-family:${F};font-size:14px;line-height:21px;color:${C.teal};">${esc(extra)}</p>` : ""}
${b}
</td></tr></table></td></tr>`;
        })
        .join("");
      return cell(
        `${kicker(cfg.journey.kicker)}
<h2 class="t1 h2" style="margin:0 0 20px;font-family:${F};font-size:24px;line-height:30px;font-weight:800;color:${C.t1};">${esc(cfg.journey.title)} <span style="color:${C.teal};">${esc(cfg.journey.accent)}</span></h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`,
        "36px 32px 0",
      );
    },
    signature: () => {
      const socHtml = soc.map((s) => link(s.href, esc(s.label), C.teal, "font-size:13px;")).join(`<span style="color:${C.tm};">&nbsp; · &nbsp;</span>`);
      return cell(
        `${rule()}
<p class="t2" style="margin:24px 0 18px;font-family:${F};font-size:16px;line-height:25px;color:${C.t2};">${esc(cfg.signoff)}</p>
<p class="t1" style="margin:0 0 2px;font-family:${F};font-size:16px;line-height:22px;font-weight:700;color:${C.t1};">${esc(cfg.fromName)}</p>
<p class="tm" style="margin:0 0 10px;font-family:${F};font-size:14px;line-height:20px;color:${C.tm};">${esc(cfg.fromRole)}</p>
${socHtml ? `<p style="margin:0;font-family:${F};font-size:13px;line-height:22px;">${socHtml}</p>` : ""}`,
        "24px 32px 0",
      );
    },
    footer: () =>
      cell(
        `${rule()}
<p class="tm" style="margin:20px 0 6px;font-family:${F};font-size:12px;line-height:18px;color:${C.tm};">© ${esc(site.firma.nume)}&nbsp; · &nbsp;${link(site.firma.termeni, "Termeni", C.tm, "text-decoration:underline;")}&nbsp; · &nbsp;${link(site.firma.confidentialitate, "Confidențialitate", C.tm, "text-decoration:underline;")}</p>
<p class="tm" style="margin:0;font-family:${F};font-size:12px;line-height:18px;color:${C.tm};">Ai primit acest e-mail pentru că ai completat formularul la ${esc(site.eveniment)}.</p>`,
        "32px 32px 8px",
      ),
  };

  const body = sections.map((s) => block[s]()).join("\n");
  const preheader = `${oferta.nume}: ${undeText}`;

  const html = `<!doctype html>
<html lang="ro" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(subject)}</title>
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark;}
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{-ms-interpolation-mode:bicubic;}
a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}
@media (prefers-color-scheme: dark){
  .bg,body{background-color:${C.bg} !important;}
  .surf{background-color:${C.surf} !important;}
  .t1{color:${C.t1} !important;}
  .t2{color:${C.t2} !important;}
  .tm{color:${C.tm} !important;}
  .tg{color:${C.green} !important;}
}
[data-ogsc] .t1{color:${C.t1} !important;}
[data-ogsc] .t2{color:${C.t2} !important;}
[data-ogsc] .tm{color:${C.tm} !important;}
[data-ogsc] .tg{color:${C.green} !important;}
[data-ogsb] .bg{background-color:${C.bg} !important;}
[data-ogsb] .surf{background-color:${C.surf} !important;}
@media only screen and (max-width:620px){
  .card{width:100% !important;}
  .px{padding-left:20px !important;padding-right:20px !important;}
  .pxs{padding-left:16px !important;padding-right:16px !important;}
  .pxh{padding-left:6px !important;padding-right:6px !important;}
  .h1{font-size:26px !important;line-height:32px !important;}
  .h2{font-size:21px !important;line-height:27px !important;}
}
</style>
</head>
<body class="bg" bgcolor="${C.bg}" style="margin:0;padding:0;background-color:${C.bg};color:${C.t1};font-family:${F};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" class="bg" style="background-color:${C.bg};">
<tr><td align="center" style="padding:24px 10px 32px;">
<table role="presentation" class="card bg" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="width:600px;max-width:600px;background-color:${C.bg};">
${body}
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}

/** Notificarea text pentru proprietar, pentru fiecare contact nou. */
export function renderOwner(lead: Lead) {
  const interes = lead.interese.length
    ? lead.interese.map((id) => interese.find((i) => i.id === id)?.label ?? id).join(", ")
    : "doar fișierul";
  return {
    subject: `Contact nou de la ${site.eveniment}: ${lead.nume}`,
    text: `Nume: ${lead.nume}
Companie: ${lead.companie || "(necompletat)"}
E-mail: ${lead.email}
Telefon: ${lead.telefon}
Interes: ${interes}
Când: ${lead.la}
Sursă: ${lead.sursa}`,
  };
}

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** E-mailul pe care îl primește omul imediat după ce completează formularul. */
export async function sendParticipant(lead: Lead) {
  const files = await attachments();
  const url = process.env.ATTACH_URL;
  // SITE_URL îl setează proprietarul (ex. https://domeniu.ro); fără el, butonul de descărcare lipsește.
  const zipUrl = process.env.SITE_URL ? `${process.env.SITE_URL.replace(/\/+$/, "")}/agenti.zip` : "";

  const pub = path.join(process.cwd(), "public");
  const logos: Record<string, boolean> = {};
  const inline: { filename: string; path: string; cid: string; contentDisposition: "inline" }[] = [];
  for (const l of cfg.logos) {
    const p = path.join(pub, `email-logo-${l.id}.png`);
    logos[l.id] = await exists(p);
    if (logos[l.id]) inline.push({ filename: `email-logo-${l.id}.png`, path: p, cid: cidOf(l.id), contentDisposition: "inline" });
  }

  const { subject, html, text } = renderParticipant(lead, {
    zipUrl,
    unde: files.length ? { kind: "atasat" } : url ? { kind: "link", url } : { kind: "separat" },
    logos,
  });

  await transport().sendMail({
    from: from(),
    to: lead.email,
    replyTo: process.env.LEADS_NOTIFY_TO || undefined,
    subject,
    text,
    html,
    attachments: [...files, ...inline],
  });
}

/** Mesajul scurt pe care îl primești tu pentru fiecare contact nou. */
export async function notifyOwner(lead: Lead) {
  const to = process.env.LEADS_NOTIFY_TO;
  if (!to) return;
  const { subject, text } = renderOwner(lead);
  await transport().sendMail({ from: from(), to, replyTo: lead.email, subject, text });
}
