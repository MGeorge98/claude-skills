import type { CSSProperties } from "react";

/**
 * NetworkBackdrop: a company drawn as a network. First everything runs through the centre (you), then the centre
 * dissolves and pulses travel directly between the nodes. Server-rendered SVG, choreography is CSS only
 * (starts on the first paint). The pulse loops repaint every frame: they pause when the net or the hero carries
 * `.off` (engine: [data-watch]) or html.paused (MotionToggle).
 */
export type NetworkBackdropProps = {
  /** number of nodes on the ring (today 16) */
  nodes?: number;
  /** node index -> label; labelled nodes are drawn bigger */
  labels?: Record<number, string>;
  /** node indices shown below 1024px; default keeps today's 9-node subset for 16 nodes, else even nodes + labelled */
  mobile?: number[];
};

const C = 320;
const R = [262, 178, 286, 196, 250, 168, 276, 204];
const J = [6, -9, 4, -5, 9, -3, -8, 5, 3, -6, 7, -4, -7, 8, -2, 4];
const MOBILE_16 = [0, 2, 3, 5, 6, 9, 11, 12, 14];

const f = (n: number) => n.toFixed(1);
const ms = (n: number) => `${Math.round(n)}ms`;
const v = (o: Record<string, string>) => o as CSSProperties;
const vis = (d: boolean, m: boolean) => (d && m ? "" : d ? " hero-words-xd" : " hero-words-xm");

type Edge = { a: number; b: number; d: boolean; m: boolean };

function build(n: number, labels: Record<number, string>, mobile?: number[]) {
  const mset = new Set(mobile ?? (n === 16 ? MOBILE_16 : Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 0 || labels[i])));
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = ((-96 + (i * 360) / n + J[i % 16]) * Math.PI) / 180;
    const r = R[i % R.length] + J[(i + 5) % 16] * 2;
    return { i, x: C + Math.cos(a) * r, y: C + Math.sin(a) * r, cos: Math.cos(a), sin: Math.sin(a), l: labels[i], m: mset.has(i) };
  });
  const map = new Map<string, Edge>();
  const add = (a: number, b: number, set: "d" | "m") => {
    if (a === b) return;
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    const e = map.get(k) ?? { a, b, d: false, m: false };
    e[set] = true;
    map.set(k, e);
  };
  // desktop: ring + a chord from every third node (offset 5 of 16, scaled)
  const chord = Math.max(2, Math.round((n * 5) / 16));
  for (let i = 0; i < n; i++) {
    add(i, (i + 1) % n, "d");
    if (i % 3 === 0) add(i, (i + chord) % n, "d");
  }
  const mob = nodes.filter((x) => x.m).map((x) => x.i);
  mob.forEach((x, k) => {
    add(x, mob[(k + 1) % mob.length], "m");
    if (k % 2 === 0) add(x, mob[(k + 3) % mob.length], "m");
  });
  const edges = [...map.values()];
  return { nodes, edges, loop: edges.map((e, k) => ({ e, k })).filter(({ k }) => k % 2 === 0) };
}

export default function NetworkBackdrop({ nodes: count = 16, labels = {}, mobile }: NetworkBackdropProps) {
  const { nodes, edges, loop } = build(count, labels, mobile);
  return (
    // data-watch: the engine toggles .off on the net itself, so its loops stop as soon as the net leaves the
    // viewport, even while a tall hero (form under the headline on a phone) is still on screen
    <div className="hero-words-net" data-watch="net" aria-hidden="true">
      <svg className="hero-words-net-svg" viewBox="-60 -40 760 720" fill="none">
        <g>
          {nodes.map((n) => (
            <path key={n.i} className={`hero-words-sp${n.m ? "" : " hero-words-xd"}`} pathLength={100} d={`M${f(n.x)} ${f(n.y)}L${C} ${C}`} style={v({ "--dl": ms(60 + (n.i % 8) * 45) })} />
          ))}
        </g>
        <g>
          {nodes.map((n) => (
            <path key={n.i} className={`hero-words-ip${n.m ? "" : " hero-words-xd"}`} pathLength={100} d={`M${f(n.x)} ${f(n.y)}L${C} ${C}`} style={v({ "--dl": ms(560 + ((n.i * 5) % 7) * 40) })} />
          ))}
        </g>
        <g>
          {edges.map((e, k) => (
            <path
              key={k}
              className={`hero-words-me${vis(e.d, e.m)}`}
              pathLength={100}
              d={`M${f(nodes[e.a].x)} ${f(nodes[e.a].y)}L${f(nodes[e.b].x)} ${f(nodes[e.b].y)}`}
              style={v({ "--dl": ms(1060 + (k % 7) * 70) })}
            />
          ))}
        </g>
        <g>
          {loop.map(({ e, k }, j) => {
            const [p, q] = j % 2 ? [nodes[e.b], nodes[e.a]] : [nodes[e.a], nodes[e.b]];
            return (
              <path
                key={k}
                className={`hero-words-lp${vis(e.d, e.m)}`}
                pathLength={100}
                d={`M${f(p.x)} ${f(p.y)}L${f(q.x)} ${f(q.y)}`}
                style={v({ "--dl": ms(1500 + (j % 5) * 380), "--du": ms(2600 + ((j * 7) % 5) * 520) })}
              />
            );
          })}
        </g>
        <g>
          <circle className="hero-words-void" cx={C} cy={C} r="15" />
          <g className="hero-words-core">
            <circle className="hero-words-halo" cx={C} cy={C} r="30" />
            <circle className="hero-words-dot" cx={C} cy={C} r="11" />
          </g>
        </g>
        <g>
          {nodes.map((n) => (
            <g key={n.i} className={`hero-words-nd${n.m ? "" : " hero-words-xd"}${n.l ? " hero-words-big" : ""}`} style={v({ "--dl": ms(140 + (n.i % 8) * 50) })}>
              <circle className="hero-words-nr" cx={f(n.x)} cy={f(n.y)} r={n.l ? 11 : 7} />
              <circle className="hero-words-nc" cx={f(n.x)} cy={f(n.y)} r={n.l ? 5 : 3.6} />
              {n.l && (
                <text x={f(n.x + n.cos * 22)} y={f(n.y + n.sin * 22 + 4)} textAnchor={n.cos > 0.3 ? "start" : n.cos < -0.3 ? "end" : "middle"}>
                  {n.l}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
