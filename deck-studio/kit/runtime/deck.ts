/* deck-studio · runtime (kit-owned). Framework-free: it drives the DOM that <Deck> renders.
   State { slide, step }. The DOM is the source of the shape: every `.slide` directly inside `root`,
   its step count in `data-steps`, its steps as `[data-step="k"]`. The runtime sets `.in` on every step
   with k <= step (swap groups keep only their newest member), `.is-current` / `.is-leaving` on sections,
   html classes (`deck-ready`, `print`, `hud-off`, `keys-on`), `--deck-scale` on every `.deck-viewport`,
   and the hash `#n` / `#n.k`. One resize listener (rAF-debounced), one keydown, one click, one hashchange. */

export type DeckState = { slide: number; step: number };
export type DeckSnapshot = DeckState & { total: number; steps: number; jump: string; startedAt: number | null };
export type DeckMode = "deck" | "presenter" | "print";

export interface DeckOptions {
  /** channel name suffix: BroadcastChannel("deck:<id>") */
  id: string;
  /** the element whose direct `.slide` children are the deck (the `.deck-stage`) */
  root: HTMLElement;
  mode?: DeckMode;
  onChange?: (s: DeckSnapshot) => void;
}

export interface DeckApi {
  state(): DeckSnapshot;
  total(): number;
  stepsOf(slide: number): number;
  next(): void;
  prev(): void;
  go(slide: number, step?: number, opts?: { remote?: boolean; animate?: boolean }): void;
  /** re-apply gating after a render (idempotent, no animation restarts) */
  sync(): void;
  fit(): void;
  resetTimer(): void;
  destroy(): void;
}

const W = 1920, H = 1080;
const NO_NAV = "a, button, input, select, textarea, label, iframe, video[controls], audio[controls], [data-no-nav], [contenteditable]";
const ZOOM_MIN = 0.5, ZOOM_MAX = 2, ZOOM_STEP = 0.05;

function parseHash(h: string): DeckState | null {
  const m = /^#(\d+)(?:\.(\d+))?$/.exec(h);
  return m ? { slide: Number(m[1]) - 1, step: Number(m[2] ?? 0) } : null;
}

function cssMs(name: string, fallback: number): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!v) return fallback;
  const n = parseFloat(v);
  return v.endsWith("ms") ? n : n * 1000;
}

