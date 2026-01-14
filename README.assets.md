# REMMIC Logo and Assets Management

This document provides comprehensive instructions for managing logos and assets in the containerized REMMIC application environment.

## Overview

The REMMIC logo and asset management system provides:

1. **Containerized Asset Server** - Dedicated nginx server for optimized asset delivery
2. **Multi-format Logo Support** - SVG, PNG, WebP, ICO formats with multiple sizes
3. **Automatic Optimization** - ImageMagick-powered asset processing pipeline
4. **Cloud Storage Integration** - MinIO S3-compatible storage with versioning
5. **CDN-ready Architecture** - Optimized for content delivery networks
6. **Backup and Versioning** - Automated backup with asset history tracking

## Quick Start

### Start Asset Services

```bash
# Start full content management (includes assets)
npm run content:up

# Access asset server directly
open http://localhost:8080

# Check asset server health
curl http://localhost:8080/health
```

### Setup Asset Storage

```bash
# Initialize MinIO buckets and upload assets
npm run assets:setup

# Build asset container
npm run assets:build
```

## Logo Access

### Direct Logo URLs

The asset server provides multiple logo endpoints:

```bash
# Main logo (content negotiation based on Accept header)
http://localhost:8080/logo

# Specific formats
http://localhost:8080/logo.svg        # Vector format
http://localhost:8080/logo.png        # Medium PNG
http://localhost:8080/logo.webp       # WebP format
http://localhost:8080/logo-small.svg  # Small variant
http://localhost:8080/logo-favicon.ico # Favicon
```

### Available Logo Formats

| Format | Sizes Available | Use Case |
|--------|-----------------|----------|
| SVG | Small, Medium, Large | Scalable UI elements |
| PNG | Thumb (100px), Small (200px), Medium (400px), Large (800px) | Social media, apps |
| WebP | Small (200px), Medium (400px) | Modern web browsers |
| ICO | Multi-size (16,32,48,64,128,256) | Browser favicons |

## Integration in Application

### Using the Assets Library

```javascript
import { getLogoUrl, getResponsiveLogoSources } from '../lib/assets';

// Get optimized logo URL
const logoUrl = getLogoUrl({ format: 'svg', size: 'medium' });

// Get responsive image sources
const sources = getResponsiveLogoSources({ sizes: ['small', 'medium'] });

// Component usage
<img src={getLogoUrl()} alt="REMMIC Logo" />
```

### React Component Examples

```jsx
// Simple logo component
import { getLogoUrl } from '../lib/assets';

function Logo({ size = 'medium', className = 'logo' }) {
  return (
    <img 
      src={getLogoUrl({ format: 'svg', size })} 
      alt="REMMIC Logo"
      className={className}
    />
  );
}

// Responsive logo with modern formats
function ResponsiveLogo() {
  return (
    <picture>
      <source 
        srcSet={getLogoUrl({ format: 'webp', size: 'small' })} 
        media="(max-width: 768px)" 
        type="image/webp" 
      />
      <source 
        srcSet={getLogoUrl({ format: 'webp', size: 'medium' })} 
        media="(min-width: 769px)" 
        type="image/webp" 
      />
      <img 
        src={getLogoUrl({ format: 'svg', size: 'medium' })} 
        alt="REMMIC Logo" 
      />
    </picture>
  );
}
```

### Environment Configuration

Set these environment variables for optimal asset delivery:

```env
# Asset server URL
NEXT_PUBLIC_ASSETS_URL=http://localhost:8080

# Production CDN URL (optional)
CDN_BASE_URL=https://cdn.remmic.com

# MinIO public access
MINIO_PUBLIC_URL=http://localhost:9000
```

## Asset Server Architecture

### Container Structure

```
assets/
├── Dockerfile                 # Asset server container
├── nginx.conf                 # Nginx configuration
├── default.conf               # Server routing rules
├── optimize-assets.sh         # Asset optimization script
├── logos/                     # Original logo files
│   └── REMMIC LOGO SVG.svg   # Main logo source
├── images/                    # Additional images
├── media/                     # Media files
└── optimized/                 # Generated optimized assets
    └── logos/
        ├── remmic-logo.svg
        ├── remmic-logo.png
        ├── remmic-logo.webp
        ├── favicon.ico
        └── apple-touch-icon.png
```

### Optimization Pipeline

The asset server automatically:

1. **Minifies SVG** files by removing comments and extra whitespace
2. **Generates PNG variants** in multiple sizes using ImageMagick
3. **Creates WebP versions** for modern browsers with optimal compression
4. **Builds favicon files** with multiple icon sizes
5. **Optimizes file sizes** using optipng and jpegoptim
6. **Creates manifest files** for easy integration

### Performance Features

- **HTTP/2 Support** for efficient asset delivery
- **Gzip Compression** for text-based assets
- **Cache Headers** with long-term caching for optimized assets
- **Content Negotiation** for serving optimal formats
- **CORS Headers** for cross-origin requests

## MinIO Cloud Storage

### Storage Structure

```
Buckets:
├── assets/                    # Public assets
│   ├── logos/                 # Logo files
│   │   ├── remmic-logo.svg
│   │   └── optimized/         # Processed versions
│   └── inventory.json         # Asset catalog
├── media/                     # Property images and media
└── backups/                   # Asset backups
    └── assets/                # Versioned asset backups
```

