# tour-studio kit

A complete Next.js 15 skeleton (Tailwind 3, framer-motion, lucide-react; no backend) with the cursor-mode tour engine.

```bash
SK=~/.claude/skills/tour-studio/kit; APP=~/GitHub/<slug>-demo
mkdir -p "$APP" && cp -R "$SK/." "$APP/" && rm "$APP/README.md"
cd "$APP" && npm pkg set config.port=<port>   # the ONE place the port lives; dev and start read it
cp -Rc <sibling-demo>/node_modules . 2>/dev/null || npm install
npm run typecheck && npm run build && npm run dev   # http://localhost:<port>/ → "Începe turul"
```
`cp -Rc` clones a sibling demo's node_modules (same pinned deps) when there is no network.
Use these pinned versions; a fresh `create-next-app` gives Tailwind 4, which ignores `tailwind.config.ts`.

| File | Edit it for each demo? |
|---|---|
| `components/tour.tsx` | No. The engine (cursor, beats, caption, ring, keys, phone sheet, reduced motion). `TOP`, `PHONE`, `CARD_W` at the top |
| `lib/tour.ts` | Yes: `CHAPTERS`, `STEPS` (moment, route, before beats, target, ring, setup), `MINUTES` |
| `lib/demo-state.ts` | Yes: the fields your screens change + `clock`; keep `typed` (one buffer per field id) / `typing` (the engine writes them) |
| `lib/tour-strings.ts` | Only for another language or the landing's CTA wording (`cta`, `ctaNote`) |
| `lib/config.ts` | Yes: product name, invented company, `CTA_HREF` (the landing's demo form) |
| `components/tour-ui.tsx` | Restyle `btn` to the source app's buttons; `BrandMark` is initials |
| `components/step-list.tsx` | No. Steps with their moments, on the start and final screens |
| `app/globals.css`, `tailwind.config.ts` | Yes: token VALUES from the source app; keep the names. `--pointer` / `--pointer-edge` colour the cursor and the moment pill, `--ring` / `--ring-glow` the outline |
| `app/layout.tsx` | Yes: the source app's font as `--font-sans` (globals.css has a system fallback) |
| `app/page.tsx`, `app/final/page.tsx` | Yes: the pain image, promise, recap, from the approved story |
| `app/exemplu/`, `components/example.tsx` | Delete when the real screens exist. They show the pattern: hover beat, a click that changes state, a typing beat, clock-driven rows, computed figures |
| `package.json` | Only `config.port` (unique per demo), via `npm pkg set config.port=<port>` |
| `scripts/shots.py` | No. Fallback walk: `python3 scripts/shots.py <port> <folder>` |
| `app/icon.svg` | Replace initials and colour |

Wiring rules:
- Every id is a `data-tour="…"` attribute. `target` = the small thing the cursor clicks (a real button that calls
  `setDemo`); `ring` = the whole card/table/panel the step is about. Pass `data-tour` through shared components.
- On every step the engine runs `resetDemo(step.setup)`: put everything the screen needs at that moment in `setup`.
- A typing beat clicks its target, then writes `typed[<target>]` letter by letter: bind each input's `value` to
  `typed["<its data-tour id>"] ?? ""`, so one step can fill several fields.
- `until: "<id or selector>"` on a beat (or a step, for its final click) waits for the screen's own animation/reply.
- Horizontal scroll panes: put `data-sticky` on the sticky label column so targets are revealed beside it.
- The step is `?pas=N`. `/` and `/final` show no "Reia turul" button; every other page does.
- `<Tour />` sits in `app/layout.tsx` inside `<Suspense>` (useSearchParams); keep it there.
- A client view cannot export `metadata`: keep `page.tsx` a server file that renders it.
