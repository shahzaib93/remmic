# REMMIC Content Management System

This document provides comprehensive instructions for setting up and managing the containerized content management system for the REMMIC application.

## Overview

The REMMIC content management system consists of:

1. **Strapi CMS** - Headless content management
2. **PostgreSQL** - Primary database for content
3. **Redis** - Caching and session management
4. **MinIO** - S3-compatible file storage
5. **Elasticsearch** - Content search and indexing
6. **Content API** - Custom API gateway
7. **Content Sync Service** - Real-time synchronization
8. **Backup Service** - Automated database backups

## Quick Start

### Start Content Management System

```bash
# Start all content services
npm run content:up

# View logs
npm run content:logs

# Stop services
npm run content:down
```

### Start Full Application with Content

```bash
# Start both app and content services
npm run full:up

# Stop everything
npm run full:down
```

## Service Details

### 1. Strapi CMS (Port 1337)

**Purpose**: Headless content management system for managing properties, pages, and media.

**Features**:
- Admin dashboard at `http://localhost:1337/admin`
- REST and GraphQL APIs
- Media management with MinIO integration
- User permissions and roles
- Content versioning

**Initial Setup**:
```bash
# Access admin panel
open http://localhost:1337/admin

# Create admin user (first time only)
# Follow the setup wizard
```

### 2. PostgreSQL Database (Port 5432)

**Purpose**: Primary database for storing all content and analytics data.

**Features**:
- Automated schema creation
- Full-text search capabilities
- Analytics tracking tables
- Performance optimized indexes

**Connection Details**:
- Host: localhost:5432
- Database: remmic_content
- Username: remmic_user
- Password: remmic_password_2024

### 3. Redis Cache (Port 6379)

**Purpose**: High-performance caching and real-time data synchronization.

**Features**:
- Content caching (properties, pages)
- Session management
- Real-time sync coordination
- Performance monitoring

**Connection**: `redis://:redis_password_2024@localhost:6379`

### 4. MinIO File Storage (Ports 9000, 9001)

**Purpose**: S3-compatible object storage for images, documents, and media files.

**Features**:
- Web console at `http://localhost:9001`
- S3-compatible API
- Bucket management
- File versioning

**Access Credentials**:
- Username: minioadmin
- Password: minioadmin123

### 5. Elasticsearch (Port 9200)

**Purpose**: Advanced search capabilities for content discovery.

**Features**:
- Full-text search across properties
- Faceted search and filtering
- Analytics and reporting
- Auto-complete suggestions

**API**: `http://localhost:9200`

### 6. Content API Gateway (Port 4000)

**Purpose**: Custom API layer for optimized content delivery and caching.

**Features**:
- Cached property endpoints
- Search API with filters
- Analytics tracking
- Performance optimization

**Endpoints**:
- Properties: `GET /api/content/properties`
- Search: `GET /api/content/search`
- Stats: `GET /api/content/stats`

### 7. Content Sync Service

**Purpose**: Automatically synchronizes content between Strapi and application cache.

**Features**:
- Real-time content synchronization
- Cache invalidation
- Health monitoring
- Error recovery

## Content Models

### Property Content Type

```json
{
  "title": "string (required)",
  "description": "richtext (required)", 
  "slug": "uid (auto-generated)",
  "price": "decimal (required)",
  "area": "string (required)",
  "location": "string (required)",
  "propertyType": "enum (required)",
  "status": "enum (default: available)",
  "featured": "boolean (default: false)",
  "images": "media (multiple)",
  "documents": "media (multiple)",
  "coordinates": "component",
  "amenities": "relation (many-to-many)",
  "shareOffering": "component",
  "seo": "component"
}
```

### Share Offering Component

```json
{
  "totalShares": "integer (required)",
  "sharesAvailable": "integer (required)",
  "sharePrice": "decimal (required)",
  "minSharesPerInvestor": "integer",
  "maxSharesPerInvestor": "integer",
  "fundingGoal": "decimal (required)",
  "fundingRaised": "decimal",
  "investorCount": "integer",
  "expectedReturn": "decimal",
  "offeringStartDate": "datetime (required)",
  "offeringEndDate": "datetime (required)",
  "status": "enum"
}
```

## Content Workflow

### 1. Content Creation
1. Access Strapi admin panel
2. Create/edit properties or pages
3. Upload media files to MinIO
4. Set SEO metadata
5. Publish content

### 2. Content Synchronization
1. Sync service detects changes
2. Content cached in Redis
3. Search index updated in Elasticsearch
4. Next.js cache invalidated
5. Content available on frontend

### 3. Content Delivery
1. Request hits Content API
2. Check Redis cache first
3. Fallback to database if needed
4. Return optimized response
5. Track analytics

## API Usage

### Fetch Properties

