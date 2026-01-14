#!/bin/bash

# REMMIC Asset Backup Script
# Creates versioned backups of logos and assets with metadata

set -e

# Configuration
BACKUP_DIR="/backups/assets"
ASSETS_DIR="/var/www/assets"
MINIO_BUCKET="remmic/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="assets_backup_${DATE}"
KEEP_DAYS=${KEEP_DAYS:-30}

# MinIO client configuration
MC_HOST_remmic="http://minioadmin:minioadmin123@minio:9000"

echo "Starting asset backup process at $(date)"

# Create backup directory structure
mkdir -p ${BACKUP_DIR}
mkdir -p ${BACKUP_DIR}/${BACKUP_NAME}

# Function to calculate file hash
calculate_hash() {
    local file="$1"
    if [ -f "$file" ]; then
        sha256sum "$file" | cut -d' ' -f1
    else
        echo "N/A"
    fi
}

# Function to get file size
get_file_size() {
    local file="$1"
    if [ -f "$file" ]; then
        stat -c%s "$file"
    else
        echo "0"
    fi
}

# Create backup metadata
create_metadata() {
    cat > ${BACKUP_DIR}/${BACKUP_NAME}/metadata.json << EOF
{
  "backup_info": {
    "timestamp": "$(date -Iseconds)",
    "backup_name": "${BACKUP_NAME}",
    "hostname": "$(hostname)",
    "backup_type": "assets",
    "version": "1.0.0"
  },
  "source_info": {
    "assets_directory": "${ASSETS_DIR}",
    "total_size_bytes": $(du -sb ${ASSETS_DIR} 2>/dev/null | cut -f1 || echo 0),
    "file_count": $(find ${ASSETS_DIR} -type f 2>/dev/null | wc -l || echo 0)
  },
  "assets": {
    "logos": [],
    "images": [],
    "optimized": []
  }
}
EOF
}

