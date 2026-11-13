import json, subprocess, os
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__))
B = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
SB = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
W, H = 1080, 1920
NAVY, BLUE = (15, 23, 42), (36, 72, 217)

def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def caption(text, path, hl=None):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(B, 64); lines = wrap(d, text, f, 920); lh = 80
    y0 = 300 - lh * len(lines) / 2 + 10
    for i, l in enumerate(lines):
        tw = d.textlength(l, font=f); x = (W - tw) / 2; y = y0 + i * lh
        # highlight words in brand blue
        for word in l.split(" "):
            col = (125, 165, 255) if hl and word.strip(".,?!:") in hl else (255, 255, 255)
            d.text((x, y), word, font=f, fill=col); x += d.textlength(word + " ", font=f)
    im.save(path)

def endcard(path):
    im = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(im)
    for r in range(900, 0, -12):  # soft blue glow
        a = int(60 * (1 - r / 900)); d.ellipse([W/2 - r, 800 - r, W/2 + r, 800 + r], fill=(15 + a//3, 23 + a//2, 42 + a*2))
    f1, f2, f3 = ImageFont.truetype(B, 120), ImageFont.truetype(SB, 54), ImageFont.truetype(B, 50)
    def c(t, f, y, col): d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=col)
    c("M&A Prep", f1, 640, (255, 255, 255))
    c("Free IB, PE & hedge fund", f2, 820, (203, 213, 225)); c("interview prep. Like a game.", f2, 890, (203, 213, 225))
    pw = d.textlength("mnaprep.com", font=f3) + 100
    d.rounded_rectangle([(W - pw)/2, 1030, (W + pw)/2, 1140], 55, fill=BLUE); c("mnaprep.com", f3, 1055, (255, 255, 255))
    c("Link in bio", f2, 1200, (148, 163, 184))
    im.save(path)

V = {
 "home": ("train-for-wall-street", [
   ("hook", "POV: you found a free game that preps you for IB interviews", ["free", "game"]),
   ("q", "Can you answer this one? Pause.", ["Pause."]),
   ("xp", "+10 XP every time you get one right", ["+10", "XP"]),
   ("feat", "8 tracks: IB, PE, hedge funds, consulting", ["8", "tracks:"]),
   ("live", "Live deals + internship deadlines. All free.", ["free."])]),
 "osu": ("ohio-state-ib", [
   ("hook", "Going to Ohio State and want investment banking?", ["Ohio", "State"]),
   ("clubs", "Step 1: Fisher Futures. Apply sophomore year.", ["Fisher", "Futures."]),
   ("bci", "Step 2: join a finance club early, like BCI", ["early,"]),
   ("tl", "Freshman fall: 1-2 clubs and a 3.5+ GPA", ["3.5+"]),
   ("stand", "Free guides for 100+ schools at mnaprep.com", ["100+", "mnaprep.com"])]),
 "tl": ("ib-recruiting-timeline", [
   ("hook", "When does IB recruiting ACTUALLY start?", ["ACTUALLY"]),
   ("pick", "Class of 2029? Watch this.", ["2029?"]),
   ("go", "It's already open. Sophomore fall.", ["open."]),
   ("r1", "Freshman year: clubs, GPA, coffee chats", []),
   ("r2", "Main window: sophomore fall to spring", ["sophomore"]),
   ("r3", "Get your timeline free at mnaprep.com", ["free", "mnaprep.com"])]),
 "pay": ("investment-banker-pay", [
   ("hook", "How much do investment bankers ACTUALLY make?", ["ACTUALLY"]),
   ("an", "1st-year analyst: $160K", ["$160K"]),
   ("md", "Managing director: up to $1.6M", ["$1.6M"]),
   ("eb", "Elite boutiques pay even more", ["more"]),
   ("mm", "Middle market pays less, but still a lot", []),
   ("tbl", "Every level, every bank type. Free.", ["Free."])]),
 "sd": ("superday-test", [
   ("hook", "Could you pass an investment banking Superday?", ["Superday?"]),
   ("q1", "Q1: most people get this wrong. Pause and answer.", ["wrong."]),
   ("a1", "Up $2.50. Depreciation saves you taxes.", ["$2.50."]),
   ("q2", "Q2: equity value to enterprise value?", []),
   ("q3", "Q3: borrow $100, keep it as cash. What happens to EV?", []),
   ("a3", "No change. Debt and cash cancel out.", ["No", "change."]),
   ("rest", "12 real final-round questions", ["12"]),
   ("score", "12/12 = Superday ready. What's your score?", ["12/12"])]),
}
endcard(f"{D}/end.png")
bg = Image.new("RGB", (W, H), NAVY); dd = ImageDraw.Draw(bg)
for r in range(1100, 0, -14):
    a = int(50 * (1 - r / 1100)); dd.ellipse([W/2 - r, 1200 - r, W/2 + r, 1200 + r], fill=(15 + a//3, 23 + a//2, 42 + a*2))
bg.save(f"{D}/bg.png")
PW, PH, PX, PY = 810, 1440, 135, 470
mk = Image.new("L", (PW, PH), 0); ImageDraw.Draw(mk).rounded_rectangle([0, 0, PW - 1, PH - 1], 44, fill=255); mk.save(f"{D}/mask.png")
os.makedirs(f"{D}/out", exist_ok=True)
import sys
KEYS = sys.argv[1:] or list(V)
for k, (name, caps) in [(k, V[k]) for k in KEYS]:
    m = json.load(open(f"{D}/r_{k}/marks.json")); T = m["total"]
    ins = ["-i", f"{D}/r_{k}/raw.mp4"]
    flt = []
    prev = "[base]"
    for i, (mk, txt, hl) in enumerate(caps):
        p = f"{D}/r_{k}/cap{i}.png"; caption(txt, p, hl); ins += ["-i", p]
        a = m[mk]; b = m[caps[i + 1][0]] if i + 1 < len(caps) else T
        flt.append(f"{prev}[{i+1}:v]overlay=0:0:enable='between(t,{a:.2f},{b - 0.01:.2f})'[v{i}]"); prev = f"[v{i}]"
    n = len(caps) + 1
    ins += ["-loop", "1", "-t", "2.5", "-i", f"{D}/end.png", "-loop", "1", "-t", f"{T:.2f}", "-i", f"{D}/bg.png", "-loop", "1", "-i", f"{D}/mask.png"]
    flt.insert(0, f"[0:v]scale=810:1440:flags=lanczos,format=rgba[sc];[{n+2}:v]format=gray,scale=810:1440[mk];[sc][mk]alphamerge[ph];[{n+1}:v]fps=30,format=rgba[bgv];[bgv][ph]overlay=135:470:shortest=1[base]")
    flt.append(f"[{n}:v]fps=30,format=yuv420p,setsar=1,fade=in:st=0:d=0.25[e]")
    flt.append(f"{prev}fps=30,format=yuv420p,setsar=1[m]")
    flt.append("[m][e]concat=n=2:v=1:a=0[vv]")
    tot = T + 2.5
    tj = f"{D}/r_{k}/timing.json"; B_ = 60 / 116
    json.dump({"T": [T] + sorted([m[c[0]] for c in caps[1:]], reverse=True), "ROLL": max(0, T - 4 * B_), "END": tot, "BEAT": B_, "n": len(caps)}, open(tj, "w"))
    subprocess.run(["python3", f"{D}/../punch/beat_up.py", tj, f"{D}/r_{k}/beat.wav"], check=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", *ins, "-i", f"{D}/r_{k}/beat.wav",
           "-filter_complex", ";".join(flt), "-map", "[vv]", "-map", f"{n+3}:a", "-c:v", "libx264", "-crf", "19", "-preset", "veryfast",
           "-c:a", "aac", "-shortest", "-movflags", "+faststart", f"{D}/out/{name}.mp4"]
    subprocess.run(cmd, check=True); print("ok", name, round(tot, 1))
