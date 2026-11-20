#!/bin/sh
# Ships everything on staging to the live site in ONE Netlify deploy (~15 credits). Only run when Bekir says "deploy".
set -e
git fetch -q origin main staging
[ "$(git rev-list --count origin/main..origin/staging)" = 0 ] && { echo "Nothing queued."; exit 0; }
git checkout -q -B deploy-tmp origin/main
git merge -q --no-edit origin/staging -m "Deploy: $(git rev-list --count origin/main..origin/staging) queued change(s)"
git push -q origin HEAD:main
git push -q origin HEAD:staging   # keep staging level with main
echo "Deployed. Live in ~1 min."
