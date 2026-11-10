#!/usr/bin/env python3
"""Idempotent SEO pass over the homepage and every guide: preview image tags (og:image / twitter card)
and a visible "Updated" date taken from the page's Article dateModified. Run after build.py:
python3 guides/_src/seo.py   (images live in img/og/<slug>.jpg; render new ones with the og.js script)."""
import os, re, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://mnaprep.com"

def tags(img, alt):
    return (f'<meta property="og:image" content="{SITE}/img/og/{img}.jpg"><meta property="og:image:width" content="1200">'
            f'<meta property="og:image:height" content="630"><meta property="og:image:alt" content="{alt}">'
            f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{SITE}/img/og/{img}.jpg">')

ICONS = ('<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml">'
         '<link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">'
         '<meta name="robots" content="max-image-preview:large"><link rel="alternate" type="application/rss+xml" title="M&amp;A Prep guides" href="/feed.xml">')

def add_tags(s, img, alt):
    s = re.sub(r'<meta property="og:image[^>]*>|<meta name="twitter:(?:card|image)"[^>]*>', "", s)
    s = re.sub(r'<link rel="(?:icon|apple-touch-icon|shortcut icon|manifest)"[^>]*>|<meta name="robots"[^>]*>|<link rel="alternate" type="application/rss\+xml"[^>]*>', "", s)
    return s.replace("</title>", "</title>" + tags(img, alt) + ICONS, 1)

def nice(d):
    x = datetime.date.fromisoformat(d); return x.strftime("%b ") + str(x.day) + x.strftime(", %Y")

n = 0
for slug in sorted(os.listdir(os.path.join(ROOT, "guides"))):
    f = os.path.join(ROOT, "guides", slug, "index.html")
    if slug.startswith("_") or not os.path.isfile(f): continue
    s = open(f, encoding="utf-8").read()
    img = slug if os.path.exists(os.path.join(ROOT, "img/og", slug + ".jpg")) else "home"
    h1 = re.search(r"<h1>(.*?)</h1>", s, re.S); alt = re.sub(r"<[^>]+>", "", h1.group(1)) if h1 else "M&amp;A Prep guide"
    s = add_tags(s, img, alt)
    m = re.search(r'"dateModified": *"(\d{4}-\d{2}-\d{2})"', s)
    if m and h1:
        s = re.sub(r'<p class="upd"[^>]*>.*?</p>', "", s)
        s = s.replace(h1.group(0), h1.group(0) + f'<p class="upd" style="margin:-6px 0 14px;font-size:13px;color:#4A5672">Updated <time datetime="{m.group(1)}">{nice(m.group(1))}</time> · M&amp;A Prep</p>', 1)
    open(f, "w", encoding="utf-8").write(s); n += 1
ix = os.path.join(ROOT, "guides", "index.html")
s = open(ix, encoding="utf-8").read(); open(ix, "w", encoding="utf-8").write(add_tags(s, "home", "M&amp;A Prep free finance career guides"))
h = os.path.join(ROOT, "index.html")
s = open(h, encoding="utf-8").read(); open(h, "w", encoding="utf-8").write(add_tags(s, "home", "M&amp;A Prep: free training for investment banking and private equity"))
print("guides tagged:", n)
