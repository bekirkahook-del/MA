#!/usr/bin/env python3
"""Keeps every page's meta description at 160 characters or fewer, so Google doesn't cut it off mid-sentence.
Only <meta name="description"> changes; og:description (social previews) keeps the full text.
Safe to run again. Run from the repo root after building pages: python3 guides/_src/descfix.py"""
import glob, html, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIM = 160

def shorten(d):
    if len(d) <= LIM: return d
    d = re.sub(r",? in plain English(?: for [^.]*)?\.$", ".", d)          # drop the soft tail first
    if len(d) <= LIM: return d
    cut = d[:LIM - 1]
    for sep in (". ", "; ", ": ", ", "):                                # end on a natural break if one is late enough
        i = cut.rfind(sep)
        if i >= 100: return cut[:i].rstrip(",;:") + "."
    return cut[:cut.rfind(" ")].rstrip(",;:") + "…"

n = 0
for p in glob.glob(os.path.join(ROOT, "**", "index.html"), recursive=True):
    rel = os.path.relpath(p, ROOT)
    if rel.startswith(("vendor", "templates", "node_modules")): continue
    s = open(p, encoding="utf-8").read()
    m = re.search(r'(<meta name="description" content=")([^"]*)(")', s)
    if not m: continue
    d = html.unescape(m.group(2)); nd = shorten(d)
    if nd != d:
        s = s[:m.start(2)] + html.escape(nd, quote=True) + s[m.end(2):]
        open(p, "w", encoding="utf-8").write(s); n += 1
print("shortened", n, "descriptions")
