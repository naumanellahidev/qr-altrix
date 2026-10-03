#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Backs up the PostgreSQL database and the uploads volume.
#
#   ./scripts/backup.sh                 # writes to ./backups
#   RETAIN_DAYS=14 ./scripts/backup.sh  # prune older sets
#
# Suggested cron (daily at 02:30):
#   30 2 * * * cd /opt/qr-altrix && ./scripts/backup.sh >> backups/backup.log 2>&1
#
# A dynamic QR code is only as permanent as its database row — take these seriously.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

STAMP="$(date -u +%Y%m%d-%H%M%S)"
DIR="backups"
RETAIN_DAYS="${RETAIN_DAYS:-30}"
DB_USER="${POSTGRES_USER:-qraltrix}"
DB_NAME="${POSTGRES_DB:-qraltrix}"

mkdir -p "$DIR"

echo "▶ Dumping database $DB_NAME…"
docker compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --format=custom \
  > "$DIR/db-$STAMP.dump"
echo "  · $DIR/db-$STAMP.dump ($(du -h "$DIR/db-$STAMP.dump" | cut -f1))"

echo "▶ Archiving uploads…"
# The uploads live in a named volume; tar it from a throwaway container.
PROJECT="${COMPOSE_PROJECT_NAME:-$(basename "$(pwd)")}"
docker run --rm   -v "${PROJECT}_storage-data:/data:ro"   -v "$(pwd)/$DIR:/backup"   alpine:3 tar -czf "/backup/storage-$STAMP.tar.gz" -C /data .
echo "  · $DIR/storage-$STAMP.tar.gz ($(du -h "$DIR/storage-$STAMP.tar.gz" | cut -f1))"

echo "▶ Recording the schema version…"
docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -At \
  -c 'SELECT migration_name FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 1;' \
  > "$DIR/schema-$STAMP.txt" 2>/dev/null || echo "unknown" > "$DIR/schema-$STAMP.txt"

if [[ "$RETAIN_DAYS" -gt 0 ]]; then
  echo "▶ Pruning backups older than $RETAIN_DAYS days…"
  find "$DIR" -maxdepth 1 -type f \( -name 'db-*.dump' -o -name 'storage-*.tar.gz' -o -name 'schema-*.txt' \) \
    -mtime "+$RETAIN_DAYS" -print -delete
fi

echo "✔ Backup complete: $STAMP"
echo "  Copy $DIR off this machine — a backup on the same disk is not a backup."