```javascript
// Get all properties
const response = await fetch('http://localhost:4000/api/content/properties');
const { data, pagination } = await response.json();

// Get property by ID
const property = await fetch('http://localhost:4000/api/content/properties/123');

// Search properties
const searchResults = await fetch(
  'http://localhost:4000/api/content/search?q=lahore&type=residential_plot'
);
```

### Integration with Next.js

```javascript
// pages/api/revalidate.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Revalidate specific paths
      await res.revalidate('/properties');
      await res.revalidate('/marketplace');
      
      return res.json({ revalidated: true });
    } catch (err) {
      return res.status(500).send('Error revalidating');
    }
  }
}

// lib/contentApi.js
export async function getProperties(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://content-api:4000/api/content/properties?${params}`);
  return response.json();
}
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.content.yml ps

# Check specific service logs
docker-compose -f docker-compose.content.yml logs strapi
docker-compose -f docker-compose.content.yml logs content-api

# Check sync service health
curl http://localhost:4000/api/health
```

### Performance Monitoring

```bash
# Redis performance
redis-cli --latency -h localhost -p 6379 -a redis_password_2024

# Database performance
docker exec remmic-postgres psql -U remmic_user -d remmic_content -c "
  SELECT query, calls, total_time, mean_time 
  FROM pg_stat_statements 
  ORDER BY total_time DESC 
  LIMIT 10;"

# Elasticsearch cluster health
curl http://localhost:9200/_cluster/health
```

### Database Backups

```bash
# Manual backup
npm run content:backup

# Check backup files
ls -la content/backups/

# Restore from backup (example)
docker exec -i remmic-postgres psql -U remmic_user -d remmic_content < content/backups/latest_backup.sql
```

### Cache Management

```bash
# Clear all cache
curl -X POST http://localhost:4000/api/cache/clear

# Clear specific pattern
curl -X POST http://localhost:4000/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"pattern": "properties"}'
```

## Development Workflow

### Local Development

1. **Start content services**:
   ```bash
   npm run content:up
   ```

2. **Access admin panel**:
   ```bash
   open http://localhost:1337/admin
   ```

3. **Create content**:
   - Add properties, pages, media
   - Configure content types
   - Set up relationships

4. **Test API**:
   ```bash
   curl http://localhost:4000/api/content/properties
   ```

### Content Migration

```bash
# Export content from Strapi
curl http://localhost:1337/api/properties > properties.json

# Import content (custom script needed)
node scripts/import-content.js properties.json
```

### Schema Updates

1. Update schema files in `content/strapi/src/`
2. Restart Strapi service
3. Apply database migrations
4. Update API endpoints if needed

## Production Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
POSTGRES_DB=remmic_content
POSTGRES_USER=remmic_user
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://:secure_password@redis:6379

# Strapi
JWT_SECRET=your-super-secret-jwt-token
ADMIN_JWT_SECRET=your-admin-jwt-secret
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=secure_password

# Content API
NODE_ENV=production
STRAPI_URL=http://strapi:1337
ELASTICSEARCH_URL=http://elasticsearch:9200
```

### Security Considerations

1. **Change default passwords** for all services
2. **Use environment-specific secrets**
3. **Enable SSL/TLS** for production
4. **Configure firewall rules** for database access
5. **Set up monitoring** and alerting
6. **Regular security updates**

### Scaling

```yaml
# docker-compose.prod.yml
services:
  strapi:
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
  
  content-api:
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## Troubleshooting

### Common Issues

1. **Strapi won't start**:
   ```bash
   # Check database connection
   docker-compose -f docker-compose.content.yml logs postgres
   
   # Check Strapi logs
   docker-compose -f docker-compose.content.yml logs strapi
   ```

2. **Content not syncing**:
   ```bash
   # Check sync service
   docker-compose -f docker-compose.content.yml logs content-sync
   
   # Manual sync trigger
   docker exec remmic-content-sync node sync.js
   ```

3. **Cache issues**:
   ```bash
   # Clear Redis cache
   redis-cli -h localhost -p 6379 -a redis_password_2024 FLUSHALL
   ```

4. **Search not working**:
   ```bash
   # Check Elasticsearch status
   curl http://localhost:9200/_cluster/health
   
   # Reindex content
   curl -X POST http://localhost:9200/properties/_reindex
   ```

### Performance Optimization

1. **Database**:
   - Regular VACUUM and ANALYZE
   - Monitor slow queries
   - Optimize indexes

2. **Redis**:
   - Monitor memory usage
   - Set appropriate TTL values
   - Use efficient data structures

3. **Content API**:
   - Implement proper caching
   - Use compression
   - Optimize database queries

## Support

For issues related to content management:
1. Check service logs: `npm run content:logs`
2. Verify service health: `docker-compose -f docker-compose.content.yml ps`
3. Review database connections and permissions
4. Check Redis connectivity and cache status