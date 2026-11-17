# Worked example: from feature list to one story (phase 2)

Product: PlayPass, booking and venue software for sports venues (Romanian market). The demo shows the operator
interface on an invented venue, **Arena Demo**; every person, booking and figure is invented. The owner approved
the third version below as the standard.

## Where the words came from

The product's landing (marketing copy in the source repo, then the live site) gave:
- **Promise** (hero): „Sistemul de operare al bazei tale sportive.”
- **Pain image** (its "with vs without" section): „Joi seara, la bază. La 23:04 ai trei apeluri pierdute.”
  versus „Aceeași joi, cu PlayPass. La 23:04 telefonul tace.”
- **Buyer's words** reused in captions: „Încasezi cum lucrezi deja”, „ce teren aduce bani”, „îi chemi înapoi”,
  „Raportul … pleacă la contabil dintr-un clic”, „nu trimite nimic fără «Da»-ul tău”, „acces 24/7 și lumini automate”.
- **CTA**: „Programează un demo”, linking to the landing's own demo form (route `/demo`, anchor `#demo`, found in
  the marketing source), plus its line „Răspundem în cel mult o zi lucrătoare”.
- No result figures on the landing, so none in the demo.

## Three versions of the same tour

| v1: 12 steps, label titles (rejected) | v2: 7 features from the landing (better) | v3: one day in time (approved) |
|---|---|---|
| Încasările zilei, fără să suni la recepție | Ziua bazei, dintr-o privire | **Joi, 23:04** · Rezervarea a intrat singură |
| Fiecare teren, cu poarta și luminile la un clic | Un calendar pentru întreaga bază | **Vineri, 07:00** · Dimineața știi deja cum arată ziua |
| Toate terenurile, pe aceeași zi | Încasezi cum lucrezi deja | **Vineri, 18:30** · Încasezi cum lucrezi deja |
| Echipele fixe își păstrează ora | Vezi ce teren aduce bani | **Vineri, 21:00** · Seara, baza merge și fără tine |
| Preț diferit seara, în weekend sau pentru membri | Îți cunoști jucătorii și îi chemi înapoi | **Sfârșit de lună** · Vezi care teren aduce banii |
| Afli de problemă înaintea clientului | Asistentul întreabă întâi | **Luna următoare** · Îi chemi înapoi pe cei care n-au mai venit |
| … (+6 more, each with „Se poate adapta: …”) | Acces 24/7 și lumini automate | **Luna următoare** · Umpli orele goale de mâine |

What changed:
- v1 → v2: only what the landing promises (rules tables, incidents, equipment status dropped); no
  customisation lines; wording taken from the landing.
- v2 → v3: the steps became **moments of one day**, in order, so the start screen's 23:04 pain is paid off by
  step 1. Titles became **outcomes** ("Rezervarea a intrat singură") instead of screen or feature names
  ("Un calendar pentru întreaga bază").

## The approved story (v3)

Chapters: „Cât dormi” · „Peste zi” · „La sfârșit de lună” · „Ca să crești”.

| # | Moment | Screen | Cursor does | Ring (whole block) | Body (≤ 30 words) |
|---|---|---|---|---|---|
| 1 | Joi, 23:04 | Calendar (Friday, „mâine”) | opens the padel booking made from the app | the booking drawer, showing „Rezervat joi, 23:04 · din aplicație”, paid by card | La 23:04, cineva și-a luat terenul de padel pentru a doua zi și a plătit cu cardul, din aplicație. Tu n-ai răspuns la niciun telefon. |
| 2 | Vineri, 07:00 | Astăzi | hovers the three day figures, clicks one booking on the board | the whole courts board (title, legend, time axis, all 7 courts) | Cât s-a încasat, ce mai ai de încasat la recepție și cât de plină e baza. Pe tablou vezi fiecare teren, oră cu oră. |
| 3 | Vineri, 18:30 | Calendar, booking drawer | clicks „Confirmă încasarea” → „Încasat” | the drawer | Jucătorul plătește cash la recepție, iar tu apeși „Confirmă încasarea”. Suma apare în ziua de azi, lângă plățile cu cardul, nu pe un caiet. |
| 4 | Vineri, 21:00 | Court → access panel | turns the „acces 24/7 și lumini automate” rule on; gate and lights switch to automatic | the access panel | Jucătorul deschide poarta din aplicație. Luminile se aprind înainte de meci și se sting după. Nu stă nimeni la poartă. |
| 5 | Sfârșit de lună | Rapoarte | hovers income per court, clicks „Trimite contabilului” → „Trimis” | the monthly report card | Încasările lunii, pe fiecare teren. Raportul pleacă la contabil dintr-un clic, fără tabele făcute de mână. |
| 6 | Luna următoare | Clienți | clicks the „Inactivi” filter, then „Trimite către 4” | the clients table (with the campaign strip inside it) | Vezi cine n-a mai rezervat de peste 90 de zile și le trimiți o ofertă. Pleacă doar la cei care au acceptat mesaje de la tine. |
| 7 | Luna următoare | Asistent | types „Câte ore libere am mâine?”, sends, clicks „Da” on the proposed offer | the conversation card | Întrebi asistentul ca pe un coleg, iar el răspunde din calendarul tău. Propune o ofertă pentru orele libere, dar nu trimite nimic fără „Da”-ul tău. |

Start screen: the two 23:04 cards side by side (three missed calls with masked numbers / „telefonul tace”:
notifications paused, the day's summary at 07:00), then the promise, then „Urmărim o zi la Arena Demo, de joi
seara până la raportul de la sfârșitul lunii.”, the start button and the step list with moments.

Final screen recap (3 lines), then the one CTA:
- Rezervările intră și noaptea, fără telefon.
- Fiecare leu e lângă rezervarea lui, cash sau card.
- Raportul lunii ajunge la contabil dintr-un clic.

## What the story forced on the mock data

- **The app's clock is part of each step's state**: step 1 has no "now" (Thursday night, the calendar shows
  Friday as „mâine”); steps 2-4 set 07:00, 18:30 and 21:00, which move the now line, the live courts and the
  day's figures. Opening `?pas=3` cold shows 18:30 with the drawer open and unpaid.
- **Nothing before it happens**: the 18:30 desk booking and the 18:00 walk-in carry a "known from" time and are
  absent from step 1 and step 2.
- **Figures computed from the bookings**: paid by card at booking, walk-ins once they arrive, desk cash once
  confirmed; occupancy = booked hours / court-hours. A first pass gave 25 % occupancy, which undersold the
  product; more believable Friday bookings (evenings full) brought it to about 65 %, and the six previous days
  and the monthly report were scaled to match.
- **Labels agree with the story**: the mock "today" became Friday; teams named after Thursday were renamed;
  the offer's end date and the report's month moved to fit "end of month" and "next month".
