#!/usr/bin/env bash
# =============================================================================
# backup.sh — Automated MySQL + storage backup for Family Finance
# =============================================================================
# Schedule this via cron:
#   sudo crontab -e
#   0 2 * * * /var/www/family-finance/deploy/backup.sh >> /var/log/family-finance-backup.log 2>&1
# =============================================================================
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
DB_NAME="postgres"
DB_USER="postgres"
DB_PASS="YOUR_DB_PASSWORD"
DB_HOST="YOUR_DB_HOST.supabase.co"
DB_PORT="5432"

BACKUP_DIR="/var/backups/family-finance"
STORAGE_DIR="/var/www/family-finance/backend/storage/app"
RETENTION_DAYS=30

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup..."

# ── Create backup directory ───────────────────────────────────────────────────
mkdir -p "$BACKUP_PATH"

# ── Database dump (PostgreSQL / Supabase) ─────────────────────────────────────
echo "  → Dumping PostgreSQL database via pg_dump..."
PGPASSWORD="$DB_PASS" pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --no-owner \
  --no-acl \
  --format=custom \
  --file="$BACKUP_PATH/database.pgdump"

echo "  → Database dump complete: $(du -sh "$BACKUP_PATH/database.pgdump" | cut -f1)"

# ── Storage backup ────────────────────────────────────────────────────────────
echo "  → Archiving storage/app..."
tar -czf "$BACKUP_PATH/storage.tar.gz" -C "$STORAGE_DIR" . 2>/dev/null || true

echo "  → Storage archive complete."

# ── Create manifest ───────────────────────────────────────────────────────────
echo "Timestamp: $TIMESTAMP" > "$BACKUP_PATH/manifest.txt"
echo "Database:  $DB_NAME"  >> "$BACKUP_PATH/manifest.txt"
ls -lh "$BACKUP_PATH"       >> "$BACKUP_PATH/manifest.txt"

# ── Remove backups older than retention period ────────────────────────────────
echo "  → Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true

# ── Summary ───────────────────────────────────────────────────────────────────
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup complete. Location: $BACKUP_PATH | Total backup size: $TOTAL_SIZE"
