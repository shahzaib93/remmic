#!/bin/bash

# REMMIC Content Database Backup Script
# This script creates automated backups of the content database

set -e

# Configuration
DB_HOST="postgres"
DB_PORT="5432"
DB_NAME="remmic_content"
DB_USER="remmic_user"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/remmic_content_backup_${DATE}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

echo "Starting database backup at $(date)"

# Create database backup
pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --no-owner \
    --no-privileges \
    > ${BACKUP_FILE}

# Compress the backup
gzip ${BACKUP_FILE}

echo "Database backup completed: ${BACKUP_FILE_COMPRESSED}"

# Clean up old backups (keep last 30 days)
find ${BACKUP_DIR} -name "remmic_content_backup_*.sql.gz" -mtime +30 -delete

# Create a latest backup symlink
ln -sf ${BACKUP_FILE_COMPRESSED} ${BACKUP_DIR}/latest_backup.sql.gz

# Backup file metadata
BACKUP_SIZE=$(du -h ${BACKUP_FILE_COMPRESSED} | cut -f1)
echo "Backup size: ${BACKUP_SIZE}"

# Log backup completion
echo "$(date): Backup completed successfully - ${BACKUP_FILE_COMPRESSED} (${BACKUP_SIZE})" >> ${BACKUP_DIR}/backup.log

# Optional: Upload to cloud storage (uncomment and configure as needed)
# aws s3 cp ${BACKUP_FILE_COMPRESSED} s3://your-backup-bucket/remmic/database/
# gsutil cp ${BACKUP_FILE_COMPRESSED} gs://your-backup-bucket/remmic/database/

echo "Backup process finished at $(date)"