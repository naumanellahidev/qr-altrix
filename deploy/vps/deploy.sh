#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# QR ALTRIX auto-deploy for a VPS that already runs its own Nginx.
#
# Polls the GitHub branch and, when the commit changes, rebuilds the containers,
# applies migrations and verifies health before recording the new SHA. Driven by
# qraltrix-autodeploy.timer (every minute); safe to run by hand with --force.
#
# Layout it expects:
#   /opt/qraltrix/.env          ← the real environment file (NOT in the repo)
#   /opt/qraltrix/repo          ← the git checkout
#   /opt/qraltrix/backups       ← pg dumps + upload archives
#   /opt/qraltrix/logs          ← deploy.log
# ---------------------------------------------------------------------------
set -euo pipefail

BASE=/opt/qraltrix
REPO_URL=${REPO_URL:-https://github.com/naumanellahidev/qr-altrix.git}
BRANCH=${BRANCH:-main}
PROJECT=qraltrix
COMPOSE_FILE=docker-compose.vps.yml
HEALTH_URL=${HEALTH_URL:-http://127.0.0.1:3010/api/health}
LOG=$BASE/logs/deploy.log

mkdir -p "$BASE/logs" "$BASE/backups"

# One deploy at a time; a slow build must not overlap the next timer tick.
exec 9>"$BASE/.lock"
flock -n 9 || exit 0

[ -f "$BASE/.env" ] || { echo "missing $BASE/.env — create it before deploying" >&2; exit 1; }
[ -d "$BASE/repo/.git" ] || git clone -q --branch "$BRANCH" "$REPO_URL" "$BASE/repo"

cd "$BASE/repo"
git fetch -q origin "$BRANCH"
NEW=$(git rev-parse "origin/$BRANCH")
CUR=$(cat "$BASE/deployed_sha" 2>/dev/null || true)

if [ "$NEW" = "$CUR" ] && [ "${1:-}" != "--force" ]; then
  exit 0
fi

{
  echo "=== $(date -Is) deploying $NEW (was ${CUR:-none})"

  git reset -q --hard "origin/$BRANCH"
  # Keep node_modules (build cache) but drop everything else untracked, then put the
  # environment and backups back — they live outside the tree on purpose.
  git clean -qfdx -e node_modules
  cp "$BASE/.env" "$BASE/repo/.env"
  ln -sfn "$BASE/backups" "$BASE/repo/backups"

  COMPOSE="docker compose -p $PROJECT -f $COMPOSE_FILE"

  $COMPOSE up -d --build
  # Migrations are additive and idempotent, so they run on every deploy.
  $COMPOSE exec -T app npx prisma migrate deploy

  echo "--- waiting for health"
  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
      echo "--- healthy after ${attempt}0s or less"
      break
    fi
    if [ "$attempt" = "30" ]; then
      echo "!!! health check never passed — leaving containers up for inspection"
      exit 1
    fi
    sleep 5
  done

  # Tell IndexNow engines (Bing, Yandex…) about new or changed public pages. Needs
  # INDEXNOW_KEY in the .env; skips quietly without it and never fails a deploy.
  $COMPOSE exec -T app node scripts/indexnow.mjs || true

  echo "$NEW" > "$BASE/deployed_sha"
  docker image prune -f --filter 'until=168h' >/dev/null 2>&1 || true

  echo "=== $(date -Is) done $NEW"
} >> "$LOG" 2>&1 || {
  echo "=== $(date -Is) FAILED $NEW" >> "$LOG"
  exit 1
}
