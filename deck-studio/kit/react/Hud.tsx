import type { CSSProperties } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** The hud (bottom right, mono): slide / total, the digits typed for a jump, a thin progress bar.
 *  `H` hides it (html.hud-off); hidden in ?print, without JS and in the presenter view. */
export default function Hud({ slide, total, jump }: { slide: number; total: number; jump: string }) {
  const p = total > 1 ? slide / (total - 1) : 1;
  return (
    <>
      <div className="deck-hud" aria-hidden="true">
        <span className="deck-hud-jump">{jump ? `${jump} ↵` : ""}</span>
        <span>
          {pad(slide + 1)} / {pad(total)}
        </span>
      </div>
      <div className="deck-progress" aria-hidden="true" style={{ ["--p" as string]: p } as CSSProperties}>
        <i />
      </div>
    </>
  );
}

export const KEYS: [string, string][] = [
  ["→  Space  Enter  PgDn  click", "înainte (pasul următor, apoi slide-ul următor)"],
  ["←  PgUp  Backspace", "înapoi"],
  ["Home  End", "primul / ultimul slide"],
  ["cifre, apoi Enter", "sari la slide-ul cu numărul acela"],
  ["F", "ecran complet"],
  ["H", "ascunde / arată contorul"],
  ["P", "fereastra pentru prezentator (note, următorul slide, timp)"],
  ["T", "în fereastra prezentatorului: repornește cronometrul"],
  ["+  -  0", "mărește / micșorează / potrivește scena"],
  ["?", "lista asta (Esc o închide)"],
];

/** The key list, shown with `?` (html.keys-on). */
export function KeyList() {
  return (
    <div className="deck-keys" role="dialog" aria-label="Taste">
      <dl>
        {KEYS.map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
