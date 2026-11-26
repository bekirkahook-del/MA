#!/bin/sh
# Ships everything on staging to the live site in ONE Netlify deploy (~15 credits). Only run when Bekir says "deploy".
set -e
# Cap (Bekir, Nov 25, 2026): max 2 deploys per ET day. Log lives in tools/bots/state/deploys.log (one ET date per line).
LOG=tools/bots/state/deploys.log; TODAY=$(TZ=America/New_York date +%F); mkdir -p tools/bots/state
N=$(grep -c "^$TODAY" "$LOG" 2>/dev/null || true)
[ "${N:-0}" -ge 2 ] && { echo "Deploy cap hit: 2 today ($TODAY ET). Changes stay queued on staging."; exit 1; }
git fetch -q origin main staging
[ "$(git rev-list --count origin/main..origin/staging)" = 0 ] && { echo "Nothing queued."; exit 0; }
git checkout -q -B deploy-tmp origin/main
git merge -q --no-edit origin/staging -m "Deploy: $(git rev-list --count origin/main..origin/staging) queued change(s)"
git push -q origin HEAD:main
git push -q origin HEAD:staging   # keep staging level with main
echo "$TODAY $(TZ=America/New_York date +%T)" >> "$LOG"
echo "Deployed. Live in ~1 min."
