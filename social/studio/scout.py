#!/usr/bin/env python3
"""Scout Bot (free, no vidIQ): weekly ranked idea list from competitor outliers + our own winners.
1. Competitor outliers: public YouTube RSS feeds (official, free, no key) of finance/IB channels in
   social/scout-accounts.json. Outlier score = views / that channel's own median (vidIQ-style), with a
   view floor and video-age boost (newer videos had less time, so their score is age-normalized).
   Shorts creators post the same clips to TikTok/IG, so YT outliers are a fair proxy for all three.
2. Hook patterns: each outlier title is tagged (number-first, money, hype, emoji/CAPS, question, conflict, vs, list, you/POV, interview, time).
3. Our own winners: social/winners.md post log (avg views per idea type) + Metricool weekly totals.
4. Output: ranked ideas = our winning idea types x the hook patterns that are breaking out right now.
Facts and patterns only: titles are used for tagging, never copied into our posts.
Usage: python3 social/studio/scout.py [--write]   (--write prepends this week to social/trends.md)
Cost: 1 HTTP GET per channel (~15 total), cached 3 days in tools/bots/state/scout-cache.json."""
import sys, os, re, json, time, statistics, urllib.request, datetime as dt
from xml.etree import ElementTree as ET

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ACC = os.path.join(ROOT, 'social', 'scout-accounts.json')
CACHE = os.path.join(ROOT, 'social', 'studio', '.scout-cache.json')
NS = {'a': 'http://www.w3.org/2005/Atom', 'm': 'http://search.yahoo.com/mrss/', 'yt': 'http://www.youtube.com/xml/schemas/2015'}
UA = {'User-Agent': 'Mozilla/5.0 (scout bot)'}

PATTERNS = [
    ('number-first', r'^\W*(\$?\d|top \d|#\d)'),
    ('money', r'\$\d|\d+k\b|million|billion|salary|paid|bonus|makes|earn'),
    ('hype', r'\b(insane|crazy|really|actually|secret|shocking|wild)\b|!'),
    ('emoji/CAPS', r'[\U0001F300-\U0001FAFF]|\b[A-Z]{4,}\b'),
    ('question', r'\?|^(why|how|what|which|would|can|is|do|does)\b'),
    ('conflict', r'\b(wrong|mistake|never|stop|lie|myth|truth|nobody|worst|fail|trap|scam|regret|hate)\b'),
    ('vs', r'\bvs\.?\b|\bversus\b|\bor\b.*\?'),
    ('list', r'\b(\d+) (things|ways|reasons|mistakes|tips|jobs|questions|steps)\b'),
    ('you/POV', r'\b(you|your|pov)\b'),
    ('interview', r'\binterview|superday|recruit|internship|resume\b'),
    ('time/speed', r'\b(\d+ (seconds|minutes|sec|min)|in \d+)\b'),
]

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r: return r.read().decode('utf-8', 'replace')

def tags(t):
    return [n for n, p in PATTERNS if re.search(p, t if n == 'emoji/CAPS' else t.lower())]

def channel_id(handle):
    m = re.search(r'"externalId":"(UC[\w-]{22})"', get(f'https://www.youtube.com/@{handle}'))
    return m.group(1) if m else None

def feed(cid):
    root = ET.fromstring(get(f'https://www.youtube.com/feeds/videos.xml?channel_id={cid}'))
    out = []
    for e in root.findall('a:entry', NS):
        st = e.find('m:group/m:community/m:statistics', NS)
        out.append({'title': e.findtext('a:title', '', NS), 'id': e.findtext('yt:videoId', '', NS),
                    'pub': e.findtext('a:published', '', NS)[:10], 'views': int(st.get('views', 0)) if st is not None else 0})
    return out

def load_json(p, d):
    try: return json.load(open(p))
    except Exception: return d

