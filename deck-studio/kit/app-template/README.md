# Deck

Prezentare web: o singură aplicație Vite, o singură adresă, merge și fără internet.

## Cum o pornești

Varianta rapidă: deschide `dist/index.html` cu dublu-click (după `npm run build`). Nu are nevoie de server.

Varianta de lucru:

    npm install
    npm run dev                    # http://localhost:5180  (alt port: PORT=5181 npm run dev < /dev/null)
    npm run build                  # dist/index.html, un singur fișier, cu slide-urile prerandate
    npx vite preview --port 5190   # servește dist/ pentru audit și export

## Taste

- `→`, `Space`, `Enter`, `PageDown` sau click pe slide: înainte (întâi pașii de pe slide, apoi slide-ul următor)
- `←`, `PageUp`, `Backspace`: înapoi
- `Home` / `End`: primul / ultimul slide
- cifre, apoi `Enter`: sari la slide-ul cu numărul acela (`1`, `2`, `Enter` = slide-ul 12)
- `F`: ecran complet
- `H`: ascunde / arată contorul din colț
- `P`: deschide fereastra prezentatorului (slide-ul curent, următorul, notele, cronometrul); `T` acolo repornește cronometrul
- `+` / `-` / `0`: mărește / micșorează / potrivește scena
- `?`: lista tastelor (`Esc` o închide)

Click-urile pe linkuri, butoane, iframe-uri și video cu controale nu schimbă slide-ul.

Poziția stă în adresă: `#7` e slide-ul 7, `#7.2` e pasul 2 de pe slide-ul 7. Un refresh te lasă unde erai.
Cele două ferestre (sala și prezentatorul) se mișcă împreună; închide alte taburi cu același deck, se sincronizează și ele.

## Adrese utile

- `?presenter`: fereastra prezentatorului
- `?print`: toate slide-urile unul sub altul, câte o pagină de 1920 x 1080, cu toți pașii
- `?preview`: câte un slide din fiecare tip folosit (`?preview=cascade-list`: variantele unui tip)
- `?rm`: fără animații (la fel ca setarea de sistem „reduce motion”)

## Unde schimbi lucrurile

- Ordinea, textele și notele: `src/deck.tsx`. Fiecare nume, număr și citat vine din `facts.md`.
- Culorile și fonturile: blocul brand din `src/styles/tokens.css`. Logo-ul: `public/logo.svg`.
- Limba și titlul paginii: `.env` (`VITE_DECK_LANG`, `VITE_DECK_TITLE`).
- `src/kit/`, `src/styles/deck.css`, `src/slides/registry.ts` și `src/preview-deck.tsx` vin din kit: nu le edita aici,
  rulează din nou `~/.claude/skills/deck-studio/kit/app-template/sync-kit.sh . --slides <tipuri>`.

## Audit și export

    SK=~/.claude/skills/deck-studio/scripts
    node $SK/audit.cjs --url http://localhost:5190/     # audit/sheet.png, audit/report.json
    node $SK/export.cjs --url http://localhost:5190/    # deck.pdf și slides/<nn>.png
    node $SK/gate.cjs src --facts facts.md
