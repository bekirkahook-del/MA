#!/usr/bin/env python3
"""Automated part of social/RUBRIC.md (the robot items: B1, C5, D2, E1, E2).
Usage:
  python3 qa.py video.mp4 [--kind story|punch] [--sheet out.jpg]
  python3 qa.py --slides tiktok|instagram|pinterest img1.jpg img2.jpg ...
Prints PASS/FAIL per item and exits 1 if anything fails. --sheet writes a 2 s contact sheet
for the human/visual items (C1-C4, E3). Needs ffmpeg/ffprobe and Pillow."""
import sys, json, subprocess, re

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def probe(f):
    o = json.loads(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=width,height,codec_type', '-of', 'json', f]).stdout)
    v = [s for s in o['streams'] if s['codec_type'] == 'video'][0]
    return float(o['format']['duration']), v['width'], v['height'], any(s['codec_type'] == 'audio' for s in o['streams'])

def first_frame_brightness(f):
    from PIL import Image, ImageStat
    import io
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', '0.05', '-i', f, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    im = Image.open(io.BytesIO(raw)).convert('L'); st = ImageStat.Stat(im)
    return st.mean[0], st.stddev[0], st.extrema[0][1]

def loudness(f):
    e = run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr
    i = re.findall(r'I:\s+(-?[\d.]+) LUFS', e); p = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', e)
    return (float(i[-1]) if i else None), (float(p[-1]) if p else None)

def frozen(f, dur):
    e = run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-vf', 'freezedetect=n=0.002:d=2.5', '-map', '0:v', '-f', 'null', '-']).stderr
    starts = [float(x) for x in re.findall(r'freeze_start: ([\d.]+)', e)]
    ends = [float(x) for x in re.findall(r'freeze_end: ([\d.]+)', e)]
    out = []
    for k, s in enumerate(starts):
        en = ends[k] if k < len(ends) else dur
        out.append((round(s, 2), round(en, 2)))
    return out

def video(f, kind='story', sheet=None):
    res = []
    dur, w, h, has_a = probe(f)
    res.append(('C5 size 1080x1920', (w, h) == (1080, 1920), f'{w}x{h}'))
    lo, hi = (25, 60) if kind == 'story' else (8, 30)
    res.append((f'E2 length {lo}-{hi}s', lo <= dur <= hi, f'{dur:.1f}s'))
    m, sd, mx = first_frame_brightness(f)
    # lit = bright overall, OR a deliberate dark design with crisp bright text (fade-ins/black frames fail both)
    res.append(('B1 first frame lit', m >= 25 or (sd >= 30 and mx >= 240), f'mean {m:.0f}, contrast {sd:.0f}, max {mx}'))
    fr = frozen(f, dur)
    # a short end card (<=1.5 s) at the very end is allowed; any other freeze of 2.5 s+ fails
    bad = [x for x in fr if not (x[1] >= dur - 0.1 and x[1] - x[0] <= 1.5)]
    res.append(('E1 no dead air >2.5s', not bad, 'none' if not bad else ', '.join(f'{a}-{b}s' for a, b in bad)))
    if has_a:
        I, P = loudness(f)
        ok = I is not None and -18 <= I <= -10 and P is not None and P <= -0.5
        res.append(('D2 loudness/peak', ok, f'{I} LUFS, peak {P} dBFS'))
    else:
        res.append(('D2 loudness/peak', False, 'no audio track'))
    if sheet:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-vf', 'fps=0.5,scale=216:384,tile=8x4', '-frames:v', '1', sheet])
    return res

def slides(platform, files):
    from PIL import Image
    want = {'tiktok': (1080, 1920), 'instagram': (1080, 1350), 'pinterest': (1000, 1500)}[platform]
    res = []
    for f in files:
        s = Image.open(f).size
        res.append((f'C5 {f.split("/")[-1]} {want[0]}x{want[1]}', s == want, f'{s[0]}x{s[1]}'))
    n = len(files)
    if platform != 'pinterest':
        res.append(('E2 carousel 3-10 slides', 3 <= n <= 10, f'{n} slides'))
    return res

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        print(__doc__); sys.exit(2)
    if a[0] == '--slides':
        r = slides(a[1], a[2:])
    else:
        kind = a[a.index('--kind') + 1] if '--kind' in a else 'story'
        sheet = a[a.index('--sheet') + 1] if '--sheet' in a else None
        r = video(a[0], kind, sheet)
    for name, ok, info in r:
        print(f"{'PASS' if ok else 'FAIL'}  {name:28} {info}")
    fails = sum(1 for _, ok, _ in r if not ok)
    print('AUTO CHECKS: ' + ('ALL PASS (now score the visual/human items)' if not fails else f'{fails} FAIL -> not postable'))
    sys.exit(1 if fails else 0)
