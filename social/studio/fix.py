#!/usr/bin/env python3
"""Fix Bot: auto-fixes the robot items that fail the 100/100 gate most, BEFORE scheduling.
Fixes (writes <name>.fixed.mp4, original untouched):
  D2  loudness -> two-pass loudnorm to -14 LUFS, true peak -1.5 dBTP (failed Nov 28: -22.6, -19.9, -18 LUFS)
  B1  dark/fade-in start -> trims dark lead-in frames (failed Nov 28: Pac-12 0.7 s fade)
Flags (can't fix by filter, rebuild needed):
  C5  not 1080x1920 (Jake/Chad 540x960: upscaling = blurry, rebuild from source)
Warns (never blocks; punch videos only, since presenter punch-ins don't register as cuts):
  R1  pacing: first cut after 2.5 s, or a >3.5 s stretch with no cut in the first 10 s (retention)
Safe zone (C2) stays a human check on the contact sheet: pixel tests gave false alarms on 100/100 videos.
Then runs qa.py on the result.
Usage: python3 social/studio/fix.py video.mp4 [--kind story|punch] [--dry]"""
import sys, os, re, json, subprocess, io
sys.path.insert(0, os.path.dirname(__file__))
import qa

def run(c): return subprocess.run(c, capture_output=True, text=True)

def dark_lead(f, max_s=1.5):
    """Seconds of dark lead-in (mean luma < 25 and nothing brighter than 200), sampled at 10 fps."""
    from PIL import Image, ImageStat
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-t', str(max_s), '-i', f, '-vf', 'fps=10,scale=108:192',
                          '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    t = 0.0
    for chunk in raw.split(b'\x89PNG')[1:]:
        st = ImageStat.Stat(Image.open(io.BytesIO(b'\x89PNG' + chunk)).convert('L'))
        if st.mean[0] >= 25 or st.extrema[0][1] >= 200: return t  # truly dark = fade/black, not a dark design
        t += 0.1
    return t

def cuts(f, upto=10):
    e = run(['ffmpeg', '-hide_banner', '-nostats', '-t', str(upto), '-i', f, '-vf',
             "select='gt(scene,0.05)',showinfo", '-f', 'null', '-']).stderr
    return [round(float(x), 2) for x in re.findall(r'pts_time:([\d.]+)', e)]

def loudnorm(src, dst, start=0.0):
    ss = ['-ss', f'{start:.2f}'] if start > 0 else []
    e = run(['ffmpeg', '-hide_banner', '-nostats', *ss, '-i', src, '-af',
             'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr
    m = json.loads(e[e.rindex('{'):e.rindex('}') + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    vc = ['-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p'] if start > 0 else ['-c:v', 'copy']
    r = run(['ffmpeg', '-v', 'error', '-y', *ss, '-i', src, '-af', af, '-ar', '48000', *vc, '-c:a', 'aac', '-b:a', '192k',
             '-movflags', '+faststart', dst])
    return r.returncode == 0

def main(a):
    if not a: print(__doc__); return 2
    f = a[0]; kind = a[a.index('--kind') + 1] if '--kind' in a else 'story'; dry = '--dry' in a
    dur, w, h, has_a = qa.probe(f)
    notes, fixes = [], []
    if (w, h) != (1080, 1920): notes.append(f'FLAG C5 {w}x{h}: rebuild at 1080x1920 (no upscaling)')
    lead = dark_lead(f)
    if lead > 0: fixes.append(f'B1 trim {lead:.1f}s dark lead-in')
    I, P = qa.loudness(f) if has_a else (None, None)
    if has_a and not (I is not None and -15.5 <= I <= -12.5 and P is not None and P <= -1.0):
        fixes.append(f'D2 loudnorm {I} LUFS / {P} dBFS -> -14 / -1.5')
    if kind == 'punch':
        c = [x - lead for x in cuts(f) if x > lead + 0.2]
        gaps = [b - a_ for a_, b in zip([0] + c, c + [min(10, dur) - lead])]
        if not c or c[0] > 2.5: notes.append(f'WARN R1 first cut at {c[0] if c else "none"}s: show a change by 2.5 s')
        elif max(gaps) > 3.5: notes.append(f'WARN R1 {max(gaps):.1f}s with no cut in first 10 s: add a beat every ~3 s')
    out = f
    if fixes and not dry:
        out = re.sub(r'\.mp4$', '', f) + '.fixed.mp4'
        if not loudnorm(f, out, lead): print('FIX FAILED: ffmpeg error'); return 1
    for x in fixes: print(('WOULD FIX ' if dry else 'FIXED ') + x)
    for x in notes: print(x)
    if not fixes and not notes: print('NOTHING TO FIX')
    print(f'OUT {out}')
    r = qa.video(out, kind)
    for name, ok, info in r: print(f"{'PASS' if ok else 'FAIL'}  {name:28} {info}")
    bad = sum(1 for _, ok, _ in r if not ok) + sum(1 for x in notes if 'C5' in x)
    print('FIX BOT: ' + ('READY for human score' if not bad else f'{bad} FAIL -> not postable') + (f', {len(notes)} flag(s)' if notes else ''))
    return 1 if bad else 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
