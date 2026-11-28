#!/usr/bin/env python3
"""Slot Bot: checks one day's plan BEFORE scheduling (F3 + the 6/day rule).
  - exactly 6 posts per platform (min and max, Bekir Nov 28)
  - same platform: >= 2 h apart (F3); 12:00-23:00 ET only
  - videos get the best hours first (winners.md: 10 AM / 6 PM ET), so it suggests a fix
Input: text file, one post per line: "<platform> <HH:MM> <video|slides> [name]"
Usage: python3 social/studio/slots.py plan.txt   (exit 1 if anything fails)"""
import sys, collections

def mins(t): h, m = t.split(':'); return int(h) * 60 + int(m)

def main(a):
    if not a: print(__doc__); return 2
    by = collections.defaultdict(list)
    for ln in open(a[0]):
        x = ln.split()
        if len(x) >= 3 and not ln.startswith('#'): by[x[0].lower()].append((mins(x[1]), x[1], x[2], ' '.join(x[3:])))
    bad = 0
    for plat, ps in sorted(by.items()):
        ps.sort(); err = []
        if len(ps) != 6: err.append(f'{len(ps)} posts (need exactly 6)')
        for p in ps:
            if not 12 * 60 <= p[0] <= 23 * 60: err.append(f'{p[1]} outside 12:00-23:00 ET')
        for p, q in zip(ps, ps[1:]):
            if q[0] - p[0] < 120: err.append(f'{p[1]} -> {q[1]} only {q[0]-p[0]} min apart (need 120)')
        vids = [p for p in ps if p[2].startswith('vid')]
        if vids and not any(abs(p[0] - 18 * 60) <= 30 for p in vids): err.append('no video near 6 PM ET (best slot)')
        bad += bool(err)
        print(f"{'PASS' if not err else 'FAIL'}  {plat:9} {len(ps)} posts: " + ', '.join(p[1] for p in ps))
        for e in err: print('   FAIL', e)
    print('SLOT BOT: ' + ('ALL PASS' if not bad else f'{bad} platform(s) FAIL -> respace before scheduling'))
    print('   tip: 6 slots 2 h apart fit 12:00, 14:00, 16:00, 18:00 (video), 20:00, 22:00')
    return 1 if bad else 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
