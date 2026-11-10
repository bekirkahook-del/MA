#!/usr/bin/env python3
"""Static, crawlable /deals/ page built from the in-app deal database (js/dealsdb.js), plus /feed.xml.
Run from the repo root after editing deals or guides: python3 guides/_src/deals.py"""
import os, sys, json, subprocess, re, html, datetime
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from tools import shell, e, ROOT, SITE, TODAY  # reuse the tools page shell (writes tools too, harmless)

D = json.loads(subprocess.check_output(["node", os.path.join(HERE, "deals_json.js")]))
D.sort(key=lambda r: -r[2])
MON = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
def when(m):
    if re.match(r"^\d{4}-\d{2}$", m): return f"{MON[int(m[5:]) - 1]} {m[:4]}"
    return m.replace("-", " ")
rows = "".join(
    f'<tr data-s="{e((r[0]+" "+r[1]+" "+r[5]+" "+r[6]).lower())}"><td><b>{e(r[0])}</b> → {e(r[1])}<div class="muted">{e(r[7])}</div></td>'
    f'<td>{e(r[3])}</td><td>{e(when(r[4]))}</td><td>{e(r[5])}</td><td>{e(r[6])}</td></tr>' for r in D)
inds = sorted({r[5] for r in D})
biggest = D[0]
body = f"""<div class="tool"><label for="q">Search {len(D)} deals</label><input id="q" type="search" placeholder="Company, industry or deal type (e.g. pharma, private equity)">
<div class="seg" id="ind" style="margin-top:10px"><button class="on" data-i="">All</button>{''.join(f'<button data-i="{e(i)}">{e(i)}</button>' for i in inds)}</div></div>
<div class="tbl"><table id="dt"><thead><tr><th>Deal</th><th>Value</th><th>Announced</th><th>Industry</th><th>Type</th></tr></thead><tbody>{rows}</tbody></table></div>
<p class="muted">Values as reported at announcement (equity value unless noted; "~" means press-reported). Sources include Intellizence, FactSet, Dealroom, Yahoo Finance and M&amp;A Prep's daily Wire. Practice explaining these deals in interviews in the <a href="/#deals">Deals section of the app</a>.</p>"""
js = r"""const q=document.getElementById("q"),rows=[...document.querySelectorAll("#dt tbody tr")];let ind="";
function f(){const t=q.value.trim().toLowerCase();rows.forEach(r=>{const s=r.dataset.s;r.hidden=!((!t||t.split(/\s+/).every(w=>s.includes(w)))&&(!ind||s.includes(ind.toLowerCase())))})}
q.oninput=f;document.getElementById("ind").onclick=e=>{const b=e.target.closest("button");if(!b)return;ind=b.dataset.i;document.querySelectorAll("#ind button").forEach(x=>x.classList.toggle("on",x===b));f()};"""
faqs = [
 (f"What was the biggest M&A deal of the last 12 months?", f"In this list, the largest is {biggest[0]} and {biggest[1]} at {biggest[3]} ({when(biggest[4])}). {biggest[7]}"),
 ("Why should students follow M&A deals?", "Interviewers often ask you to walk through a recent deal: who bought whom, the price, and why it makes sense. Knowing 2–3 deals well is an easy way to stand out."),
 ("How do I talk about a deal in an interview?", "Lead with the buyer, target and price, then the strategic reason, then one risk or what you'd watch. Keep it under a minute."),
]
os.makedirs(os.path.join(ROOT, "deals"), exist_ok=True)
page = shell("", f"Biggest M&A Deals of the Last 12 Months ({len(D)} Deals, Searchable)", "The biggest M&A deals of the last 12 months",
  f"A searchable list of {len(D)} of the most important mergers and acquisitions announced in the last 12 months: buyer, target, value, industry and why each deal happened.",
  [f"{len(D)} of the most relevant mergers and acquisitions announced over the last 12 months, sorted by size. Search by company, industry or deal type.",
   "Each one has a plain-English line on why it happened, so you can talk about it in an interview."], body, faqs, js, kind="Dataset")
page = page.replace(f'<link rel="canonical" href="{SITE}/tools/">', f'<link rel="canonical" href="{SITE}/deals/">').replace(f'"url": "{SITE}/tools/"', f'"url": "{SITE}/deals/"')
page = page.replace('<a href="/tools/">Free tools</a></p>', '<a href="/deals/">Deals</a></p>').replace(f'{SITE}/img/og/tools.jpg', f'{SITE}/img/og/deals.jpg')
page = page.replace('"name": "Free tools", "item": "https://mnaprep.com/tools/"', '"name": "Deals", "item": "https://mnaprep.com/deals/"')
page = page.replace('"@type": "Dataset", "name":', '"@type": "Dataset", "license": "https://mnaprep.com/", "creator": {"@type": "Organization", "name": "M&A Prep"}, "dateModified": "' + TODAY + '", "name":')
open(os.path.join(ROOT, "deals", "index.html"), "w", encoding="utf-8").write(page); print("deals page:", len(D))

# ---- RSS feed of guides + tools (helps feed readers and search engines discover new pages) ----
items = []
for slug in os.listdir(os.path.join(ROOT, "guides")):
    f = os.path.join(ROOT, "guides", slug, "index.html")
    if slug.startswith("_") or not os.path.isfile(f): continue
    s = open(f, encoding="utf-8").read()
    t = re.search(r"<h1>(.*?)</h1>", s, re.S); d = re.search(r'<meta name="description" content="([^"]*)"', s)
    p = re.search(r'"datePublished": "([0-9-]+)"', s)
    if t and d: items.append((p.group(1) if p else TODAY, html.unescape(re.sub("<[^>]+>", "", t.group(1))), html.unescape(d.group(1)), f"{SITE}/guides/{slug}/"))
items.append((TODAY, "Biggest M&A deals of the last 12 months", "A searchable list of the most important M&A deals.", f"{SITE}/deals/"))
for slug, title in [("recruiting-timeline-calculator", "Recruiting timeline calculator"), ("superday-readiness-test", "Superday readiness test"), ("investment-banking-pay", "Investment banking pay by level")]:
    items.append(("2026-11-10", title, "Free tool from M&A Prep.", f"{SITE}/tools/{slug}/"))
items.sort(key=lambda x: x[0], reverse=True)
rfc = lambda d: datetime.datetime.strptime(d, "%Y-%m-%d").strftime("%a, %d %b %Y 12:00:00 +0000")
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' \
      f'<title>M&amp;A Prep: free finance career guides</title><link>{SITE}/</link><description>Free guides and tools for investment banking, private equity, hedge fund and consulting recruiting.</description>' \
      f'<language>en-us</language><atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>' + \
      "".join(f"<item><title>{html.escape(t)}</title><link>{u}</link><guid>{u}</guid><pubDate>{rfc(d)}</pubDate><description>{html.escape(ds)}</description></item>" for d, t, ds, u in items[:60]) + \
      "</channel></rss>\n"
open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8").write(xml); print("feed items:", len(items))
