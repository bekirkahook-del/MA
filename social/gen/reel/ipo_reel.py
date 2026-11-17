# News reel: Anthropic IPO (bluechipfinancial / M&A Prep style). usage: python3 ipo_reel.py vo.mp3 out.mp4 [preview_times...]
import sys, subprocess, math
from PIL import Image, ImageDraw, ImageFont
W, H, FPS = 1080, 1920, 30
BONE, INK, GREEN, RED, GREY = (244, 241, 234), (17, 17, 17), (0, 200, 100), (230, 64, 64), (120, 116, 108)
FD = "/usr/share/fonts/opentype/inter/"
_fc = {}
def F(w, s):
    k = (w, s)
    if k not in _fc: _fc[k] = ImageFont.truetype(FD + {"k": "Inter-Black.otf", "x": "Inter-ExtraBold.otf", "b": "Inter-Bold.otf"}[w], s)
    return _fc[k]

# sentence spans from silencedetect on the ElevenLabs take
L = [
 (0.00, 5.95, "22 banks. One IPO. Up to $1.4 trillion."),
 (6.34, 8.57, "Sounds like a typo. It's Anthropic."),
 (9.13, 15.54, "The company behind Claude is set to start trading on Nasdaq on Nov 19, under the ticker ANT."),
 (16.08, 21.83, "The price range is $70 to $78 a share, for 825 million shares."),
 (22.25, 25.35, "That's about $61 billion raised in the base deal."),
 (25.96, 31.18, "At the top of the range, it's valued at up to $1.4 trillion, fully diluted."),
 (31.69, 35.67, "Revenue for the year ending in September? $35.3 billion."),
 (36.24, 42.16, "And the banks running it? Goldman Sachs, Morgan Stanley and JPMorgan lead 22 bookrunners."),
 (42.65, 47.29, "But here's the catch. Just 6 weeks earlier, the target was close to $2 trillion."),
 (47.78, 55.79, "And SpaceX, this year's other mega IPO, swung from about $108 to over $200 in its first 60 days."),
 (56.20, 59.86, "So, deal of the decade? Or is the hype already priced in?"),
 (60.45, 65.30, "Comment below. Follow bluechipfinancial / M&A Prep. Not financial advice."),
]
END = 65.4
ease = lambda x: 1 - (1 - max(0, min(1, x))) ** 3
def ap(t, t0, d=.35): return ease((t - t0) / d)

def ctext(d, y, s, f, fill, cx=W // 2):
    w = d.textlength(s, font=f); d.text((cx - w / 2, y), s, font=f, fill=fill)

def wrap(d, s, f, maxw):
    out, cur = [], ""
    for w in s.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) > maxw and cur: out.append(cur); cur = w
        else: cur = t
    return out + [cur]

def chrome(d):
    d.rounded_rectangle((48, 60, 300, 112), 26, fill=RED); d.text((70, 70), "IPO WATCH", font=F("k", 30), fill="white")
    d.text((320, 72), "NOV 2026", font=F("b", 28), fill=GREY)
    s = "bluechipfinancial / M&A Prep"; d.text((W - 48 - d.textlength(s, font=F("b", 28)), 72), s, font=F("b", 28), fill=INK)
    d.line((48, 140, W - 48, 140), fill=(210, 205, 195), width=3)
    ctext(d, 1838, "Sources: Renaissance Capital (Nov 10), The Next Web (Nov 11, 2026)", F("b", 24), GREY)
    ctext(d, 1872, "Not financial advice", F("b", 24), GREY)

def card(d, x, y, w, h, bar, k, v, a):
    if a <= 0: return
    off = int((1 - a) * 120)
    d.rounded_rectangle((x + off, y, x + off + w, y + h), 22, fill="white")
    d.rounded_rectangle((x + off, y, x + off + 14, y + h), 7, fill=bar)
    d.text((x + off + 44, y + 22), k, font=F("b", 32), fill=GREY)
    d.text((x + off + 44, y + 62), v, font=F("k", 58), fill=INK)

