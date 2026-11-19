#!/usr/bin/env python3
"""Pull post stats from the Metricool API and fill the empty 48h columns in punch-log.md (no AI, no MCP).

  python3 gen/stats.py               # fill punch-log rows that are 2+ days old and still blank
  python3 gen/stats.py --days 14 --top   # also print the top/bottom posts of the last 14 days (for insights.md)
  python3 gen/stats.py --from-json rows.json --top   # same, from Metricool MCP getAnalyticsDataByMetrics rows (if the API 401s)

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

STOP = set("the a an of to in by and for on at is vs your you what how top best most this that it's guess before swipe comment question first number contrast steps which would one".split())
def words(s): return {w for w in re.findall(r"[a-z]+", s.lower()) if w not in STOP and len(w) > 2}
def nums(s): return {n for n in re.findall(r"\d+(?:\.\d+)?", s.replace(",", "")) if n not in {"2025", "2026", "2027"}}
def sim(topic, hook, text):
    """Hook numbers ($3.22B, 6.8%, 688) count most, since the hook is what the caption repeats; words count 1 each.
    Numbers in the topic (sources, years) are ignored: they caused false matches."""
    n = nums(hook) & nums(text)
    return sum(3 if len(x) > 1 else 1 for x in n) + len(words(topic + " " + hook) & words(text))

def fill(tt):
    lines = open(LOG, encoding="utf-8").read().split("\n")
    cutoff = (date.today() - timedelta(days=2)).isoformat()
    changed = 0; used = set()
    for i, ln in enumerate(lines):
        c = [x.strip() for x in ln.strip().strip("|").split("|")]
        if not re.match(r"\d{4}-\d{2}-\d{2}$", c[0]) or c[0] > cutoff: continue
        # rows don't all have the same columns; the 4 stats cells are the blanks right after the hook (last filled cell)
        last = max(j for j, x in enumerate(c) if x)
        if len(c) - 1 - last < 4: continue
        # match by posting day (±1) and word overlap between the log's topic + hook and the TikTok caption
        d = date.fromisoformat(c[0]); f = lambda p: sim(c[1], c[last], p["text"])
        cand = sorted((p for p in tt if p["t"] and abs((p["t"].date() - d).days) <= 1 and p["url"] + p["text"] not in used),
                      key=f, reverse=True)
        top = f(cand[0]) if cand else 0; second = f(cand[1]) if len(cand) > 1 else 0
        if top < 2 or top <= second: print(f"no clear match (skipped): {c[0]} {c[1][:50]}"); continue
        best = cand[0]; used.add(best["url"] + best["text"])
        c[last + 1:last + 5] = [str(best["views"]), str(best["likes"]), str(best["comments"]), str(best["shares"])]
        lines[i] = "| " + " | ".join(c) + " |"; changed += 1
        print(f"filled: {c[0]} {c[1][:50]} → {best['views']} views")
    if changed: open(LOG, "w", encoding="utf-8").write("\n".join(lines))
    return changed

def score(p): return (p["likes"] + 3 * p["comments"] + 2 * p["shares"]) / max(p["views"], 1)

if __name__ == "__main__":
    a = sys.argv[1:]; days = int(a[a.index("--days") + 1]) if "--days" in a else 14
    d1 = date.today(); d0 = d1 - timedelta(days=days)
    if "--from-json" in a:
        # fallback when the direct API is blocked: rows exported from the Metricool MCP tool
        # getAnalyticsDataByMetrics (TikTok post metrics) = [day, yyyymmddHHMMSS (UTC), url, cover, text, views, likes, comments, shares]
        rows = json.load(open(a[a.index("--from-json") + 1], encoding="utf-8"))
        rows = rows.get("rows", rows) if isinstance(rows, dict) else rows
        tt = [{"net": "tiktok", "t": datetime.strptime(r[1], "%Y%m%d%H%M%S") - timedelta(hours=5), "text": r[4], "url": r[2],
               "views": int(r[5] or 0), "likes": int(r[6] or 0), "comments": int(r[7] or 0), "shares": int(r[8] or 0)} for r in rows]
    else:
        tt = posts("tiktok", d0, d1)
    print(f"{len(tt)} TikTok posts in the last {days} days")
    fill(tt)
    if "--top" in a:
        ok = [p for p in tt if p["views"] >= 50]
        ok.sort(key=score, reverse=True)
        for lab, grp in (("TOP", ok[:3]), ("BOTTOM", ok[-3:][::-1])):
            for p in grp:
                print(f"{lab}  {p['t']:%m-%d}  {p['views']:>6} views  {score(p):.3f}  {p['text'][:70]!r}")
