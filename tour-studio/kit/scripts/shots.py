"""Fallback walk when the Playwright MCP browser is busy. Screenshots start, every step URL and final
at 1440x900 and 390x844, and prints scrollWidth, popover/target overlap and console errors.
Does NOT exercise keyboard, focus, Esc or close/resume: report those as not checked.
Usage: python3 scripts/shots.py <port> <out-folder> [step numbers...]   (needs: pip install playwright)
Reads route/target of every step from lib/tour.ts, so run it from the demo root."""
import json, re, sys, os
from playwright.sync_api import sync_playwright

port, out = sys.argv[1], sys.argv[2]
only = [int(x) for x in sys.argv[3:]] or None
os.makedirs(out, exist_ok=True)
src = open("lib/tour.ts", encoding="utf-8").read()
steps = re.findall(r'route:\s*"([^"]+)"\s*,\s*target:\s*"([^"]+)"', src)
shots = [("start", "/", None)] + [(f"{i+1:02d}", f"{r}?pas={i+1}", t) for i, (r, t) in enumerate(steps)] + [("final", "/final", None)]

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")  # drop channel= to use bundled chromium
    for w, h, tag in [(1440, 900, "d"), (390, 844, "m")]:
        page = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1).new_page()
        logs = []
        page.on("console", lambda m: logs.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: logs.append(f"pageerror: {e}"))
        for name, url, target in shots:
            if only and not (name.isdigit() and int(name) in only):
                continue
            logs.clear()
            page.goto(f"http://localhost:{port}{url}", wait_until="networkidle")
            if target:  # wait for the counter of THIS step ("N din M"), not just any popover
                try: page.get_by_text(re.compile(rf"^{int(name)} din \d+$")).wait_for(timeout=8000)
                except Exception: print(tag, name, "COUNTER NOT FOUND")
            page.wait_for_timeout(2800)  # scroll settle + tween
            info = page.evaluate("""(t) => {
              const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
              const el = t && document.querySelector(`[data-tour="${t}"]`), d = document.querySelector('[role=dialog]');
              const r = el && el.getBoundingClientRect(), q = d && d.getBoundingClientRect();
              const ov = r && q ? !(r.right <= q.left || q.right <= r.left || r.bottom <= q.top || q.bottom <= r.top) : null;
              return { scrollW: sw, clientW: cw, targetFound: t ? !!el : null, overlap: ov };
            }""", target)
            page.screenshot(path=f"{out}/{tag}-{name}.png")
            print(tag, name, json.dumps(info), "| console:", logs if logs else "clean")
    b.close()
