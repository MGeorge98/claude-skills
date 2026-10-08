# landing-studio scripts

Plain node `.cjs`, no install. Playwright is resolved from `PW_PATH`, then `NODE_PATH`, then
`./node_modules`, then `/Users/novamatter/GitHub/Landing Page Portfolio/getdapost/node_modules`.
Every script has `--help`. Run from the app folder (where `ls-audit.json` lives); the dev server
must be up (`next dev` exits when stdin closes: start it with `< /dev/null` or in a terminal).

    K=~/.claude/skills/landing-studio/scripts
    node $K/audit.cjs && node $K/perf.cjs && node $K/gate.cjs src --facts facts.md

Run against `next start` on a fresh build. Kill an old server by port first (`lsof -ti tcp:<port> | xargs kill`):
a server that failed to bind leaves the old one answering, and old CSS hashes then 400 (audit fails on it;
perf refuses a page without its scenes or JS).

| Script | What it does |
|---|---|
| `audit.cjs` | Behaviour + visual audit, writes `audit/*.png`, `report.json`, `sheet.png`. `--url`, `--config`, `--out`, `--min-flick`, `--scene SEL\|index`. Exit 1 on failure |
| `perf.cjs` | CDP 390 DPR3 touch: CLS, LCP, throttled LCP (`--no-throttle` skips), JS bytes vs `perf-baseline.json`; paints, layouts, recalcs, long frames per scene; idle at the first scene's end. `--url`, `--config`, `--idle-sel`, `--baseline`. Exit 1 on breach, 2 if the page is not usable |
| `gate.cjs` | Content gate + facts ledger over `src/` (file:line) |
| `sheet.cjs` | Labelled contact sheet from a folder of PNGs (used by audit) |
| `shoot.cjs` | Quick fold shots at 390/1440 for one URL, `--full` for full page |
| `email-preview.cjs` | Email HTML at 640 and 390, light / dark / invert / pureinvert |
| `email-logos.cjs` | Logo onto a dark rounded pill, transparent corners (`--bg --w --pad`) |

## ls-audit.json

    { "url": "http://localhost:3050/",
      "scenes": [{ "sel": "section.pinned-beats[data-scene]", "frames": [0, 0.1, 0.3, 0.5, 0.9, 1] }],
      "hero": { "fields": ["#formular input[name=nume]"] },
      "viewports": [[390, 844], [1440, 900]],
      "reducedMotion": true,
      "minFlick": 8,
      "perf": { "idlePaints": 3, "scrollPaintsPerScene": 120, "layouts": 30, "longFrames": 8,
                "cls": 0.02, "lcpMs": 2500, "jsGrowth": 1.15 } }

`sel` must match exactly one pinned scene. Frame `f` scrolls to `top + f * (height - vh)` and checks
the scene's `--p` is within .03 of `f` (the 800 ms wait covers the smoothing tau).

## What audit checks (any miss = failure)

- Profiles: first viewport (mobile, touch), second viewport (desktop), reduced motion, JS blocked.
- Zero `pageerror` and console errors (mobile, desktop, reduced motion).
- `scrollWidth === innerWidth`.
- After a full glide scroll, `[data-rv]:not(.in)` count is 0 (the list is printed).
- Hero fields end inside the first fold (`bottom <= viewport height`) on the first viewport.
- Flick: 2 s programmatic scroll through each scene, distinct `--p` states (delta > .02) >= `minFlick`.
- Reduced motion: every `[data-rv]` has opacity >= .99.
- JS blocked (aborts `/_next/static/chunks/*`): every `[data-rv]` opaque by 3.9 s (failsafe fires at 3.5 s).

## Thresholds

| Threshold | Default | Source |
|---|---|---|
| idle paints (2 s, parked at the first scene's end) | <= 3 | SPEECH paints.cjs 2026-10-08: parked scenes painted 0 |
| paints per scene scroll (2 s) | <= 120 | ~2x what a healthy 2 s scroll costs (deal 30, story 25 on SPEECH) |
| layouts per scene scroll | <= 30 | SPEECH perf.cjs: healthy scenes 1 to 7 |
| long frames (> 50 ms) | <= 8 | per scene, 2 s |
| flick states | >= 8 | SPEECH fio.cjs; healthy scenes give 38 to 47 |
| CLS (load + scene scrolls) | <= .02 | Vello perf.spec.ts |
| LCP (unthrottled smoke test) | <= 2500 ms | Vello / getdapost perf.spec.ts |
| LCP throttled (`lcpThrottledMs`; 1.6 Mbps down, 750 kbps up, 150 ms RTT, CPU x4, cache off) | <= 2500 ms | The Lighthouse mobile profile and its "good" boundary, so the number compares with PageSpeed. Same values as the Vello gate; getdapost uses a harsher 400 kbps / 400 ms. A project may lower it, never raise it |
| JS bytes | <= perf-baseline.json x 1.15 | Vello / getdapost "never raise the ceiling" |

Set per-project overrides in `ls-audit.json` only when the project has a documented reason.
**Never raise a threshold to make a red run green.** Fix the paint source (perf prints the top
painted nodes) or the failing element instead.
