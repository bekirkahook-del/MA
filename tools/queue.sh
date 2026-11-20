#!/bin/sh
# Shows what's waiting on staging and not live yet. Usage: sh tools/queue.sh
git fetch -q origin main staging
n=$(git rev-list --count origin/main..origin/staging)
[ "$n" = 0 ] && { echo "Queue empty. Nothing waiting to deploy."; exit 0; }
echo "$n change(s) waiting to deploy:"; git log --format='  - %s (%cr)' origin/main..origin/staging