def competitors():
    acc = load_json(ACC, {'youtube': []}); cache = load_json(CACHE, {})
    fresh = cache.get('t', 0) > time.time() - 3 * 86400
    rows, changed = [], False
    for a in acc['youtube']:
        if not a.get('id'):
            try: a['id'] = channel_id(a['handle']); changed = True
            except Exception: a['id'] = None
            if not a['id']: print(f"skip @{a['handle']}: no channel id"); continue
        if fresh and a['id'] in cache.get('feeds', {}): vids = cache['feeds'][a['id']]
        else:
            try: vids = feed(a['id'])
            except Exception as e: print(f"skip @{a['handle']}: {e}"); continue
            cache.setdefault('feeds', {})[a['id']] = vids
        if len(vids) < 5: continue
        med = statistics.median(v['views'] for v in vids) or 1
        today = dt.date.today()
        for v in vids:
            age = max(1, (today - dt.date.fromisoformat(v['pub'])).days)
            boost = 1.0 if age >= 14 else (14 / age) ** 0.5   # young videos still climbing
            rows.append({**v, 'who': a['handle'], 'median': int(med), 'score': round(v['views'] / med * boost, 1)})
    if changed: json.dump(acc, open(ACC, 'w'), indent=1)
    if not fresh: cache['t'] = time.time()
    json.dump(cache, open(CACHE, 'w'))
    since = (dt.date.today() - dt.timedelta(days=45)).isoformat()
    return [r for r in rows if r['score'] >= 2.5 and r['views'] >= 5000 and r['pub'] >= since]

def our_winners():
    txt = open(os.path.join(ROOT, 'social', 'winners.md')).read()
    log = txt[txt.find('## Post log'):]
    by = {}
    for ln in log.split('\n'):
        c = [x.strip() for x in ln.split('|')]
        if len(c) < 6 or not re.match(r'\d\d-\d\d', c[1]): continue
        v = sum(int(x.replace(',', '')) for x in (c[4], c[5]) if re.fullmatch(r'[\d,]+', x))
        if v: by.setdefault(c[3], []).append(v)
    return sorted(((k, round(statistics.mean(v)), len(v)) for k, v in by.items() if len(v) >= 2), key=lambda x: -x[1])  # 1 post = noise

def metricool():
    d = load_json(os.path.join(ROOT, 'tools', 'bots', 'state', 'metricool', 'snapshot.json'), {})
    out = []
    for p, m in d.get('platforms', {}).items():
        v = m.get('views', {})
        if v.get('prev'): out.append(f"{p} {v['now']:,} views ({(v['now'] / v['prev'] - 1) * 100:+.0f}% wk/wk)")
    return out, d.get('pulled', '?')

def main(a):
    outl = sorted(competitors(), key=lambda r: -r['score'])
    pat = {}
    for r in outl:
        for t in tags(r['title']): pat[t] = pat.get(t, 0) + r['score']
    pats = sorted(pat.items(), key=lambda x: -x[1])
    wins = our_winners(); mc, pulled = metricool()
    L = [f"## Week of {dt.date.today().isoformat()} (scout.py)", '',
         f"**Competitor outliers** (YouTube RSS, score = views / channel median, age-adjusted; {len(outl)} found):",
         '| Score | Views | Channel | Title (for tagging only, never copy) | Tags | Link |', '|---|---|---|---|---|---|']
    for r in outl[:10]:
        L.append(f"| {r['score']}x | {r['views']:,} | @{r['who']} (median {r['median']:,}) | {r['title'][:60].replace('|', '/')} | {', '.join(tags(r['title'])) or '-'} | youtu.be/{r['id']} |")
    L += ['', '**Hook patterns breaking out** (sum of outlier scores): ' + (', '.join(f"{k} {v:.0f}" for k, v in pats[:6]) or 'none'),
          '', '**Our idea types** (winners.md log, avg IG+TT views): ' + '; '.join(f"{k} {v:,} ({n})" for k, v, n in wins[:5]),
          f"**Metricool** ({pulled}): " + ('; '.join(mc) or 'no snapshot'), '', '**Ranked ideas this week** (our top idea type x top hook pattern):']
    top_p = [k for k, _ in pats[:3]] or ['number-first', 'conflict', 'question']
    n = 0
    for k, v, _ in wins[:3]:
        for p in top_p[:2]:
            n += 1; L.append(f"{n}. {k} + {p} hook (ours avg {v:,})")
    L.append(f"{n + 1}. TEST slot: best competitor outlier's format, our own numbers and words")
    out = '\n'.join(L)
    print(out)
    if '--write' in a:
        p = os.path.join(ROOT, 'social', 'trends.md'); s = open(p).read()
        head, _, rest = s.partition('\n## ')
        open(p, 'w').write(head + '\n' + out + '\n\n## ' + rest if rest else s + '\n' + out + '\n')
    return 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
