#!/usr/bin/env python3
"""Fit 9:16 slides into a clean 2:3 Pinterest pin (1000x1500) with NO promo footer (Bekir, 2026-11-10: no promotional pieces for now).
Usage: python3 gen/pinfit.py OUTDIR slide.jpg ...   (trims the empty bottom like ig.py, pads with the slide's own background)"""
import sys, os
from PIL import Image
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for p in sys.argv[2:]:
    im = Image.open(p).convert("RGB"); W, H = im.size; bg = im.getpixel((5, 5))
    px = im.load(); y = H - 1
    while y > H // 2 and all(sum(abs(a - b) for a, b in zip(px[x, y], bg)) < 30 for x in range(0, W, 20)): y -= 1
    im = im.crop((0, 0, W, min(H, y + 60))); s = min(1000 / im.width, 1500 / im.height)
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    c = Image.new("RGB", (1000, 1500), bg); c.paste(im, ((1000 - im.width) // 2, (1500 - im.height) // 2))
    c.save(os.path.join(out, os.path.basename(p)), quality=92); print(os.path.basename(p), round(s, 2))
