#!/usr/bin/env python3
"""Rule checker + time-slot picker for the daily social run (rules live in rules.json, mirrored from DAILY.md).

  python3 gen/check.py day.json          # check a day's queue before scheduling; exit 1 on any FAIL
  python3 gen/check.py slots 5 --date 2026-11-24 --taken 13:07,19:40 --yesterday 13:12,18:44

day.json (run from social/):
  {"date": "2026-11-24",
   "yesterday_times": ["13:12", "18:44"],                 # optional: minutes must differ from yesterday's
   "posts": [{"time": "13:07", "network": "tiktok", "kind": "picture" | "video",
              "key": "bc-rent1br", "topic": "Top 6 cities by rent", "caption": "... #finance #money",
              "media": ["https://.../01.jpg"], "style": "glow", "score": 80,
              "spec": "bc/2026-11-24/spec.json", "existing": false}]}
Put every post for that day in it: the ones getScheduledPosts already shows (existing: true) and the new ones.
"""
import json, os, random, re, sys
from datetime import date, datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
SOCIAL = os.path.dirname(HERE)
R = json.load(open(os.path.join(HERE, "rules.json")))
out = []
def res(level, msg): out.append((level, msg))

def mins(t): h, m = map(int, t.split(":")); return h * 60 + m
def hhmm(n): return f"{n // 60:02d}:{n % 60:02d}"
def tags(cap): return [t.lower() for t in re.findall(r"#(\w+)", cap or "")]
STOP = set("the a an of to in by and for on at is vs with your you what how top best most biggest highest 2025 2026".split())
def words(s): return {w for w in re.findall(r"[a-z0-9$%]+", (s or "").lower()) if w not in STOP and len(w) > 2}

def history():
    """(date, key, topic) from posted.md plus (date, topic, style) rows from punch-log.md."""
    posted, punch = [], []
    p = os.path.join(SOCIAL, "posted.md")
    if os.path.exists(p):
        for ln in open(p, encoding="utf-8"):
            m = re.match(r"-\s*(\d{4}-\d{2}-\d{2})\s+(\S+)\s+[—-]+\s*(.*)", ln.strip())
            if m: posted.append((m[1], m[2], m[3]))
    p = os.path.join(SOCIAL, "punch-log.md")
    if os.path.exists(p):
        for ln in open(p, encoding="utf-8"):
            c = [x.strip() for x in ln.strip().strip("|").split("|")]
            if len(c) > 4 and re.match(r"\d{4}-\d{2}-\d{2}$", c[0]): punch.append((c[0], c[1], c[3]))
    return posted, punch

