"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./form-popup.css";

/**
 * form-popup: the lead form. Fields from config, honeypot `website`, POST JSON to `endpoint`, server error mapping
 * (per-field `errors` or a general `error`), states idle / sending / done, a success card (optional download) and a
 * confirmation dialog (role=dialog, focus trap, Esc, then scroll to `popup.targetId`, instant under reduced motion).
 */
export type FieldCopy = { label: string; placeholder?: string };
export type ConsentPart = string | { label: string; href: string };

export type FormCopy = {
  fields: { name: FieldCopy; company?: FieldCopy; email: FieldCopy; phone?: FieldCopy };
  interests?: { legend: string; options: { id: string; label: string }[] };
  /** consent sentence; link parts open in a new tab */
  consent: ConsentPart[];
  submit: string;
  sending: string;
  /** small line under the button */
  note?: string;
  errors: { network: string; generic: string };
  done: {
    kicker: string;
    title: string;
    /** when the server answers emailed: false */
    titleNoEmail: string;
    /** "{email}" is replaced by the address, in bold */
    body: string;
    bodyNoEmail: string;
    footnote?: string;
  };
  download?: { label: string; href: string; note?: string };
  popup?: { title: string; titleNoEmail: string; body: string; cta: string; targetId: string };
};

/** JSON keys sent to the endpoint and expected back in `errors` */
export type FormKeys = { name: string; company: string; email: string; phone: string; consent: string; interests: string };
/** the lead API payload of CONTRACT.md and kit/backend/api/lead/route.ts */
export const DEFAULT_KEYS: FormKeys = { name: "nume", company: "companie", email: "email", phone: "telefon", consent: "acord", interests: "interese" };

export type FormPopupProps = {
  endpoint: string;
  copy: FormCopy;
  /** id of the form / success card, used as scroll target and focus return (today "formular") */
  id?: string;
  keys?: Partial<FormKeys>;
  /** merged into the payload, e.g. { source: "qr" } */
  extra?: Record<string, unknown>;
};

type Field = "name" | "email" | "phone" | "consent";
type Errors = Partial<Record<Field, string>>;

const fill = (s: string, email: string): ReactNode => {
  const [a, b] = s.split("{email}");
  return b === undefined ? s : (
    <>
      {a}
      <b>{email}</b>
      {b}
    </>
  );
};