### MinIO Web Console

Access the MinIO console at http://localhost:9001:
- Username: `minioadmin`
- Password: `minioadmin123`

### S3 API Integration

```javascript
// Example S3-compatible access
const s3Config = {
  endpoint: 'http://localhost:9000',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin123',
  s3ForcePathStyle: true
};

// Get asset URL
const assetUrl = `${s3Config.endpoint}/assets/logos/remmic-logo.svg`;
```

## Backup and Versioning

### Automated Backups

```bash
# Manual asset backup
npm run assets:backup

# Check backup files
ls -la content/backups/assets/

# Backup includes:
# - Original logo files with metadata
# - Optimized assets and manifests
# - Configuration files
# - SHA256 checksums for verification
```

### Backup Structure

```json
{
  "backup_info": {
    "timestamp": "2024-01-02T10:30:00Z",
    "backup_name": "assets_backup_20240102_103000",
    "version": "1.0.0"
  },
  "assets": {
    "logos": [
      {
        "filename": "REMMIC LOGO SVG.svg",
        "size_bytes": 45231,
        "sha256": "abc123...",
        "mime_type": "image/svg+xml"
      }
    ]
  }
}
```

### Version Management

- **MinIO Versioning** enabled for all asset buckets
- **Lifecycle Policies** automatically clean up old versions (30 days)
- **Asset Manifests** track optimization history
- **Backup Archives** include checksums for integrity verification

## Performance Monitoring

### Health Checks

```bash
# Asset server health
curl http://localhost:8080/health

# Asset manifest
curl http://localhost:8080/manifest.json

# MinIO health
curl http://localhost:9000/minio/health/live
```

### Performance Metrics

```javascript
// Check asset server availability
import { checkAssetServerHealth } from '../lib/assets';

const isHealthy = await checkAssetServerHealth();

// Preload critical assets for performance
import { preloadAssets } from '../lib/assets';

preloadAssets([
  '/logo.svg',
  '/logo.webp'
]);
```

## Development Workflow

### Adding New Assets

1. **Add files** to `assets/logos/` or `assets/images/`
2. **Rebuild container** with `npm run assets:build`
3. **Restart services** with `npm run content:up`
4. **Verify optimization** by checking `http://localhost:8080/optimized/`

### Logo Updates

1. **Replace** `assets/logos/REMMIC LOGO SVG.svg`
2. **Rebuild** asset container
3. **Clear browser cache** or update version numbers
4. **Backup** previous version if needed

### Custom Optimization

```bash
# Access asset container
docker exec -it remmic-assets sh

# Run optimization manually
/usr/local/bin/optimize-assets.sh

# Check optimization results
ls -la /var/www/assets/optimized/
```

## Production Deployment

### CDN Integration

```bash
# Upload assets to CDN
aws s3 sync assets/ s3://your-cdn-bucket/assets/

# Set environment variable
export CDN_BASE_URL=https://cdn.remmic.com
```

### Performance Optimization

```nginx
# Additional nginx configuration for production
location ~* \.(svg|png|webp|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # Enable Brotli compression if available
    brotli on;
    brotli_comp_level 6;
    brotli_types image/svg+xml;
}
```

### Security Headers

```nginx
# Security headers for assets
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header Referrer-Policy strict-origin-when-cross-origin;
```

## Troubleshooting

### Common Issues

1. **Logo not loading**:
   ```bash
   # Check asset server logs
   docker logs remmic-assets
   
   # Verify file exists
   curl -I http://localhost:8080/logo.svg
   ```

2. **Optimization failures**:
   ```bash
   # Check container logs
   docker logs remmic-assets
   
   # Rebuild with fresh assets
   npm run assets:build
   ```

3. **MinIO access issues**:
   ```bash
   # Check MinIO logs
   docker logs remmic-minio
   
   # Verify bucket permissions
   mc ls remmic/assets/
   ```

### Performance Issues

1. **Slow asset loading**:
   - Check network connectivity to asset server
   - Verify asset optimization completed successfully
   - Consider using CDN for production

2. **Large file sizes**:
   - Review optimization settings in `optimize-assets.sh`
   - Check if WebP format is being served to modern browsers
   - Verify compression is enabled

## API Reference

### Asset URLs

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/logo` | Content-negotiated logo | Auto-selects best format |
| `/logo.svg` | SVG logo | Vector format |
| `/logo.png` | PNG logo (400px) | Standard raster format |
| `/logo.webp` | WebP logo (400px) | Modern compressed format |
| `/logo-small.svg` | Small SVG variant | Mobile-optimized |
| `/logo-favicon.ico` | Favicon | Browser icon |
| `/optimized/logos/` | All optimized logos | Directory listing |
| `/manifest.json` | Asset manifest | Metadata and inventory |

### JavaScript API

```javascript
import assets from '../lib/assets';

// Get logo URL
const url = assets.getLogoUrl({ format: 'webp', size: 'large' });

// Get favicon
const favicon = assets.getFaviconUrl();

// Check server health
const healthy = await assets.checkAssetServerHealth();

// Get full manifest
const manifest = await assets.getAssetManifest();
```

This containerized asset management system ensures your REMMIC logo and branding assets are optimized, scalable, and reliably delivered across all environments.