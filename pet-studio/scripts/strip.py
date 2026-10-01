#!/usr/bin/env python3
"""Compose a review strip from a direction's screenshots.

usage: strip.py <shots_dir> <letter> <out.png> [state ...]
default states: idle thinking refusing citing (missing ones are skipped)
Each shot is halved and laid side by side, so one Read shows four states.
"""
import sys
from pathlib import Path
from PIL import Image

shots, letter, out = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
states = sys.argv[4:] or ["idle", "thinking", "refusing", "citing"]
ims = []
for s in states:
    p = shots / f"{letter}-{s}.png"
    if p.exists():
        i = Image.open(p).convert("RGB")
        ims.append(i.resize((i.width // 2, i.height // 2)))
if not ims:
    sys.exit(f"no shots for {letter} in {shots}")
strip = Image.new("RGB", (sum(i.width for i in ims), max(i.height for i in ims)))
x = 0
for i in ims:
    strip.paste(i, (x, 0))
    x += i.width
strip.save(out)
print(out, strip.size, [s for s in states if (shots / f"{letter}-{s}.png").exists()])
