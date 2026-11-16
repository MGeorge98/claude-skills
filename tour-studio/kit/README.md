# tour-studio kit

A complete Next.js 15 skeleton (Tailwind 3, framer-motion, lucide-react; no backend) with the tour engine.

```bash
SK=~/.claude/skills/tour-studio/kit; APP=~/GitHub/<slug>-demo
mkdir -p "$APP" && cp -R "$SK/." "$APP/" && rm "$APP/README.md"
cd "$APP" && cp -Rc <sibling-demo>/node_modules . 2>/dev/null || npm install
npm run typecheck && npm run build && npm run dev   # http://localhost:3210/exemplu?pas=1
```
`cp -Rc` clones a sibling app's node_modules (same pinned deps) when there is no network.
Use these pinned versions; a fresh `create-next-app` gives Tailwind 4, which ignores `tailwind.config.ts`.

| File | Edit it for each demo? |
|---|---|
| `components/tour.tsx` | No. The engine. Fix bugs here and in the skill. Header offset `TOP`, phone breakpoint `PHONE` |
| `components/tour-ui.tsx` | Restyle `btn` to the source app's buttons; `BrandMark` is initials |
| `lib/tour.ts` | Yes: `CHAPTERS`, `STEPS` (3 placeholders), `MINUTES` |
| `lib/tour-strings.ts` | Only for another language (one file) |
| `package.json` | Yes: set the `dev` port, `-p <port>` (unique per demo; 3210 is a placeholder) |
| `scripts/shots.py` | No. Fallback screenshot walk when the Playwright MCP is busy |
| `lib/config.ts` | Yes: product name, invented company, contact, mailto |
| `app/globals.css`, `tailwind.config.ts` | Yes: token VALUES from the source app; keep the names; `--accent-text` dark when the accent is fill-only |
| `app/layout.tsx` | Yes: the source app's font as `--font-sans` |
| `app/page.tsx`, `app/final/page.tsx` | Yes: promise, final line, `ADAPT` list, CTA |
| `app/exemplu/` | Delete when the real mock screens exist |
| `app/icon.svg` | Replace initials and colour |

Wiring rules:
- A step's `target` is a `data-tour="…"` attribute on the page at `route`. Pass `data-tour` through
  your components (`...rest`) or wrap the element in a `<div data-tour>`.
- The step is `?pas=N`. `/` and `/final` show no "Reia turul" button; every other page does.
- `<Tour />` sits in `app/layout.tsx` inside `<Suspense>` (useSearchParams); keep it there.
- A client page cannot export `metadata`: give it a `layout.tsx` that does.
- Keys: ← → Esc. Reduced motion: tweens drop to 0 ms, scrolls jump.
