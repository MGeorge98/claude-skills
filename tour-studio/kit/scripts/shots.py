"""Fallback walk when the Playwright MCP browser is busy (or for a quick re-check). For every step URL (?pas=N)
and for / and /final, at 1440x900 and 390x844: waits for THAT step's caption, screenshots, and prints
scrollWidth vs clientWidth, whether the caption covers the step's ring block (desktop), which data-tour each
cursor click landed on, and console errors/warnings.
Does NOT exercise keyboard, focus, Esc or close/resume: report those as not checked. LOOK at every image.
Usage: python3 scripts/shots.py <port> <out-folder> [step numbers...]   (needs: pip install playwright)
Run it from the demo root: it reads id/route/target/ring of every step from lib/tour.ts."""
import json, os, re, sys
from playwright.sync_api import sync_playwright

port, out = sys.argv[1], sys.argv[2]
only = [int(x) for x in sys.argv[3:]] or None
os.makedirs(out, exist_ok=True)
src = open("lib/tour.ts", encoding="utf-8").read()
body = src[src.index("export const STEPS"):]
steps = []
for block in re.split(r"\n\s*\{\s*\n\s*id:", body)[1:]:
    # drop the beats first: a beat's `target:` may come before the step's own `target:`
    own = re.sub(r"\bbefore:\s*\[.*?\]\s*,?", "", block, flags=re.S)
    get = lambda k: (re.search(rf'\b{k}:\s*"([^"]+)"', own) or [None, None])[1]
    steps.append({"route": get("route"), "target": get("target"), "ring": get("ring") or get("target")})
total = len(steps)

# record which data-tour element sits under every click ripple
HITS = """
window.__hits = [];
new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
  if (!n.classList || !n.classList.contains('tour-ripple')) return;
  const x = parseFloat(n.style.left), y = parseFloat(n.style.top);
  const el = document.elementsFromPoint(x, y).map((e) => e.closest('[data-tour]')).find(Boolean);
  window.__hits.push(el ? el.dataset.tour : `MISS@${Math.round(x)},${Math.round(y)}`);
}))).observe(document, { childList: true, subtree: true });  // document: the init script runs before <html> exists
"""

with sync_playwright() as p:
    try:
        b = p.chromium.launch(channel="chrome")
    except Exception:
        b = p.chromium.launch()  # bundled chromium (python3 -m playwright install chromium)
    for w, h, tag in [(1440, 900, "d"), (390, 844, "m")]:
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
        ctx.add_init_script(HITS)
        page = ctx.new_page()
        logs = []
        page.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: logs.append(f"pageerror: {e}"))
        shots = [("start", "/", None)] + [(f"{i+1:02d}", f"{s['route']}?pas={i+1}", s) for i, s in enumerate(steps)] + [("final", "/final", None)]
        for name, url, s in shots:
            if only and not (name.isdigit() and int(name) in only):
                continue
            logs.clear()
            page.goto(f"http://localhost:{port}{url}", wait_until="networkidle")
            if s:  # wait for THIS step's caption to be shown (the cursor run ends with it)
                try:
                    page.wait_for_selector(f'[role=dialog][aria-hidden=false]:has-text("{int(name)} din {total}")', timeout=15000)
                except Exception:
                    print(tag, name, "CAPTION NOT SHOWN (target missing? see console)")
                page.wait_for_timeout(500)
            info = page.evaluate("""(s) => {
              const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
              if (!s) return { scrollW: sw, clientW: cw };
              const box = (e) => e && e.getBoundingClientRect();
              const R = box(document.querySelector(`[data-tour="${s.ring}"]`)), C = box(document.querySelector('[role=dialog]'));
              const covers = innerWidth >= 640 && R && C ? !(R.right <= C.left || C.right <= R.left || R.bottom <= C.top || C.bottom <= R.top) : null;
              return { scrollW: sw, clientW: cw, ringFound: !!R, captionCoversRing: covers, clicks: window.__hits };
            }""", s)
            page.screenshot(path=f"{out}/{tag}-{name}.png")
            print(tag, name, json.dumps(info, ensure_ascii=False), "| console:", logs if logs else "clean")
        ctx.close()
    b.close()
