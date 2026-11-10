#!/usr/bin/env python3
"""Builds the school pages (schools.py) and the free tools index without touching existing guides.
Reuses build.py's template. Run from the repo root: python3 guides/_src/extra.py"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
src = open(os.path.join(HERE, "build.py"), encoding="utf-8").read()
exec(src[:src.index("for p in PAGES:")])          # block(), page(), STYLE, TODAY, e, ROOT, G ...
from schools import SCHOOLS
PAGES.extend(SCHOOLS)                              # so related-link names resolve
for p in SCHOOLS:
    f = os.path.join(G, p["slug"], "index.html")
    old = open(f, encoding="utf-8").read() if os.path.exists(f) else ""
    html_ = page(p)
    m = re.search(r'"datePublished": "([0-9-]+)"', old)      # keep the original publish date on rebuilds
    if m: html_ = re.sub(r'"datePublished": "[0-9-]+"', f'"datePublished": "{m.group(1)}"', html_)
    os.makedirs(os.path.dirname(f), exist_ok=True); open(f, "w", encoding="utf-8").write(html_); print("wrote", p["slug"])
ix = os.path.join(G, "index.html"); s = open(ix, encoding="utf-8").read()
if 'id="schools"' not in s:
    cards = "".join(f'<li><a href="/guides/{p["slug"]}/">{e(p["short"])}</a></li>' for p in SCHOOLS)
    sec = f'<h2 id="schools">Investment banking by school</h2><ul class="more">{cards}</ul>'
    s = s.replace("</main>", sec + "</main>", 1); open(ix, "w", encoding="utf-8").write(s); print("index: schools section")
sm = os.path.join(ROOT, "sitemap.xml"); s = open(sm, encoding="utf-8").read()
for loc in [f"https://mnaprep.com/guides/{p['slug']}/" for p in SCHOOLS] + [f"https://mnaprep.com/tools/{t}/" for t in ("", "recruiting-timeline-calculator", "superday-readiness-test", "investment-banking-pay")]:
    loc = loc.replace("/tools//", "/tools/")
    if loc not in s:
        s = s.replace("</urlset>", f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>")
open(sm, "w", encoding="utf-8").write(s); print("sitemap:", s.count("<url>"), "urls")
