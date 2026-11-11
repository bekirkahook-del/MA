#!/usr/bin/env python3
"""Turn a school entry from guides/_src/schools.py into a make.py spec (only the sourced facts on the page).
usage: python3 spec.py <slug-prefix> <voice> > spec.json"""
import sys, os, re, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "guides", "_src"))
import schools
ACCENTS = {"ohio-state": "#BB0000", "michigan": "#FFCB05", "indiana": "#990000", "penn-state": "#1E407C", "wisconsin": "#C5050C",
           "illinois": "#E84A27", "purdue": "#CFB991", "miami": "#C3142D", "notre-dame": "#0C2340", "ut-austin": "#BF5700"}
strip = lambda s: re.sub(r"<[^>]+>", "", s).replace("–", " to ").strip()
pre, voice = sys.argv[1], sys.argv[2]
S = [x for x in schools.SCHOOLS if x["slug"].startswith(pre)][0]
name = S["h1"].replace("How to get into investment banking from ", "")
acc = next((v for k, v in ACCENTS.items() if S["slug"].startswith(k)), "#2448D8")
def short(t, n=95):
    t = strip(t); return t if len(t) <= n else t[:t.rfind(" ", 0, n)] + "…"
sc = [{"hero": 1, "kicker": "M&A Prep · school guide", "title": f"Investment banking<br>from {name}",
       "sub": "The exact plan, year by year", "intro": f"Here's exactly how to get into investment banking from {name}. " + strip(S["lede"][0])}]
b = S["body"]; i = 0; qas = []
while i < len(b):
    blk = b[i]
    if blk[0] == "card":
        bl = blk[2][:4]
        sc.append({"kicker": "What to know", "title": blk[1], "intro": f"{blk[1]}." if not blk[1].startswith("What") else "Here's what actually moves the needle.",
                   "bullets": [[short(x), strip(x)] for x in bl]})
    elif blk[0] == "table":
        rows = blk[2]
        sc.append({"kicker": "Timeline", "title": f"Your timeline at {name.split(' (')[0]}", "intro": "Here's the timeline, year by year.",
                   "bullets": [[f"<b>{strip(r[0])}</b> · {short(r[1], 80)}", f"{strip(r[0])}. {strip(r[1])}"] for r in rows]})
    elif blk[0] == "qa": qas.append(blk)
    i += 1
if qas:
    sc.append({"kicker": "Quick answers", "title": "Common questions", "intro": "",
               "bullets": [[f"<b>{strip(q[1])}</b><br>{short(q[2], 90)}", f"{strip(q[1])} {strip(q[2])}"] for q in qas[:3]]})
sc.append({"hero": 1, "kicker": "Free practice", "title": "Train like it's a game", "sub": f"mnaprep.com · full {name.split(' (')[0]} guide linked below",
           "pill": "mnaprep.com", "intro": "If you want to actually practice the technicals, go to M and A prep dot com. It's free, five-minute levels with real interview questions. The full written guide is linked in the description. Good luck."})
sname = name.split(" (")[0]
print(json.dumps({"school": sname, "accent": acc, "voice": voice, "file": f"ib-from-{S['slug'].replace('-investment-banking','')}.mp4",
                  "url": f"https://mnaprep.com/guides/{S['slug']}/", "thumb": ["IB FROM", sname.upper() + "?"], "scenes": sc}, indent=1))