export function createDeck(opts: DeckOptions): DeckApi {
  const { id, root } = opts;
  const mode: DeckMode = opts.mode ?? "deck";
  const html = document.documentElement;
  const rm = () => html.classList.contains("rm");

  // a late mount (after the 3.5 s failsafe) takes the stage back
  html.classList.remove("deck-static");
  html.classList.add("js");
  if (mode === "print") html.classList.add("print");
  if (mode === "presenter") html.classList.add("presenter");

  const sections = () => Array.from(root.querySelectorAll<HTMLElement>(":scope > .slide"));
  const total = () => sections().length;
  const stepsOf = (i: number) => Math.max(0, Number(sections()[i]?.dataset.steps ?? 0) || 0);

  let cur: DeckState = { slide: -1, step: 0 };
  let zoom = 1;
  let jump = "";
  let jumpTimer = 0;
  let startedAt: number | null = null;
  const leaveTimers = new Map<HTMLElement, number>();
  const instance = Math.random().toString(36).slice(2);

  const snapshot = (): DeckSnapshot => ({
    slide: Math.max(0, cur.slide), step: cur.step, total: total(), steps: stepsOf(Math.max(0, cur.slide)), jump, startedAt,
  });
  const emit = () => opts.onChange?.(snapshot());

  /* ---------------------------------------------------------------- gating */
  function gate(sec: HTMLElement, k: number) {
    const els = Array.from(sec.querySelectorAll<HTMLElement>("[data-step]"));
    const top = new Map<string, number>();
    for (const el of els) {
      const g = el.dataset.stepSwap;
      const at = Number(el.dataset.step);
      if (g && at <= k && at > (top.get(g) ?? -1)) top.set(g, at);
    }
    for (const el of els) {
      const at = Number(el.dataset.step);
      const g = el.dataset.stepSwap;
      const on = at <= k && (!g || top.get(g) === at);
      if (el.classList.contains("in") !== on) el.classList.toggle("in", on);
    }
  }

  function gateAll() {
    sections().forEach((sec, i) => {
      if (mode === "print") return gate(sec, stepsOf(i));
      gate(sec, i < cur.slide ? stepsOf(i) : i > cur.slide ? -1 : cur.step);
    });
    // the presenter's "next" pane shows its slide at the final frame (CSS keyed on .in must see it)
    if (mode === "presenter")
      for (const sec of Array.from(document.querySelectorAll<HTMLElement>(".presenter-next .slide"))) gate(sec, Number(sec.dataset.steps) || 0);
  }

  /* ----------------------------------------------------------------- media */
  function media() {
    sections().forEach((sec, i) => {
      for (const v of Array.from(sec.querySelectorAll<HTMLVideoElement>("video"))) {
        const step = v.closest<HTMLElement>("[data-step]");
        const live = mode !== "print" && !rm() && i === cur.slide && v.muted && (!step || step.classList.contains("in"));
        if (live && v.paused) v.play().catch(() => {});
        else if (!live && !v.paused) v.pause();
      }
    });
  }

  /* ------------------------------------------------------------------ move */
  function go(slide: number, step = 0, o: { remote?: boolean; animate?: boolean } = {}) {
    const n = total();
    if (!n) return;
    const s = Math.min(n - 1, Math.max(0, slide));
    const k = Math.min(stepsOf(s), Math.max(0, step));
    const prev = cur;
    if (prev.slide === s && prev.step === k) return;
    const secs = sections();

    if (prev.slide !== s) {
      const from = secs[prev.slide];
      const to = secs[s];
      const t = to.dataset.transition || "fade";
      if (from) {
        from.classList.remove("is-current");
        if (o.animate !== false && !rm() && t !== "none" && mode !== "print") {
          from.dataset.leave = t;
          from.classList.add("is-leaving");
          window.clearTimeout(leaveTimers.get(from));
          const ms = cssMs("--t-slide", 320) * (t === "wipe" ? 1.4 : 0.6) + 40;
          leaveTimers.set(from, window.setTimeout(() => {
            from.classList.remove("is-leaving");
            delete from.dataset.leave;
          }, ms));
        }
      }
      // a leaving slide that comes back is current again at once
      window.clearTimeout(leaveTimers.get(to));
      to.classList.remove("is-leaving");
      delete to.dataset.leave;
      to.classList.add("is-current");
      void to.offsetWidth; // computed style with the hidden states, so step 0 transitions in
    }

    cur = { slide: s, step: k };
    gateAll();
    media();
    if (mode !== "print") {
      const hash = `#${s + 1}${k ? `.${k}` : ""}`;
      if (location.hash !== hash) history.replaceState(null, "", location.pathname + location.search + hash);
    }
    if (prev.slide >= 0 && startedAt === null && mode !== "print") startedAt = Date.now();
    if (!o.remote && prev.slide >= 0) broadcast();
    emit();
  }

  function next() {
    if (cur.step < stepsOf(cur.slide)) go(cur.slide, cur.step + 1);
    else if (cur.slide < total() - 1) go(cur.slide + 1, 0);
  }
  function prev() {
    if (cur.step > 0) go(cur.slide, cur.step - 1);
    else if (cur.slide > 0) go(cur.slide - 1, stepsOf(cur.slide - 1));
  }

  /* ----------------------------------------------------------------- scale */
  let raf = 0;
  function fit() {
    if (mode === "print") return;
    for (const vp of Array.from(document.querySelectorAll<HTMLElement>(".deck-viewport"))) {
      const r = vp.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const base = Math.min(r.width / W, r.height / H);
      const z = vp.hasAttribute("data-deck-main") ? zoom : 1;
      vp.style.setProperty("--deck-scale", String(+(base * z).toFixed(5)));
    }
  }
  const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };

  /* ------------------------------------------------------------------ sync */
  let channel: BroadcastChannel | null = null;
  const key = `deck:${id}`;
  // a deck shown inside another page (a demo iframe) stays out of the sync, or it would drive the host deck
  const embedded = (() => { try { return window.top !== window.self; } catch { return true; } })();
  function broadcast() {
    if (embedded) return;
    const msg = { type: "state", slide: cur.slide, step: cur.step, from: instance, t: Date.now() };
    if (channel) channel.postMessage(msg);
    else try { localStorage.setItem(key, JSON.stringify(msg)); } catch { /* storage blocked */ }
  }
  function receive(msg: { type?: string; slide?: number; step?: number; from?: string } | null) {
    if (!msg || msg.from === instance) return;
    if (msg.type === "hello") return broadcast();
    if (msg.type === "state" && typeof msg.slide === "number") go(msg.slide, msg.step ?? 0, { remote: true });
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key !== key || !e.newValue) return;
    try { receive(JSON.parse(e.newValue)); } catch { /* not ours */ }
  };

  /* ------------------------------------------------------------------ keys */
  function setJump(v: string) {
    jump = v;
    window.clearTimeout(jumpTimer);
    if (v) jumpTimer = window.setTimeout(() => setJump(""), 2500);
    emit();
  }
  function toggle(cls: string, force?: boolean) { html.classList.toggle(cls, force); }

  const onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && t.closest("input, textarea, select, [contenteditable]")) return;
    const k = e.key;
    if (/^[0-9]$/.test(k) && !(k === "0" && !jump)) { setJump((jump + k).slice(-3)); return; }
    switch (k) {
      case "Enter":
        e.preventDefault();
        if (jump) { const n = Number(jump); setJump(""); go(n - 1, 0); } else next();
        return;
      case "ArrowRight": case " ": case "PageDown": e.preventDefault(); next(); return;
      case "ArrowLeft": case "PageUp": case "Backspace": e.preventDefault(); prev(); return;
      case "Home": e.preventDefault(); go(0, 0); return;
      case "End": e.preventDefault(); go(total() - 1, 0); return;
      case "f": case "F":
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.().catch(() => {});
        return;
      case "h": case "H": toggle("hud-off"); return;
      case "p": case "P":
        if (mode === "deck") {
          const url = location.pathname + (location.search ? location.search + "&" : "?") + "presenter" + location.hash;
          window.open(url, `deck-presenter-${id}`, "width=1400,height=860");
        }
        return;
      case "t": case "T": if (mode === "presenter") { startedAt = Date.now(); emit(); } return;
      case "+": case "=": zoom = Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2)); fit(); return;
      case "-": case "_": zoom = Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2)); fit(); return;
      case "0": zoom = 1; fit(); return;
      case "?": toggle("keys-on"); return;
      case "Escape": toggle("keys-on", false); setJump(""); return;
    }
  };

  const onClick = (e: MouseEvent) => {
    if (e.button !== 0 || html.classList.contains("keys-on")) { toggle("keys-on", false); return; }
    const t = e.target as HTMLElement | null;
    if (!t || t.closest(NO_NAV)) return;
    if (!t.closest("[data-deck-main]")) return;
    if (String(window.getSelection?.() ?? "")) return;
    next();
  };

  const onHash = () => {
    const h = parseHash(location.hash);
    if (h) go(h.slide, h.step);
  };

  /* ----------------------------------------------------------------- mount */
  const initial = mode === "print" ? { slide: 0, step: 0 } : parseHash(location.hash) ?? { slide: 0, step: 0 };
  if (mode === "print") {
    sections().forEach((s) => s.classList.add("is-current"));
    cur = { slide: 0, step: 0 };
    gateAll();
  } else {
    go(initial.slide, initial.step, { remote: true, animate: false });
    fit();
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", fit);
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    if (embedded) { /* no sync */ }
    else if (typeof BroadcastChannel === "function") {
      channel = new BroadcastChannel(key);
      channel.onmessage = (e) => receive(e.data);
    } else window.addEventListener("storage", onStorage);
    // a fresh presenter window asks where the deck is
    if (mode === "presenter") {
      const hello = { type: "hello", from: instance };
      if (channel) channel.postMessage(hello);
      else try { localStorage.setItem(key, JSON.stringify({ ...hello, t: Date.now() })); } catch { /* storage blocked */ }
    }
  }
  html.classList.add("deck-ready");

  const api: DeckApi = {
    state: snapshot,
    total,
    stepsOf,
    next,
    prev,
    go: (s, k = 0, o) => go(s, k, o),
    sync() { gateAll(); media(); },
    fit,
    resetTimer() { startedAt = Date.now(); emit(); },
    destroy() {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", fit);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("storage", onStorage);
      channel?.close();
      cancelAnimationFrame(raf);
      window.clearTimeout(jumpTimer);
      leaveTimers.forEach((t) => window.clearTimeout(t));
      if ((window as unknown as { __deck?: DeckApi }).__deck === api) delete (window as unknown as { __deck?: DeckApi }).__deck;
    },
  };
  (window as unknown as { __deck?: DeckApi }).__deck = api;
  emit();
  return api;
}
