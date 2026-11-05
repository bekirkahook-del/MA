#!/usr/bin/env python3
"""Builds SEO guide pages from the specs in pages.py, reusing the look of an existing guide.
Run from the repo root: python3 guides/_src/build.py  (then it updates guides/index.html and sitemap.xml)."""
import html, json, re, sys, os, datetime
sys.path.insert(0, os.path.dirname(__file__))
from pages import PAGES

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
G = os.path.join(ROOT, "guides")
TODAY = datetime.date.today().isoformat()
base = open(os.path.join(G, "dcf-interview-questions", "index.html"), encoding="utf-8").read()
STYLE = base[base.index("<style>"):base.index("</style>") + 8]
FONTS = base[base.index('<link rel="preconnect"'):base.index("<style>")]
ICON = re.search(r'<link rel="icon"[^>]*>', base).group(0)
NUNITO = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@900&text=M%26A&display=swap">'
e = lambda s: html.escape(s, quote=True)
strip = lambda s: re.sub(r"<[^>]+>", "", s)

EXISTING = [
    ("investment-banking-interview-questions", "Investment banking interview questions"),
    ("accounting-interview-questions", "Accounting interview questions: the three statements"),
    ("dcf-interview-questions", "How to walk through a DCF"),
    ("lbo-interview-questions", "LBO interview questions"),
    ("investment-banking-recruiting-timeline", "Investment banking recruiting timeline"),
    ("behavioral-interview-questions-finance", "Behavioral interview questions for finance"),
    ("brain-teasers-finance-interviews", "Brain teasers in finance interviews"),
    ("private-equity-interview-questions", "Private equity interview questions"),
]

def block(b):
    k = b[0]
    if k == "p": return f"<p>{b[1]}</p>"
    if k == "h2": return f"<h2>{e(b[1])}</h2>"
    if k == "card":  # (card, title, [bullets] or text, tag?)
        tag = f'<span class="tag">{e(b[3])}</span>' if len(b) > 3 and b[3] else ""
        body = "<ul>" + "".join(f"<li>{x}</li>" for x in b[2]) + "</ul>" if isinstance(b[2], list) else f'<p style="margin:0">{b[2]}</p>'
        return f'<div class="card">{tag}<h3>{b[1]}</h3>{body}</div>'
    if k == "qa": return f'<details><summary>{e(b[1])}</summary><div class="ans">{b[2]}</div></details>'
    if k == "table":
        head = "".join(f"<th>{e(x)}</th>" for x in b[1])
        rows = "".join("<tr>" + "".join(f"<td>{x}</td>" for x in r) + "</tr>" for r in b[2])
        return f'<div class="tbl"><table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table></div>'
    if k == "cta": return f'<div class="cta"><p>{b[1]}</p><a href="{b[2]}">{e(b[3])}</a></div>'
    raise ValueError(k)

def page(p):
    url = f"https://mnaprep.com/guides/{p['slug']}/"
    title = f"{p['title']} | M&A Prep"
    faqs = [(b[1], strip(b[2])) for b in p["body"] if b[0] == "qa"]
    ld = [
        {"@context": "https://schema.org", "@type": "Article", "headline": p["h1"], "description": p["desc"], "datePublished": TODAY, "dateModified": TODAY,
         "mainEntityOfPage": url, "publisher": {"@type": "Organization", "name": "M&A Prep", "url": "https://mnaprep.com"}},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "M&A Prep", "item": "https://mnaprep.com/"},
            {"@type": "ListItem", "position": 2, "name": "Guides", "item": "https://mnaprep.com/guides/"},
            {"@type": "ListItem", "position": 3, "name": p["h1"], "item": url}]}]
    if faqs:
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]})
    more = [x for x in (p.get("related", []) + [s for s, _ in EXISTING]) if x != p["slug"]]
    names = dict(EXISTING) | {q["slug"]: q["short"] for q in PAGES}
    seen = []; [seen.append(x) for x in more if x not in seen and x in names]
    more_html = "".join(f'<li><a href="/guides/{s}/">{e(names[s])}</a></li>' for s in seen[:8])
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(p['desc'])}"><link rel="canonical" href="{url}">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(p['desc'])}"><meta property="og:url" content="{url}"><meta property="og:type" content="article"><meta property="og:site_name" content="M&amp;A Prep"><meta name="twitter:card" content="summary">
<meta name="theme-color" content="#13203B">
{ICON}
{FONTS}{STYLE}
{''.join(f'<script type="application/ld+json">{json.dumps(x)}</script>' for x in ld)}
{NUNITO}
</head><body>
<header class="top"><div class="wrap"><a class="brand" href="/">M<span>&amp;</span>A</a><a class="topcta" href="/">Train free</a></div></header>
<main class="wrap"><p class="crumb"><a href="/">M&amp;A Prep</a> › <a href="/guides/">Guides</a></p><h1>{e(p['h1'])}</h1><div class="lede">{''.join(f'<p>{x}</p>' for x in p['lede'])}</div>{''.join(block(b) for b in p['body'])}
<h2>More free guides</h2><ul class="more">{more_html}</ul></main>
<footer><div class="wrap">M&amp;A Prep is a free, game-style way to train for investment banking, private equity, hedge fund, restructuring and consulting interviews. <a href="/">Start training</a>.</div></footer>
<script src="/js/hit.js" defer></script>
</body></html>
"""

for p in PAGES:
    d = os.path.join(G, p["slug"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(page(p))
    print("wrote", p["slug"])

# guides index: add cards for new pages (once)
ix = os.path.join(G, "index.html"); s = open(ix, encoding="utf-8").read()
add = "".join(f'<div class="card"><h3><a href="/guides/{p["slug"]}/">{e(p["h1"])}</a></h3><p style="margin:0;color:var(--ink-2);font-size:15px">{e(p["desc"])}</p></div>'
              for p in PAGES if f'/guides/{p["slug"]}/' not in s)
if add:
    i = s.index('<div class="card">'); s = s[:i] + add + s[i:]
    open(ix, "w", encoding="utf-8").write(s); print("index updated")

# sitemap
sm = os.path.join(ROOT, "sitemap.xml"); s = open(sm, encoding="utf-8").read()
for p in PAGES:
    loc = f"https://mnaprep.com/guides/{p['slug']}/"
    if loc not in s:
        s = s.replace("</urlset>", f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>")
s = re.sub(r"(<loc>https://mnaprep.com/(?:guides/)?</loc><lastmod>)[0-9-]+", rf"\g<1>{TODAY}", s)
open(sm, "w", encoding="utf-8").write(s); print("sitemap:", s.count("<url>"), "urls")
