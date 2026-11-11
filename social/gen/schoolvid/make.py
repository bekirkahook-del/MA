#!/usr/bin/env python3
"""Weekly YouTube video: "How to get into investment banking from <school>" (~3 min, 1920x1080).
Narrated slides (Kokoro TTS), the bullet being spoken is highlighted, slow zoom on every shot,
original synthesized lo-fi bed (no licensing), end card + 1280x720 thumbnail.

usage: python3 make.py spec.json OUTDIR
spec = {"school": "Ohio State", "short": "OSU", "accent": "#BB0000", "voice": "am_michael",
        "url": "mnaprep.com/guides/ohio-state-investment-banking", "thumb": ["IB FROM", "OHIO STATE?"],
        "scenes": [{"kicker": "...", "title": "...", "intro": "spoken line or ''",
                    "bullets": [["Bullet text on screen", "What the voice says for it"], ...]}, ...]}
Needs: kokoro-onnx + model files next to ../sitevid/voiceover.py (see DAILY.md), Playwright, ffmpeg."""
import sys, os, json, subprocess, html, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); TTS = os.environ.get("KOKORO_DIR", os.path.join(HERE, "..", "sitevid"))
spec = json.load(open(sys.argv[1])); OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SR, FPS = 24000, 30
k = Kokoro(os.path.join(TTS, "kokoro.onnx"), os.path.join(TTS, "voices.bin"))
voice = spec.get("voice", "am_michael"); lang = "en-gb" if voice.startswith("b") else "en-us"
ACC = spec.get("accent", "#2448D8"); e = html.escape

CSS = f"""*{{box-sizing:border-box;margin:0}}body{{width:1920px;height:1080px;overflow:hidden;font-family:Inter,'Helvetica Neue',Arial,sans-serif;color:#fff;
background:radial-gradient(1100px 700px at 85% 110%,{ACC}55 0%,transparent 60%),radial-gradient(900px 600px at 0% -10%,#2448D855 0%,transparent 60%),linear-gradient(135deg,#0B1222,#16204A)}}
.grid{{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 1.5px,transparent 1.5px);background-size:44px 44px}}
.wm{{position:absolute;right:70px;bottom:46px;font:700 30px Inter;color:rgba(255,255,255,.55)}}.wm b{{color:#7DA0FF}}
.bar{{position:absolute;left:0;bottom:0;height:8px;background:{ACC}}}
.k{{font:600 30px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#8EA8FF;text-transform:uppercase}}
.t{{font:800 84px/1.05 Inter;margin:18px 0 46px;max-width:1650px}}
ul{{list-style:none;padding:0}}li{{font:500 40px/1.3 Inter;margin:0 0 22px;padding:18px 30px 18px 34px;border-left:8px solid rgba(255,255,255,.18);border-radius:6px;color:rgba(255,255,255,.42);max-width:1650px}}
li.on{{color:#fff;border-left-color:{ACC};background:rgba(255,255,255,.07)}}li.done{{color:rgba(255,255,255,.62)}}
.wrap{{position:absolute;left:130px;top:120px;right:130px}}
.hero{{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 150px}}
.hero .t{{font-size:128px}}.hero .sub{{font:500 50px Inter;color:#CBD5E1}}
.pill{{display:inline-block;margin-top:50px;background:#2448D8;border-radius:60px;padding:22px 56px;font:700 52px Inter}}"""

def page(body):
    return f"<html><head><meta charset=utf-8><style>{CSS}</style></head><body><div class=grid></div>{body}<div class=wm>mnaprep<b>.com</b></div></body></html>"

def say(text, path):
    sp = 1.08
    a, sr = k.create(text, voice=voice, speed=sp, lang=lang)
    a = np.concatenate([np.zeros(int(.12 * SR)), a, np.zeros(int(.38 * SR))]).astype(np.float32)
    sf.write(path, a, SR); return len(a) / SR

# 1) build segment list
segs = []
for si, sc in enumerate(spec["scenes"]):
    hero = sc.get("hero")
    if hero:
        segs.append({"html": page(f"<div class=hero><div class=k>{e(sc.get('kicker',''))}</div><div class=t>{sc['title']}</div><div class=sub>{e(sc.get('sub',''))}</div>{'<div><span class=pill>'+e(sc['pill'])+'</span></div>' if sc.get('pill') else ''}</div>"), "say": sc["intro"]}); continue
    bl = sc.get("bullets", [])
    def slide(active):
        lis = "".join(f"<li class='{'on' if i == active else ('done' if i < active else '')}'>{b[0]}</li>" for i, b in enumerate(bl))
        return page(f"<div class=wrap><div class=k>{e(sc.get('kicker',''))}</div><div class=t>{e(sc['title'])}</div><ul>{lis}</ul></div>")
    if sc.get("intro"): segs.append({"html": slide(-1), "say": sc["intro"]})
    for i, b in enumerate(bl): segs.append({"html": slide(i), "say": b[1]})

