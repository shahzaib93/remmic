#!/bin/bash

# MinIO Asset Setup Script for REMMIC
set -e

echo "Setting up MinIO buckets and assets..."

# Wait for MinIO to be ready
until curl -s http://minio:9000/minio/health/live > /dev/null 2>&1; do
    echo "Waiting for MinIO to be ready..."
    sleep 2
done

echo "MinIO is ready. Creating buckets..."

# Set MinIO client alias
mc alias set remmic http://minio:9000 minioadmin minioadmin123

# Create buckets
mc mb remmic/assets 2>/dev/null || echo "Assets bucket already exists"
mc mb remmic/backups 2>/dev/null || echo "Backups bucket already exists"
mc mb remmic/media 2>/dev/null || echo "Media bucket already exists"

# Set bucket policies
cat > /tmp/assets-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::assets/*"]
    }
  ]
}
EOF

cat > /tmp/media-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::media/*"]
    }
  ]
}
EOF

# Apply policies
mc policy set-json /tmp/assets-policy.json remmic/assets
mc policy set-json /tmp/media-policy.json remmic/media

echo "Bucket policies applied"

# Upload logo assets if they exist
if [ -f "/assets/logos/REMMIC LOGO SVG.svg" ]; then
    echo "Uploading logo assets to MinIO..."
    
    # Upload original logo
    mc cp "/assets/logos/REMMIC LOGO SVG.svg" remmic/assets/logos/remmic-logo.svg
    
    # Upload optimized versions if they exist
    if [ -d "/assets/optimized/logos" ]; then
        mc cp --recursive /assets/optimized/logos/ remmic/assets/logos/optimized/
    fi
    
    echo "Logo assets uploaded successfully"
else
    echo "Warning: Logo assets not found for upload"
fi

# Create asset versioning
mc version enable remmic/assets
mc version enable remmic/media
mc version enable remmic/backups

echo "Asset versioning enabled"

# Set lifecycle policies for cleanup
cat > /tmp/lifecycle.json << EOF
{
  "Rules": [
    {
      "ID": "CleanupOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }
  ]
}
EOF

mc ilm import remmic/assets < /tmp/lifecycle.json
mc ilm import remmic/media < /tmp/lifecycle.json

echo "Lifecycle policies configured"

# Create asset inventory
cat > /tmp/asset-inventory.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "buckets": {
    "assets": {
      "purpose": "Logo, branding, and UI assets",
      "access": "public-read",
      "versioning": "enabled"
    },
    "media": {
      "purpose": "Property images, documents, and media files", 
      "access": "public-read",
      "versioning": "enabled"
    },
    "backups": {
      "purpose": "Database and configuration backups",
      "access": "private",
      "versioning": "enabled"
    }
  },
  "logo_assets": [
    {
      "name": "Main Logo SVG",
      "path": "assets/logos/remmic-logo.svg",
      "format": "svg",
      "optimized": true
    },
    {
      "name": "Logo PNG Large",
      "path": "assets/logos/optimized/remmic-logo-large.png",
      "format": "png",
      "size": "800x800"
    },
    {
      "name": "Logo PNG Medium", 
      "path": "assets/logos/optimized/remmic-logo.png",
      "format": "png",
      "size": "400x400"
    },
    {
      "name": "Logo PNG Small",
      "path": "assets/logos/optimized/remmic-logo-small.png", 
      "format": "png",
      "size": "200x200"
    },
    {
      "name": "Logo WebP Medium",
      "path": "assets/logos/optimized/remmic-logo.webp",
      "format": "webp",
      "size": "400x400"
    },
    {
      "name": "Favicon",
      "path": "assets/logos/optimized/favicon.ico",
      "format": "ico",
      "size": "multiple"
    },
    {
      "name": "Apple Touch Icon",
      "path": "assets/logos/optimized/apple-touch-icon.png",
      "format": "png", 
      "size": "180x180"
    }
  ]
}
EOF

echo "Asset inventory created"

# Store inventory in MinIO
mc cp /tmp/asset-inventory.json remmic/assets/inventory.json

echo "MinIO asset setup completed successfully!"

# Clean up temporary files
rm -f /tmp/assets-policy.json /tmp/media-policy.json /tmp/lifecycle.json /tmp/asset-inventory.json