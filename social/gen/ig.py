#!/usr/bin/env python3
"""Make 1080x1350 (4:5) Instagram copies of 1080x1920 TikTok slides.
Usage: python3 ig.py OUTDIR slide1.jpg slide2.jpg ...
Trims empty rows at the bottom (TikTok button area), then fits the slide
into 4:5, filling any side gap with a blurred, darkened copy of the slide."""
import sys, os
from PIL import Image, ImageChops, ImageFilter, ImageEnhance, ImageStat
W, H = 1080, 1350
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for p in sys.argv[2:]:
    im = Image.open(p).convert('RGB')
    g = im.convert('L').resize((270, 480))
    # high-frequency detail (text, bars, photos), ignoring smooth background glows
    d = ImageChops.difference(g, g.filter(ImageFilter.GaussianBlur(6)))
    bottom = 480
    for y in range(479, 0, -1):
        if ImageStat.Stat(d.crop((0, y, 270, y + 1))).mean[0] > 2.5:
            bottom = min(480, y + 14); break
    top = 0
    crop = im.crop((0, top * 4, 1080, max(bottom * 4, 1350)))
    cw, ch = crop.size
    s = min(W / cw, H / ch)
    fg = crop.resize((round(cw * s), round(ch * s)), Image.LANCZOS)
    bg = crop.resize((W, round(ch * W / cw))).crop((0, 0, W, H)) if ch * W / cw >= H else crop.resize((W, H))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(40))).enhance(0.45)
    bg.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2))
    bg.save(os.path.join(out, os.path.basename(p)), quality=92)
    print(os.path.basename(p), f"content to y={bottom*4}", f"scale={s:.2f}")
