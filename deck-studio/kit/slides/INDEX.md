# Slide catalogue

Each type lives in `kit/slides/<type>/` with `slide.md`, `<Type>.tsx`, `<type>.css` (classes prefixed `.<type>-`),
`data.example.ts` ("Exemplu" copy, Romanian, diacritics) and `preview.tsx`. In the app: `src/slides/<type>/`.

| type | one line | steps | status |
|---|---|---|---|
| `title` | Talk title in word masks, speaker line, event and date in mono, logo, optional glow. | 0 | v1 |
| `cascade-list` | A kicker, a point, 3 to 6 rows revealed one per step, optional closing line as the last step. | rows + 0..1 | v1 |
| `section` | Chapter divider: mono number (solid or outline), chapter name in word masks, one line, optional glow; left or centre. | 0 | v2 |
| `agenda` | Chapter ladder; `current` lights one chapter and marks earlier ones done; `stepped` reveals one per step. | 0 or chapters | v2 |
| `big-number` | One number at 320px counting up on its step, meaning and mono source note; `immediate` skips the count. **Value from a verified facts.md line.** | 1 (0 immediate) | v2 |
| `quote` | A 64px quote with accent mark in word masks, then attribution and role; optional round portrait; under 24 words. | 1 (0 immediate) | v2 |
| `two-up` | Two columns (before/after, us/them, problem/solution), the right one as a step, optional verdict row; `mode: swap` replaces in place. | 1..2 | v2 |
| `image-full` | Full-bleed image with a scrim (bottom, left, none); kicker and title in word masks, mono caption as a step. | 0..1 | v2 |
| `screenshot-zoom` | Screenshot in a frame, up to 4 regions; each step zooms to one with a label pill and note; print lists the regions. | regions | v2 |
| `video` | Framed 16:9 muted clip with a poster, played on enter, paused on leave and under rm; mono caption; sound via a visible control only. | 0 | v2 |
| `code` | Mono block with line numbers; each step lights a line range and shows its caption; print shows every range. | ranges | v2 |
| `timeline` | 3 to 7 moments on a horizontal line revealed per step, segments draw, the last one is the hero. | moments | v2 |
| `demo` | Live iframe in a framed card with a URL bar and badge; fallback screenshot until the page is confirmed and in print; `data-no-nav`. | 0 | v2 |
| `closing-qr` | The action: point, QR in a white card (never recoloured), URL in mono, contact and logo; `revealQr` makes the card a step. | 0..1 | v2 |

Example media a type needs lives in `kit/slides/<type>/public/` and `sync-kit.sh` copies it into the app `public/`
when missing (video, screenshot-zoom, demo, closing-qr). Example `src` paths are relative (`exemplu-video.mp4`), so
`dist/index.html` works from disk (`base: "./"`).
