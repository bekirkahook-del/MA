#!/usr/bin/env python3
"""Copy Gate: scores post text BEFORE scheduling. Catches the text fails that hit the gate most (Nov 27-28):
  F2  no mnaprep.com in the post text, no first comment on IG/FB/YT, Pinterest link not mnaprep.com
  A2  unsourced crowd claims ("almost everyone says", "most people", "real interview question")
  A4  AI voice/visuals but no AI label
  B2  hook score 0-5 on the first line / slide-1 headline (number, conflict, curiosity, short, no slow opener)
Input: JSON file, one post or a list:
  {"platform":"tiktok|instagram|facebook|youtube|pinterest","text":"...","hook":"slide 1 / cold-open text",
   "firstComment":"...","link":"...","ai":true,"aiLabel":true,"source":"P&Q Sept 2026"}
Usage: python3 social/studio/copygate.py posts.json   (exit 1 if any post fails)"""
import sys, re, json

SLOW = re.compile(r"^(meet|remember|hey|so[, ]|today|in this video|let'?s talk|welcome|did you know that)", re.I)
CROWD = re.compile(r"\b(almost everyone|everyone (says|gets|thinks)|most people|nobody knows|90% of|99% of|"
                   r"real interview question|bankers (always|never)|recruiters (love|hate))\b", re.I)
CONFLICT = re.compile(r"\b(wrong|trap|mistake|never|stop|lie|myth|vs\.?|beat|lost|crash|why|secret|actually|guess)\b", re.I)

def hook_score(h):
    h = (h or '').strip().split('\n')[0]
    words = h.split()
    s = []
    if re.search(r'\d|\$', h): s.append('number')
    if CONFLICT.search(h): s.append('conflict')
    if '?' in h or re.search(r'\b(guess|which|can you|would you)\b', h, re.I): s.append('curiosity')
    if 0 < len(words) <= 10: s.append('short')
    if h and not SLOW.match(h): s.append('fast open')
    return len(s), s

def check(p):
    plat = p.get('platform', '').lower(); text = p.get('text', '') or ''; fails, warns = [], []
    if plat == 'pinterest':
        if 'mnaprep.com' not in (p.get('link') or ''): fails.append('F2 pin link is not mnaprep.com')
    else:
        tail = '\n'.join(text.strip().split('\n')[-3:])
        if 'mnaprep.com' not in tail.lower(): fails.append('F2 mnaprep.com missing from last 3 lines of post text')
        if plat in ('instagram', 'facebook', 'youtube') and 'mnaprep.com' not in (p.get('firstComment') or '').lower():
            fails.append('F2 first comment with mnaprep.com missing')
    blob = ' '.join([text, p.get('hook', '') or ''])
    m = CROWD.search(blob)
    if m and not p.get('source'): fails.append(f'A2 unsourced crowd claim "{m.group(0)}": cut it or add a source')
    if p.get('ai') and not p.get('aiLabel'): fails.append('A4 AI content but no AI label')
    sc, why = hook_score(p.get('hook') or text)
    if sc < 3: fails.append(f'B2 hook {sc}/5 ({", ".join(why) or "nothing"}): add a number or conflict, cut to <=10 words')
    elif sc < 4: warns.append(f'B2 hook {sc}/5 ({", ".join(why)}): good, could be sharper')
    if plat == 'tiktok' and len(text) > 2200: fails.append('F1 TikTok text over 2,200 chars')
    return sc, fails, warns

def main(a):
    if not a: print(__doc__); return 2
    d = json.load(open(a[0])); posts = d if isinstance(d, list) else [d]; bad = 0
    for i, p in enumerate(posts, 1):
        sc, fails, warns = check(p); bad += bool(fails)
        print(f"{'PASS' if not fails else 'FAIL'}  #{i} {p.get('platform','?'):9} hook {sc}/5  {(p.get('hook') or p.get('text',''))[:50]!r}")
        for x in fails: print('   FAIL', x)
        for x in warns: print('   WARN', x)
    print('COPY GATE: ' + ('ALL PASS' if not bad else f'{bad} post(s) FAIL -> fix before scheduling'))
    return 1 if bad else 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