# Backup logos with metadata
backup_logos() {
    echo "Backing up logo assets..."
    
    local logo_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/logos"
    mkdir -p "$logo_backup_dir"
    
    if [ -d "${ASSETS_DIR}/logos" ]; then
        # Copy all logo files
        cp -r ${ASSETS_DIR}/logos/* "$logo_backup_dir/" 2>/dev/null || true
        
        # Create logo manifest
        cat > "$logo_backup_dir/logo_manifest.json" << EOF
{
  "backup_timestamp": "$(date -Iseconds)",
  "logos": [
EOF
        
        local first_file=true
        for logo_file in ${ASSETS_DIR}/logos/*; do
            if [ -f "$logo_file" ]; then
                local filename=$(basename "$logo_file")
                local file_hash=$(calculate_hash "$logo_file")
                local file_size=$(get_file_size "$logo_file")
                
                # Add comma for JSON formatting (except first file)
                if [ "$first_file" = true ]; then
                    first_file=false
                else
                    echo "," >> "$logo_backup_dir/logo_manifest.json"
                fi
                
                cat >> "$logo_backup_dir/logo_manifest.json" << EOF
    {
      "filename": "${filename}",
      "original_path": "${logo_file}",
      "size_bytes": ${file_size},
      "sha256": "${file_hash}",
      "mime_type": "$(file -b --mime-type "$logo_file" 2>/dev/null || echo 'application/octet-stream')",
      "backup_timestamp": "$(date -Iseconds)"
    }
EOF
            fi
        done
        
        cat >> "$logo_backup_dir/logo_manifest.json" << EOF
  ]
}
EOF
        
        echo "Logo backup completed: $(find "$logo_backup_dir" -type f | wc -l) files"
    fi
}

# Backup optimized assets
backup_optimized() {
    echo "Backing up optimized assets..."
    
    local optimized_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/optimized"
    mkdir -p "$optimized_backup_dir"
    
    if [ -d "${ASSETS_DIR}/optimized" ]; then
        # Copy optimized assets
        cp -r ${ASSETS_DIR}/optimized/* "$optimized_backup_dir/" 2>/dev/null || true
        
        # Create optimization manifest
        cat > "$optimized_backup_dir/optimization_manifest.json" << EOF
{
  "backup_timestamp": "$(date -Iseconds)",
  "optimization_info": {
    "generated_at": "$(date -Iseconds)",
    "optimization_script": "/usr/local/bin/optimize-assets.sh",
    "tools_used": ["imagemagick", "optipng", "jpegoptim", "webp-tools"]
  },
  "optimized_assets": [
EOF
        
        local first_file=true
        find ${ASSETS_DIR}/optimized -type f 2>/dev/null | while read optimized_file; do
            local relative_path=${optimized_file#${ASSETS_DIR}/optimized/}
            local file_hash=$(calculate_hash "$optimized_file")
            local file_size=$(get_file_size "$optimized_file")
            
            # Add comma for JSON formatting (except first file)
            if [ "$first_file" = true ]; then
                first_file=false
            else
                echo ","
            fi
            
            cat << EOF
    {
      "path": "${relative_path}",
      "size_bytes": ${file_size},
      "sha256": "${file_hash}",
      "mime_type": "$(file -b --mime-type "$optimized_file" 2>/dev/null || echo 'application/octet-stream')"
    }
EOF
        done >> "$optimized_backup_dir/optimization_manifest.json"
        
        echo "" >> "$optimized_backup_dir/optimization_manifest.json"
        echo "  ]" >> "$optimized_backup_dir/optimization_manifest.json"
        echo "}" >> "$optimized_backup_dir/optimization_manifest.json"
        
        echo "Optimized assets backup completed"
    fi
}

# Backup configuration files
backup_configuration() {
    echo "Backing up configuration files..."
    
    local config_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/config"
    mkdir -p "$config_backup_dir"
    
    # Copy asset-related configuration
    [ -f "${ASSETS_DIR}/../nginx.conf" ] && cp "${ASSETS_DIR}/../nginx.conf" "$config_backup_dir/"
    [ -f "${ASSETS_DIR}/../default.conf" ] && cp "${ASSETS_DIR}/../default.conf" "$config_backup_dir/"
    [ -f "${ASSETS_DIR}/../optimize-assets.sh" ] && cp "${ASSETS_DIR}/../optimize-assets.sh" "$config_backup_dir/"
    [ -f "${ASSETS_DIR}/manifest.json" ] && cp "${ASSETS_DIR}/manifest.json" "$config_backup_dir/"
    
    echo "Configuration backup completed"
}

# Create archive
create_archive() {
    echo "Creating backup archive..."
    
    cd ${BACKUP_DIR}
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/"
    
    # Calculate archive hash and size
    local archive_path="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    local archive_hash=$(calculate_hash "$archive_path")
    local archive_size=$(get_file_size "$archive_path")
    
    # Create archive metadata
    cat > "${BACKUP_DIR}/${BACKUP_NAME}_archive.json" << EOF
{
  "archive_info": {
    "filename": "${BACKUP_NAME}.tar.gz",
    "created_at": "$(date -Iseconds)",
    "size_bytes": ${archive_size},
    "sha256": "${archive_hash}",
    "compression": "gzip"
  },
  "contents": {
    "logos": "Original logo files and manifest",
    "optimized": "Optimized assets and manifest", 
    "config": "Configuration files",
    "metadata": "Backup metadata"
  },
  "retention": {
    "keep_days": ${KEEP_DAYS},
    "expires_at": "$(date -d "+${KEEP_DAYS} days" -Iseconds)"
  }
}
EOF
    
    echo "Archive created: ${BACKUP_NAME}.tar.gz ($(du -h "$archive_path" | cut -f1))"
}

# Upload to MinIO (if available)
upload_to_minio() {
    echo "Uploading backup to MinIO..."
    
    # Check if MinIO is available
    if command -v mc >/dev/null 2>&1; then
        # Configure MinIO client
        mc alias set backup http://minio:9000 minioadmin minioadmin123 >/dev/null 2>&1 || true
        
        # Upload archive
        if mc cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "backup/backups/assets/" >/dev/null 2>&1; then
            echo "Backup uploaded to MinIO successfully"
            
            # Upload metadata
            mc cp "${BACKUP_DIR}/${BACKUP_NAME}_archive.json" "backup/backups/assets/" >/dev/null 2>&1
            
            # Set retention policy
            mc lifecycle set --expiry-days ${KEEP_DAYS} backup/backups/assets/ >/dev/null 2>&1 || true
            
        else
            echo "Warning: Failed to upload backup to MinIO"
        fi
    else
        echo "MinIO client not available, skipping upload"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    echo "Cleaning up old backups..."
    
    # Remove local backups older than retention period
    find ${BACKUP_DIR} -name "assets_backup_*.tar.gz" -mtime +${KEEP_DAYS} -delete 2>/dev/null || true
    find ${BACKUP_DIR} -name "assets_backup_*_archive.json" -mtime +${KEEP_DAYS} -delete 2>/dev/null || true
    find ${BACKUP_DIR} -type d -name "assets_backup_*" -mtime +${KEEP_DAYS} -exec rm -rf {} + 2>/dev/null || true
    
    echo "Cleanup completed"
}

# Main backup process
main() {
    echo "=== REMMIC Asset Backup Process Started ==="
    
    # Create metadata
    create_metadata
    
    # Backup components
    backup_logos
    backup_optimized
    backup_configuration
    
    # Create archive
    create_archive
    
    # Upload to cloud storage
    upload_to_minio
    
    # Cleanup
    cleanup_old_backups
    
    # Remove temporary backup directory
    rm -rf "${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Log completion
    echo "$(date): Asset backup completed - ${BACKUP_NAME}.tar.gz" >> ${BACKUP_DIR}/backup.log
    
    # Final summary
    echo "=== Backup Summary ==="
    echo "Backup Name: ${BACKUP_NAME}"
    echo "Archive Size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)"
    echo "Archive Hash: $(calculate_hash "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz")"
    echo "Retention: ${KEEP_DAYS} days"
    echo "Completed: $(date)"
    echo "=== Asset Backup Process Completed ==="
}

# Run main function
main "$@"