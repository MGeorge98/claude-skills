# form-popup

The lead form ("use client"): configurable fields, interests, consent with legal links, honeypot, POST JSON to an
endpoint, per-field server errors, a success card with optional download, and a confirmation dialog that then
scrolls to the next chapter.

## When to use
Any page that collects a lead. Drop it into hero-words' `right` slot for first-screen conversion, or in its own
section further down.

## Props
| name | type | default | drives |
|---|---|---|---|
| `endpoint` | string | required | POST target, JSON body |
| `copy` | `FormCopy` | required | every visible string (below) |
| `id` | string | "formular" | id of the form / success card: anchor target, focus return after the dialog |
| `keys` | Partial<FormKeys> | nume, companie, email, telefon, acord, interese | JSON keys sent, expected back in `errors`, and the inputs' `name` attributes (`#formular input[name=nume]`) |
| `extra` | Record | none | merged into the payload (e.g. `{ source: "qr" }`) |

`FormCopy`: `fields.name/email` required, `fields.company/phone` optional (omit to hide), `interests`
`{legend, options[{id,label}]}` optional, `consent: (string | {label, href})[]`, `submit`, `sending`, `note`,
`errors.network/generic`, `done {kicker, title, titleNoEmail, body, bodyNoEmail, footnote}` (`{email}` is
replaced by the address in bold), `download {label, href, note}` optional, `popup {title, titleNoEmail, body,
cta, targetId}` optional (omit for no dialog).

## Server contract (CONTRACT.md "Lead API", served by kit/backend/api/lead/route.ts)
Request: `{ nume, companie?, email, telefon, acord: true, interese: string[], website }` plus `extra`
(`website` is the honeypot; the server answers `{ ok: true }` and drops it). Response: `{ ok: true, emailed }`,
or `{ ok: false, errors: { nume?, email?, telefon?, acord? } }` (400, mapped under the fields), or
`{ ok: false, error }` (400 / 429 / 500, general alert). An error for a field the form does not render, non-JSON
-> `errors.generic`; network failure -> `errors.network`. The default backend requires `telefon`: keep the phone
field, or relax the route.

## Mobile
Full width card, 16px inputs (no iOS zoom), 44px+ option rows, 52px submit; the dialog is `min(100%, 460px)`.

## Reduced motion / no JS
Nothing is hidden. The dialog's entry animations are gated `html.js:not(.rm)`; after the dialog the scroll to
`targetId` is instant under `html.rm`. Without JS the form renders but does not submit (no `action`); a no-JS
fallback is out of scope for v1.

## Verification frames
- settled: labels, inputs, consent links underlined, submit visible; at 1440x900 inside the hero, submit above
  the fold.
- submit empty (server errors): red border + message under name / email / phone / consent, focus stays.
- success: dialog centred, focus on the CTA, Tab cycles CTA <-> download, Esc closes and focuses the card,
  CTA scrolls to `targetId`; the success card shows the download button and the address in bold.

## Gotchas (from 2026-10-08)
- The honeypot is visually hidden by clip, not `display: none` (some bots skip display:none fields).
- `body.style.overflow` is restored on close; the dialog is portalled to `body` so pinned scenes' `contain`
  and `overflow: hidden` cannot clip it.
- Error ids are namespaced by `id`; two forms on one page need different `id`s.
- Copy: no em dashes, diacritics kept, consent must name the data controller from the facts ledger.
