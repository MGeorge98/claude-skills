# kit/backend: formular + e-mail de confirmare

Primește contactul, îl salvează (JSONL), îi scrie omului cu un e-mail brand și îți scrie ție.

## Legare în app-template
1. `kit/app-template/sync-kit.sh <app> --backend` copiază: `api/lead/route.ts` -> `src/app/api/lead/route.ts`,
   `lib/leads.ts` și `lib/email.ts` -> `src/lib/`, `config.example.ts` -> `src/config.ts` și `.env.example`
   (ultimele două doar dacă lipsesc). Re-rulează după o corectură în kit.
2. Completează `src/config.ts` (site, interese, oferta, email) numai din `facts.md`; logo-urile:
   `public/email-logo-<id>.png`, generate cu `scripts/email-logos.cjs`.
3. `next.config.ts` din app-template are deja liniile din `next.config.snippet.ts` (nodemailer, tracing
   pentru `agenti/` și logo-uri); `package.json` are deja `nodemailer` și `@types/nodemailer`.
4. `.env.example` -> `.env.local`; aceleași variabile în Vercel (le pune proprietarul).
5. Formularul (`form-popup`, cheile implicite) trimite JSON: `nume, companie?, email, telefon, interese[], acord: true, website`
   (website = câmp-capcană ascuns, gol). Răspunsuri: `{ok:true, emailed}`, `{ok:false, errors:{nume?,email?,telefon?,acord?}}`,
   `{ok:false, error}`. Contractul complet: CONTRACT.md, "Lead API".
6. Blocurile e-mailului se aleg din `email.sections` (scoate un nume ca să dispară).

## Variabile
Local și Vercel: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `LEADS_NOTIFY_TO`, `SITE_URL`.
Opționale: `ATTACH_DIR` (implicit `agenti/`), `ATTACH_URL`, `SMTP_SECURE`, `LEADS_FILE`.
Gmail: port 587, parolă de aplicație fără spații.

## Cele trei eșecuri văzute
- **500 la trimitere**: nici salvat, nici trimis. Pe Vercel discul e doar pentru citire, deci cauza e aproape mereu lipsa variabilelor SMTP. Verifică env, apoi redeploy.
- **Atașamentul lipsește pe Vercel**: funcția nu are folderul în bundle. Linia `outputFileTracingIncludes` din snippet; calea trebuie să fie ATTACH_DIR.
- **Gmail iOS inversează culorile**: logo-urile stau pe pastile închise (nu transparent pe fundal). Testează cu modul inversat din `preview/render-email.mjs`.

## Test fără trimitere
- Honeypot: `curl -X POST localhost:3050/api/lead -H 'content-type: application/json' -d '{"website":"x"}'` întoarce `{"ok":true}` și nu face nimic.
- Fără SMTP, un corp valid întoarce `{"ok":true,"emailed":false}` și scrie `data/leads.jsonl` (șterge-l după test).
- Previzualizare: din rădăcina app-ului, `node --experimental-strip-types ~/.claude/skills/landing-studio/kit/backend/preview/render-email.mjs` (Playwright prin NODE_PATH pentru capturi; scrie `preview-out/`). Dacă nu rezolvă `@/config`, compilează cu `npx tsc` și setează `RENDERER`.

## Regula proprietarului
Un agent nu trimite niciodată e-mail către contacte reale. Nu rula `sendParticipant` cu adrese reale și nu pune SMTP în mediul unui agent. Trimiterea de test o face omul, către propria adresă.
