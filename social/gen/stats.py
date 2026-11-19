#!/usr/bin/env python3
"""Pull post stats from the Metricool API and fill the empty 48h columns in punch-log.md (no AI, no MCP).

  python3 gen/stats.py               # fill punch-log rows that are 2+ days old and still blank
  python3 gen/stats.py --days 14 --top   # also print the top/bottom posts of the last 14 days (for insights.md)

Auth: the X-Mc-Auth token is injected by this environment's network proxy for app.metricool.com
(saved as a network secret, never in the repo). If you run it somewhere else, set METRICOOL_USER_TOKEN.
"""
import json, os, re, sys, urllib.parse, urllib.request
from datetime import date, datetime, timedelta

BASE = "https://app.metricool.com/api"
USER, BLOG = "5624989", "7259200"  # Metricool account + brand (bluechipfinancial); IDs, not secrets
HERE = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(os.path.dirname(HERE), "punch-log.md")

def get(path, **q):
    q.update(blogId=BLOG, userId=USER, integrationSource="MCP")
    url = f"{BASE}{path}?" + "&".join(f"{k}={urllib.parse.quote(str(v), safe='')}" for k, v in q.items())
    h = {"Content-Type": "application/json", "X-Mc-Auth": os.environ.get("METRICOOL_USER_TOKEN", "proxy-injected")}
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=40) as r:
        d = json.load(r)
    return d.get("data", d) if isinstance(d, dict) else d

def pick(o, *names, default=0):
    """First matching key, case-insensitive, also one level down (e.g. o['metrics']['views'])."""
    flat = {k.lower(): v for k, v in o.items()}
    for sub in ("metrics", "stats", "insights"):
        if isinstance(o.get(sub), dict): flat.update({k.lower(): v for k, v in o[sub].items()})
    for n in names:
        v = flat.get(n.lower())
        if v not in (None, ""): return v
    return default

def when(o):
    v = pick(o, "created", "createTime", "publishedAt", "date", "publicationDate", default="")
    if isinstance(v, dict): v = v.get("dateTime", "")
    if isinstance(v, (int, float)): return datetime.fromtimestamp(v / (1000 if v > 1e12 else 1))
    try: return datetime.fromisoformat(str(v).replace("Z", "+00:00")[:19])
    except ValueError: return None

def posts(network, d0, d1):
    kind = "reels" if network == "instagram" else "posts"
    rows = get(f"/v2/analytics/{kind}/{network}", **{"from": f"{d0}T00:00:00", "to": f"{d1}T23:59:59"})
    out = []
    for o in rows or []:
        out.append({"net": network, "t": when(o),
                    "text": str(pick(o, "videoDescription", "description", "title", "text", "content", "caption", default="")),
                    "url": pick(o, "shareUrl", "url", "permalink", "link", default=""),
                    "views": int(pick(o, "viewCount", "views", "videoViews", "plays", "impressions") or 0),
                    "likes": int(pick(o, "likeCount", "likes", "reactions") or 0),
                    "comments": int(pick(o, "commentCount", "comments") or 0),
                    "shares": int(pick(o, "shareCount", "shares") or 0)})
    return out

STOP = set("the a an of to in by and for on at is vs your you what how top best most this that it's".split())
def words(s): return {w for w in re.findall(r"[a-z0-9$%.]+", s.lower()) if w not in STOP and len(w) > 2}

def fill(tt):
    lines = open(LOG, encoding="utf-8").read().split("\n")
    cutoff = (date.today() - timedelta(days=2)).isoformat()
    changed = 0
    for i, ln in enumerate(lines):
        c = [x.strip() for x in ln.strip().strip("|").split("|")]
        if not re.match(r"\d{4}-\d{2}-\d{2}$", c[0]) or c[0] > cutoff: continue
        # rows don't all have the same columns; the 4 stats cells are the blanks right after the hook (last filled cell)
        last = max(j for j, x in enumerate(c) if x)
        if len(c) - 1 - last < 4: continue
        # match by posting day (±1) and word overlap between the log's topic + hook and the TikTok caption
        d = date.fromisoformat(c[0]); key = words(c[1] + " " + c[last])
        cand = [p for p in tt if p["t"] and abs((p["t"].date() - d).days) <= 1]
        best = max(cand, key=lambda p: len(key & words(p["text"])), default=None)
        if not best or len(key & words(best["text"])) < 2: print(f"no match: {c[0]} {c[1][:50]}"); continue
        c[last + 1:last + 5] = [str(best["views"]), str(best["likes"]), str(best["comments"]), str(best["shares"])]
        lines[i] = "| " + " | ".join(c) + " |"; changed += 1
        print(f"filled: {c[0]} {c[1][:50]} → {best['views']} views")
    if changed: open(LOG, "w", encoding="utf-8").write("\n".join(lines))
    return changed

def score(p): return (p["likes"] + 3 * p["comments"] + 2 * p["shares"]) / max(p["views"], 1)

if __name__ == "__main__":
    a = sys.argv[1:]; days = int(a[a.index("--days") + 1]) if "--days" in a else 14
    d1 = date.today(); d0 = d1 - timedelta(days=days)
    tt = posts("tiktok", d0, d1)
    print(f"{len(tt)} TikTok posts in the last {days} days")
    fill(tt)
    if "--top" in a:
        ok = [p for p in tt if p["views"] >= 50]
        ok.sort(key=score, reverse=True)
        for lab, grp in (("TOP", ok[:3]), ("BOTTOM", ok[-3:][::-1])):
            for p in grp:
                print(f"{lab}  {p['t']:%m-%d}  {p['views']:>6} views  {score(p):.3f}  {p['text'][:70]!r}")