def check(day):
    d = day["date"]; D = date.fromisoformat(d)
    posts = sorted(day.get("posts", []), key=lambda p: mins(p["time"]))
    posted, punch = history()

    if d in R["blackout_dates"]: res("FAIL", f"{d} is a no-post day")
    lo, hi = map(mins, R["window"])
    by_net = {}
    for p in posts: by_net.setdefault(p["network"].lower(), []).append(p)

    for net, ps in by_net.items():
        for cap in R["caps"]:
            if cap["network"] == net and cap["from"] <= d <= cap["to"] and len(ps) > cap["max"]:
                res("FAIL", f"{net}: {len(ps)} posts, cap is {cap['max']} a day")
        for a, b in zip(ps, ps[1:]):
            gap = mins(b["time"]) - mins(a["time"])
            if gap < R["min_gap_min"]: res("FAIL", f"{net}: {a['time']} and {b['time']} are only {gap} min apart (need {R['min_gap_min']})")
        if net not in R["no_mix_networks"]:
            vids = sum(p.get("kind") == "video" for p in ps)
            if vids > int(len(ps) * R["video_share_max"]): res("FAIL", f"{net}: {vids} videos of {len(ps)} posts, max is {int(len(ps) * R['video_share_max'])} (half, extra goes to pictures)")
            for a, b in zip(ps, ps[1:]):
                if a.get("kind") == b.get("kind") == "video": res("FAIL", f"{net}: two videos back to back ({a['time']}, {b['time']})")
        for a, b in zip(ps, ps[1:]):
            if a.get("caption") and a.get("caption") == b.get("caption"): res("FAIL", f"{net}: same caption at {a['time']} and {b['time']}")
            la, lb = [(x.get("caption") or "").strip().splitlines()[-1:] for x in (a, b)]
            if la and la == lb and not la[0].startswith("#"): res("WARN", f"{net}: same closing line at {a['time']} and {b['time']}")
            ta, tb = set(tags(a.get("caption"))), set(tags(b.get("caption")))
            if ta and ta == tb: res("FAIL", f"{net}: same hashtag set at {a['time']} and {b['time']}")

    yest = {t.split(":")[1] for t in day.get("yesterday_times", [])}
    for p in posts:
        net, t, cap, k = p["network"].lower(), p["time"], p.get("caption") or "", p.get("key", "?")
        tag = f"{t} {net} {k}"
        if not lo <= mins(t) <= hi: res("FAIL", f"{tag}: outside {R['window'][0]}–{R['window'][1]} ET")
        if t.split(":")[1] in yest and not p.get("existing"): res("WARN", f"{tag}: same minute (:{t.split(':')[1]}) as a post yesterday")
        for nm in R["no_mention"]:
            if nm["from"] <= d <= nm["to"] and net not in nm["except"] and re.search(nm["pattern"], cap, re.I):
                res("FAIL", f"{tag}: mentions M&A Prep during the no-mention window ({nm['from']}–{nm['to']})")
        for b in R["banned_phrases"]:
            if b in cap.lower(): res("FAIL", f"{tag}: caption has banned phrase '{b}'")
        if net in R["hashtags"]:
            lo_t, hi_t = R["hashtags"][net]; n = len(tags(cap))
            if not lo_t <= n <= hi_t: res("FAIL", f"{tag}: {n} hashtags, need {lo_t}–{hi_t}")
            off = [x for x in tags(cap) if x not in R["hashtags"]["pool"]]
            if off: res("WARN", f"{tag}: hashtags not in the pool: {' '.join('#' + x for x in off)}")
        if net == "tiktok" and p.get("kind") == "picture":
            bad = [m for m in p.get("media", []) if not os.path.splitext(m.split("?")[0])[1].lower() in R["tiktok_photo_ext"]]
            if bad: res("FAIL", f"{tag}: TikTok photo posts must be JPG ({len(bad)} file(s) aren't)")
        if p.get("kind") == "video" and p.get("score") is not None and p["score"] < R["video_score_min"]:
            res("FAIL", f"{tag}: video scored {p['score']}, floor is {R['video_score_min']}")
        if p.get("existing"): continue
        # never repeat a key; warn on near-duplicate topics in the last N days
        cutoff = (D - timedelta(days=R["no_repeat_days"])).isoformat()
        for pd, pk, pt in posted:
            if pk == k and pd != d: res("FAIL", f"{tag}: key '{k}' was already used on {pd}")
            elif pd >= cutoff and pk != k and p.get("topic"):
                a, b = words(p["topic"]), words(pt)
                if a and b and len(a & b) / len(a | b) >= 0.6: res("WARN", f"{tag}: topic looks like {pd} {pk} ({pt[:60]})")
        # numbers in the caption must exist in the spec the slides/video were rendered from
        if p.get("spec"):
            sp = os.path.join(SOCIAL, p["spec"])
            if not os.path.exists(sp): res("WARN", f"{tag}: spec {p['spec']} not found")
            else:
                spec = open(sp, encoding="utf-8").read().replace(",", "")
                for n in re.findall(r"\d[\d,]*\.?\d*", re.sub(r"#\w+", "", cap)):
                    v = n.replace(",", "").rstrip(".")
                    if len(v) >= 2 and v not in spec: res("FAIL", f"{tag}: caption number {n} isn't in the spec")

    # ranking styles: never the same twice in a row (vs. the last punch-log row and within the day)
    sty = lambda v: (re.split(r"[\s,+]+", v.strip().lower()) + [""])[0] or None
    last = next((sty(r[2]) for r in reversed(punch) if r[2] and sty(r[2]) in R["styles"]), None)
    for p in posts:
        s = sty(p["style"]) if p.get("style") else None
        if not s or p.get("existing"): continue
        if s == last: res("FAIL", f"{p['time']} {p.get('key')}: style '{s}' is the same as the last ranking video")
        last = s

def slots(n, d, taken, yest, seed=None):
    rnd = random.Random(seed)
    lo, hi = map(mins, R["window"]); gap = R["min_gap_min"]
    now = datetime.now()
    if d == now.date().isoformat(): lo = max(lo, now.hour * 60 + now.minute + 15)
    taken = [mins(t) for t in taken]; ym = {t.split(":")[1] for t in yest}
    # n slots with >= gap minutes between them: hand out the spare minutes at random, so spacing varies day to day
    span = hi - lo; slack = span - gap * (n - 1)
    if n < 1 or slack < 0: return None
    for _ in range(4000):
        w = [rnd.random() for _ in range(n + 1)]; w[-1] *= 0.5  # keep a little less room at the end of the night
        tot = sum(w); x = lo + int(slack * w[0] / tot); pick = [x]
        for i in range(1, n): x += gap + int(slack * w[i] / tot); pick.append(x)
        if any(p % 5 == 0 for p in pick): continue  # avoid round :00/:05 minutes
        allt = sorted(pick + taken)
        if all(b - a >= gap for a, b in zip(allt, allt[1:])) and not any(f"{x % 60:02d}" in ym for x in pick) and pick[-1] <= hi:
            return [hhmm(x) for x in pick]
    return None

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(2)
    if a[0] == "slots":
        n = int(a[1]); opt = dict(zip(a[2::2], a[3::2]))
        d = opt.get("--date", date.today().isoformat())
        sp = lambda s: [x for x in (s or "").split(",") if x]
        r = slots(n, d, sp(opt.get("--taken")), sp(opt.get("--yesterday")), opt.get("--seed"))
        print(" ".join(r) if r else "No room for that many posts with 60-min gaps."); sys.exit(0 if r else 1)
    check(json.load(open(a[0], encoding="utf-8")))
    fails = [m for l, m in out if l == "FAIL"]
    for l, m in out: print(f"{l}  {m}")
    print(f"\n{'PASS' if not fails else 'FAIL'}: {len(fails)} fail, {len(out) - len(fails)} warn")
    sys.exit(1 if fails else 0)