# 2) voice + images
total = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={"width": 1920, "height": 1080})
    for i, s in enumerate(segs):
        s["dur"] = say(s["say"], f"{OUT}/v{i:03d}.wav"); total += s["dur"]
        pg.set_content(s["html"]); pg.wait_for_timeout(120); pg.screenshot(path=f"{OUT}/s{i:03d}.png")
    # thumbnail
    th = spec.get("thumb", ["IB FROM", spec["school"].upper() + "?"])
    pg.set_viewport_size({"width": 1280, "height": 720})
    pg.set_content(f"""<html><head><style>*{{margin:0}}body{{width:1280px;height:720px;overflow:hidden;font-family:Inter,Arial;background:linear-gradient(135deg,#0B1222,#16204A);color:#fff;position:relative}}
.g{{position:absolute;right:-120px;bottom:-200px;width:760px;height:760px;border-radius:50%;background:radial-gradient({ACC}cc,transparent 65%)}}
.a{{position:absolute;left:70px;top:80px;font:900 118px/1 Inter;letter-spacing:-2px}}.a span{{color:{ACC};-webkit-text-stroke:3px #fff}}
.b{{position:absolute;left:74px;bottom:96px;font:800 50px Inter;background:#fff;color:#0B1222;padding:14px 30px;border-radius:14px}}
.c{{position:absolute;left:76px;bottom:44px;font:700 28px Inter;color:#94A3B8}}</style></head><body><div class=g></div>
<div class=a>{e(th[0])}<br><span>{e(th[1])}</span></div><div class=b>{e(spec.get('thumb_tag','The exact plan, year by year'))}</div><div class=c>mnaprep.com</div></body></html>""")
    pg.wait_for_timeout(150); pg.screenshot(path=f"{OUT}/thumbnail.png"); br.close()

# 3) video: each still with a slow push-in, concatenated
lst = open(f"{OUT}/parts.txt", "w")
for i, s in enumerate(segs):
    n = int(round(s["dur"] * FPS)); z = "1.0+0.00018*on"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", f"{OUT}/s{i:03d}.png", "-frames:v", str(n),
        "-vf", f"scale=3840:2160,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps={FPS},format=yuv420p",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", f"{OUT}/p{i:03d}.mp4"], check=True)
    lst.write(f"file 'p{i:03d}.mp4'\n")
lst.close()
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{OUT}/parts.txt", "-c", "copy", f"{OUT}/video_noaudio.mp4"], check=True)

# 4) audio: voice track + soft original lo-fi bed (chords + soft kick/hat), ducked
voice_track = np.concatenate([sf.read(f"{OUT}/v{i:03d}.wav")[0] for i in range(len(segs))])
N = len(voice_track); t = np.arange(N) / SR; rng = np.random.default_rng(3)
bed = np.zeros(N); bpm = 82; beat = 60 / bpm
chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [164.81, 207.65, 246.94]]
for ci in range(int(N / SR / (4 * beat)) + 1):
    st = int(ci * 4 * beat * SR); ln = int(4 * beat * SR); en = min(N, st + ln)
    if st >= N: break
    tt = np.arange(en - st) / SR; envl = np.minimum(1, tt / .4) * np.exp(-tt / 3.5)
    for f in chords[ci % 4]: bed[st:en] += .06 * np.sin(2 * np.pi * f * tt) * envl + .02 * np.sin(2 * np.pi * f * 2 * tt) * envl
for bi in range(int(N / SR / beat)):
    st = int(bi * beat * SR)
    if bi % 2 == 0:
        n = min(int(.25 * SR), N - st); tt = np.arange(n) / SR; bed[st:st + n] += .18 * np.sin(2 * np.pi * (45 + 60 * np.exp(-tt * 25)) * tt) * np.exp(-tt / .09)
    h = int((bi + .5) * beat * SR); n = min(int(.04 * SR), N - h)
    if n > 0: bed[h:h + n] += .025 * rng.standard_normal(n) * np.exp(-np.arange(n) / SR / .01)
lvl = np.convolve(np.abs(voice_track), np.ones(2400) / 2400, "same"); duck = np.where(lvl > .01, .35, 1.0)
duck = np.convolve(duck, np.ones(4800) / 4800, "same")
mix = voice_track * .95 + bed / (np.abs(bed).max() + 1e-9) * .12 * duck
mix = mix / max(1e-9, np.abs(mix).max()) * .9
sf.write(f"{OUT}/audio.wav", mix.astype(np.float32), SR)
name = spec.get("file", "school-video.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{OUT}/video_noaudio.mp4", "-i", f"{OUT}/audio.wav", "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", f"{OUT}/{name}"], check=True)
print(json.dumps({"file": f"{OUT}/{name}", "seconds": round(total, 1), "segments": len(segs), "thumbnail": f"{OUT}/thumbnail.png"}))
