#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Restores a QR ALTRIX backup produced by scripts/backup.sh.
#
#   ./scripts/restore.sh backups/db-20261003-023000.dump [backups/storage-20261003-023000.tar.gz]
#
# This overwrites the current database. It asks for confirmation first, because
# restoring an old dump can resurrect deleted codes and lose recent scans.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

DUMP="${1:-}"
STORAGE="${2:-}"
DB_USER="${POSTGRES_USER:-qraltrix}"
DB_NAME="${POSTGRES_DB:-qraltrix}"

if [[ -z "$DUMP" || ! -f "$DUMP" ]]; then
  echo "usage: $0 <db-dump> [storage-archive]" >&2
  echo "available:" >&2
  ls -1 backups/db-*.dump 2>/dev/null >&2 || echo "  (none found in ./backups)" >&2
  exit 1
fi

echo "This will REPLACE the contents of database '$DB_NAME' with:"
echo "  $DUMP"
[[ -n "$STORAGE" ]] && echo "  $STORAGE (uploads)"
echo
read -r -p "Type RESTORE to continue: " CONFIRM
if [[ "$CONFIRM" != "RESTORE" ]]; then
  echo "Aborted."
  exit 1
fi

echo "▶ Stopping the app and worker so nothing writes mid-restore…"
docker compose stop app worker

echo "▶ Restoring the database…"
docker compose exec -T postgres psql -U "$DB_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS \"${DB_NAME}_restore_tmp\";" >/dev/null
docker compose exec -T postgres pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner \
  < "$DUMP"

if [[ -n "$STORAGE" && -f "$STORAGE" ]]; then
  echo "▶ Restoring uploads…"
  PROJECT="$(basename "$(pwd)")"
  docker run --rm \
    -v "${PROJECT}_storage-data:/data" \
    -v "$(pwd)/$(dirname "$STORAGE"):/backup:ro" \
    alpine:3 sh -c "rm -rf /data/* && tar -xzf /backup/$(basename "$STORAGE") -C /data"
fi

echo "▶ Applying any newer migrations…"
docker compose up -d app
sleep 5
docker compose exec -T app npx prisma migrate deploy

echo "▶ Starting the worker…"
docker compose up -d worker

echo "✔ Restore complete."
echo "  Check /api/health and open the dashboard before telling anyone it is done."