def scene(d, t):
    s = [l[0] for l in L]
    if t < s[2] - .1:  # hook
        a1, a2, a3 = ap(t, 0), ap(t, 1.5), ap(t, 3.2)
        if a1 and t < 6.2: ctext(d, 330, "22 BANKS.", F("k", 150), INK)
        if a2 and t < 6.2: ctext(d, 500, "ONE IPO.", F("k", 150), INK)
        if a3 and t < 6.2:
            v = 1.4 * ease((t - 3.2) / 1.6); ctext(d, 720, f"${v:.1f} TRILLION", F("k", 120), GREEN)
            ctext(d, 880, "up to, fully diluted", F("b", 40), GREY)
        if t >= 6.2:
            ctext(d, 500, "Sounds like a typo.", F("x", 64), GREY)
            if t >= 7.6:
                a = ap(t, 7.6, .25); sz = int(170 - 40 * a)
                ctext(d, 640, "ANTHROPIC", F("k", sz), INK)
                ctext(d, 840, "the company behind Claude", F("b", 44), GREY)
    elif t < s[6] - .1:  # deal terms cards
        ctext(d, 190, "THE DEAL", F("k", 64), INK)
        rows = [(s[2], GREEN, "Ticker · Exchange", "ANT · Nasdaq"), (s[2] + 3.2, GREEN, "First trade", "Nov 19, 2026"),
                (s[3], GREEN, "Price range", "$70 – $78"), (s[3] + 3.0, GREEN, "Shares offered", "825 million"),
                (s[4], GREEN, "Base raise", "≈ $61 billion"), (s[5], GREEN, "Value at top of range", "up to $1.4T")]
        for i, (t0, c, k, v) in enumerate(rows): card(d, 90, 270 + i * 160, 900, 140, c, k, v, ap(t, t0))
    elif t < s[7] - .1:  # revenue
        ctext(d, 330, "REVENUE", F("k", 72), INK)
        v = 35.3 * ease((t - s[6] - 1.2) / 1.5) if t > s[6] + 1.2 else 0
        ctext(d, 520, f"${v:.1f}B", F("k", 210), GREEN)
        ctext(d, 790, "12 months to Sep 30, 2026", F("b", 44), GREY)
    elif t < s[8] - .1:  # banks
        ctext(d, 220, "WHO'S RUNNING IT", F("k", 64), INK)
        for i, b in enumerate(["Goldman Sachs", "Morgan Stanley", "JPMorgan"]):
            card(d, 90, 340 + i * 185, 900, 160, INK, f"Lead bookrunner #{i+1}", b, ap(t, s[7] + 1.4 + i * .9))
        if t > s[7] + 4.2: ctext(d, 940, "+ 19 more banks = 22 bookrunners", F("x", 50), GREEN)
    elif t < s[9] - .1:  # catch: valuation cut
        ctext(d, 220, "THE CATCH", F("k", 72), RED)
        base, top = 1150, 420; a = ap(t, s[8] + 1.0, .8); b = ap(t, s[8] + 2.6, .8)
        for x, val, lab, sub, c, aa in [(200, 2.0, "~$2T", "target 6 weeks earlier", GREY, a), (620, 1.4, "$1.4T", "top of range now", RED, b)]:
            hpx = (base - top) * val / 2.0 * aa
            d.rounded_rectangle((x, base - hpx, x + 260, base), 18, fill=c)
            if aa > .9: ctext(d, base - hpx - 90, lab, F("k", 70), INK, x + 130)
            ctext(d, base + 20, sub, F("b", 30), GREY, x + 130)
    elif t < s[10] - .1:  # spacex swing
        ctext(d, 220, "REMEMBER SPACEX?", F("k", 72), INK)
        ctext(d, 320, "this year's other mega IPO", F("b", 42), GREY)
        x0, x1, y = 140, 940, 700; a = ap(t, s[9] + 2.2, 1.6)
        d.rounded_rectangle((x0, y - 14, x1, y + 14), 14, fill=(220, 215, 205))
        xe = x0 + (x1 - x0) * a
        d.rounded_rectangle((x0, y - 14, xe, y + 14), 14, fill=GREEN)
        d.ellipse((x0 - 28, y - 28, x0 + 28, y + 28), fill=RED); ctext(d, y + 60, "~$108", F("k", 64), RED, x0 + 40)
        if a > .95: d.ellipse((x1 - 28, y - 28, x1 + 28, y + 28), fill=GREEN); ctext(d, y + 60, "$200+", F("k", 64), GREEN, x1 - 40)
        ctext(d, 960, "trading range, first 60 days", F("b", 44), GREY)
    else:  # question + outro
        a, b = ap(t, s[10]), ap(t, s[10] + 1.6)
        if a: d.rounded_rectangle((90, 300, 990, 560), 30, fill=GREEN); ctext(d, 360, "DEAL OF", F("k", 80), "white"); ctext(d, 450, "THE DECADE?", F("k", 80), "white")
        if a: ctext(d, 600, "or", F("x", 50), GREY)
        if b: d.rounded_rectangle((90, 680, 990, 940), 30, fill=RED); ctext(d, 740, "HYPE ALREADY", F("k", 80), "white"); ctext(d, 830, "PRICED IN?", F("k", 80), "white")
        if t > s[11]: ctext(d, 1030, "Comment below 👇".replace(" 👇", ""), F("k", 60), INK); ctext(d, 1110, "Follow bluechipfinancial / M&A Prep", F("x", 44), INK)

def captions(d, t):
    for t0, t1, s in L:
        if t0 - .05 <= t <= t1 + .3:
            words = s.split(); f = F("x", 54); lines = wrap(d, s, f, 940)
            k = int(len(words) * min(1, max(0, (t - t0) / max(.1, t1 - t0))))
            y = 1330 - (len(lines) - 1) * 34; i = 0
            for ln in lines:
                ws = ln.split(); tw = d.textlength(ln, font=f); x = W / 2 - tw / 2
                for w in ws:
                    d.text((x, y), w, font=f, fill=GREEN if i < k else INK); x += d.textlength(w + " ", font=f); i += 1
                y += 68
            return

def frame(t):
    im = Image.new("RGB", (W, H), BONE); d = ImageDraw.Draw(im); chrome(d); scene(d, t); captions(d, t); return im

if __name__ == "__main__":
    vo, out = sys.argv[1], sys.argv[2]
    if len(sys.argv) > 3:
        ims = [frame(float(x)).resize((270, 480)) for x in sys.argv[3:]]
        sh = Image.new("RGB", (270 * len(ims), 480)); [sh.paste(m, (i * 270, 0)) for i, m in enumerate(ims)]; sh.save(out); sys.exit()
    p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                          "-i", vo, "-af", f"loudnorm=I=-16:TP=-1.5:LRA=7,afade=t=out:st={END-0.8}:d=0.8", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
                          "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    for n in range(int(END * FPS)): p.stdin.write(frame(n / FPS).tobytes())
    p.stdin.close(); p.wait(); print("ok", out)