export default function FormPopup({ endpoint, copy, id = "formular", keys: k0, extra }: FormPopupProps) {
  const keys = { ...DEFAULT_KEYS, ...k0 };
  const [v, setV] = useState({ name: "", company: "", email: "", phone: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [general, setGeneral] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [emailed, setEmailed] = useState(true);
  const [pop, setPop] = useState(false);
  const set = (f: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [f]: e.target.value }));
  const toggle = (x: string) => setPicked((a) => (a.includes(x) ? a.filter((y) => y !== x) : [...a, x]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setErrors({});
    setGeneral("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...extra,
          [keys.name]: v.name,
          ...(copy.fields.company && { [keys.company]: v.company }),
          [keys.email]: v.email,
          ...(copy.fields.phone && { [keys.phone]: v.phone }),
          [keys.consent]: consent,
          ...(copy.interests && { [keys.interests]: picked }),
          website: v.website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setEmailed(data.emailed !== false);
        setState("done");
        if (copy.popup) setPop(true);
        return;
      }
      if (data.errors && typeof data.errors === "object") {
        const m: Errors = {};
        // only fields this form renders; an error for a hidden field becomes the general alert
        (["name", "email", "phone", "consent"] as Field[]).filter((f) => f !== "phone" || copy.fields.phone).forEach((f) => {
          const msg = data.errors[keys[f]];
          if (typeof msg === "string") m[f] = msg;
        });
        setErrors(m);
        if (!Object.keys(m).length) setGeneral(copy.errors.generic);
      } else setGeneral(typeof data.error === "string" ? data.error : copy.errors.generic);
    } catch {
      setGeneral(copy.errors.network);
    }
    setState("idle");
  }

  if (state === "done") {
    const d = copy.done;
    return (
      <>
        {pop && copy.popup && <Done popup={copy.popup} download={copy.download} emailed={emailed} formId={id} onClose={() => setPop(false)} />}
        <div id={id} className="form-popup-card form-popup-done" role="status" tabIndex={-1}>
          <p className="form-popup-kicker">{d.kicker}</p>
          {copy.download && (
            <>
              <a href={copy.download.href} download className="form-popup-btn">
                {copy.download.label}
              </a>
              {copy.download.note && <p className="form-popup-small">{copy.download.note}</p>}
            </>
          )}
          <h2 className="form-popup-done-t">{emailed ? d.title : d.titleNoEmail}</h2>
          <p className="form-popup-done-d">{fill(emailed ? d.body : d.bodyNoEmail, v.email)}</p>
          {d.footnote && <p className="form-popup-small form-popup-foot">{d.footnote}</p>}
        </div>
      </>
    );
  }

  const F = copy.fields;
  const err = (f: Field) =>
    errors[f] ? (
      <p id={`${id}-${f}-err`} className="form-popup-err">
        {errors[f]}
      </p>
    ) : null;
  const aria = (f: Field) => (errors[f] ? { "aria-invalid": true, "aria-describedby": `${id}-${f}-err` } : {});

  return (
    <form id={id} onSubmit={submit} noValidate className="form-popup-card">
      <div className="form-popup-grid">
        <div>
          <label htmlFor={`${id}-name`} className="form-popup-label">{F.name.label}</label>
          <input id={`${id}-name`} name={keys.name} autoComplete="name" className="form-popup-field" placeholder={F.name.placeholder} value={v.name} onChange={set("name")} {...aria("name")} />
          {err("name")}
        </div>
        {F.company && (
          <div>
            <label htmlFor={`${id}-company`} className="form-popup-label">{F.company.label}</label>
            <input id={`${id}-company`} name={keys.company} autoComplete="organization" className="form-popup-field" placeholder={F.company.placeholder} value={v.company} onChange={set("company")} />
          </div>
        )}
        <div>
          <label htmlFor={`${id}-email`} className="form-popup-label">{F.email.label}</label>
          <input id={`${id}-email`} name={keys.email} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" className="form-popup-field" placeholder={F.email.placeholder} value={v.email} onChange={set("email")} {...aria("email")} />
          {err("email")}
        </div>
        {F.phone && (
          <div>
            <label htmlFor={`${id}-phone`} className="form-popup-label">{F.phone.label}</label>
            <input id={`${id}-phone`} name={keys.phone} type="tel" inputMode="tel" autoComplete="tel" className="form-popup-field" placeholder={F.phone.placeholder} value={v.phone} onChange={set("phone")} {...aria("phone")} />
            {err("phone")}
          </div>
        )}

        {/* honeypot: invisible to people, bots fill it */}
        <div className="form-popup-hp" aria-hidden="true">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
          </label>
        </div>

        {copy.interests && (
          <fieldset className="form-popup-set">
            <legend className="form-popup-label">{copy.interests.legend}</legend>
            <div className="form-popup-opts">
              {copy.interests.options.map((o) => {
                const on = picked.includes(o.id);
                return (
                  <label key={o.id} className={`form-popup-opt${on ? " form-popup-opt-on" : ""}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle(o.id)} />
                    <span>{o.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <label className="form-popup-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} {...aria("consent")} />
          <span>
            {copy.consent.map((p, i) =>
              typeof p === "string" ? (
                <span key={i}>{p}</span>
              ) : (
                <a key={i} href={p.href} target="_blank" rel="noreferrer">
                  {p.label}
                </a>
              ),
            )}
          </span>
        </label>
        {err("consent")}

        {general && (
          <p className="form-popup-err" role="alert">
            {general}
          </p>
        )}

        <button type="submit" className="form-popup-btn" disabled={state === "sending"}>
          {state === "sending" ? copy.sending : copy.submit}
        </button>
        {copy.note && <p className="form-popup-small form-popup-center">{copy.note}</p>}
      </div>
    </form>
  );
}

/** the dialog after a successful submit: confirmation and the way forward */
function Done({
  popup,
  download,
  emailed,
  formId,
  onClose,
}: {
  popup: NonNullable<FormCopy["popup"]>;
  download?: FormCopy["download"];
  emailed: boolean;
  formId: string;
  onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const go = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    go.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  const close = (toTarget: boolean) => {
    onClose();
    const rm = document.documentElement.classList.contains("rm");
    requestAnimationFrame(() => {
      if (toTarget) document.getElementById(popup.targetId)?.scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "start" });
      else document.getElementById(formId)?.focus({ preventScroll: true });
    });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close(false);
    } else if (e.key === "Tab") {
      const f = Array.from(box.current?.querySelectorAll<HTMLElement>("a[href],button") ?? []);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  };
  return createPortal(
    <div className="form-popup-pop" onKeyDown={onKey}>
      <div className="form-popup-pop-bg" onClick={() => close(false)} aria-hidden="true" />
      <div ref={box} className="form-popup-pop-box" role="dialog" aria-modal="true" aria-labelledby="form-popup-pop-t" aria-describedby="form-popup-pop-d">
        <span className="form-popup-pop-ok" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
          </svg>
        </span>
        <h2 id="form-popup-pop-t" className="form-popup-pop-t">
          {emailed ? popup.title : popup.titleNoEmail}
        </h2>
        <p id="form-popup-pop-d" className="form-popup-pop-d">
          {popup.body}
        </p>
        <button ref={go} type="button" className="form-popup-btn form-popup-pop-go" onClick={() => close(true)}>
          {popup.cta} <span aria-hidden="true">→</span>
        </button>
        {download && (
          <a href={download.href} download className="form-popup-pop-dl">
            {download.label}
          </a>
        )}
      </div>
    </div>,
    document.body,
  );
}
