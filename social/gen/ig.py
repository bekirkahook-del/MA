#!/usr/bin/env python3
"""Make 1080x1350 (4:5) Instagram copies of 1080x1920 TikTok slides.
Usage: python3 ig.py OUTDIR slide1.jpg slide2.jpg ...
       python3 ig.py --pin OUTDIR slide.jpg ...   (1000x1500, 2:3 Pinterest pins)
Trims empty rows at the bottom (TikTok button area), then fits the slide
into 4:5, filling any side gap with a blurred, darkened copy of the slide.
Pins always get a footer with mnaprep.com + a QR code (Bekir: every post must link the site).
Needs: pip install qrcode --break-system-packages"""
import sys, os
from PIL import Image, ImageChops, ImageFilter, ImageEnhance, ImageStat, ImageDraw, ImageFont
args = sys.argv[1:]
PIN = args[0] == '--pin'
W, H = (1000, 1500) if PIN else (1080, 1350)
FOOT = 190 if PIN else 0  # pin footer height
if PIN: args = args[1:]
def footer(img, key):
    import qrcode
    d = ImageDraw.Draw(img); y0 = H - FOOT
    d.rectangle((0, y0, W, H), fill='#07101F'); d.rectangle((0, y0, W, y0 + 4), fill='#E3C27A')
    f = lambda n, sz: ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-' + n + '.otf', sz)
    try: big, small = f('Bold', 64), f('Medium', 30)
    except OSError: big = small = ImageFont.load_default()
    d.text((52, y0 + 36), 'mnaprep.com', font=big, fill='#E3C27A')
    d.text((54, y0 + 118), 'Free IB & PE interview prep  \u2192  scan or tap', font=small, fill='#C9D2E3')
    q = qrcode.QRCode(border=2, box_size=10); q.add_data('https://mnaprep.com/?utm_source=pinterest&utm_campaign=' + key); q.make(fit=True)
    qi = q.make_image(fill_color='#07101F', back_color='white').convert('RGB').resize((FOOT - 36, FOOT - 36), Image.NEAREST)
    img.paste(qi, (W - qi.width - 40, y0 + 22))
out = args[0]; os.makedirs(out, exist_ok=True)
for p in args[1:]:
    im = Image.open(p).convert('RGB')
    g = im.convert('L').resize((270, 480))
    # high-frequency detail (text, bars, photos), ignoring smooth background glows
    d = ImageChops.difference(g, g.filter(ImageFilter.GaussianBlur(6)))
    bottom = 480
    for y in range(479, 0, -1):
        if ImageStat.Stat(d.crop((0, y, 270, y + 1))).mean[0] > 2.5:
            bottom = min(480, y + 14); break
    top = 0
    crop = im.crop((0, top * 4, 1080, max(bottom * 4, round(1080 * H / W))))
    cw, ch = crop.size
    s = min(W / cw, (H - FOOT) / ch)
    fg = crop.resize((round(cw * s), round(ch * s)), Image.LANCZOS)
    bg = crop.resize((W, round(ch * W / cw))).crop((0, 0, W, H)) if ch * W / cw >= H else crop.resize((W, H))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(40))).enhance(0.45)
    bg.paste(fg, ((W - fg.width) // 2, (H - FOOT - fg.height) // 2))
    if PIN: footer(bg, os.path.splitext(os.path.basename(p))[0])
    bg.save(os.path.join(out, os.path.basename(p)), quality=92)
    print(os.path.basename(p), f"content to y={bottom*4}", f"scale={s:.2f}")
