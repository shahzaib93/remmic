const axios = require('axios');
const Redis = require('redis');
const cron = require('cron');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'content-sync' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configuration
const config = {
  strapiUrl: process.env.STRAPI_URL || 'http://strapi:1337',
  nextAppUrl: process.env.NEXT_APP_URL || 'http://remmic-app:3008',
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  syncInterval: parseInt(process.env.SYNC_INTERVAL) || 300000, // 5 minutes
};

// Redis client
const redisClient = Redis.createClient({ url: config.redisUrl });

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis for content sync');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    process.exit(1);
  }
})();

class ContentSyncService {
  constructor() {
    this.lastSyncTimestamp = null;
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastSyncTime: null,
      lastErrorTime: null
    };
  }

  async syncProperties() {
    try {
      logger.info('Starting property content sync...');
      
      // Get properties from Strapi
      const response = await axios.get(`${config.strapiUrl}/api/properties`, {
        params: {
          populate: '*',
          filters: {
            publishedAt: {
              $notNull: true
            }
          },
          sort: 'updatedAt:desc',
          pagination: {
            limit: 100
          }
        },
        timeout: 30000
      });

      const properties = response.data.data;
      logger.info(`Fetched ${properties.length} properties from Strapi`);

      // Transform and cache properties
      const transformedProperties = properties.map(property => ({
        id: property.id,
        title: property.attributes.title,
        description: property.attributes.description,
        slug: property.attributes.slug,
        price: property.attributes.price,
        area: property.attributes.area,
        location: property.attributes.location,
        propertyType: property.attributes.propertyType,
        status: property.attributes.status,
        featured: property.attributes.featured,
        images: property.attributes.images?.data?.map(img => ({
          id: img.id,
          url: img.attributes.url,
          alternativeText: img.attributes.alternativeText,
          width: img.attributes.width,
          height: img.attributes.height
        })) || [],
        coordinates: property.attributes.coordinates,
        amenities: property.attributes.amenities?.data?.map(amenity => ({
          id: amenity.id,
          name: amenity.attributes.name,
          icon: amenity.attributes.icon
        })) || [],
        shareOffering: property.attributes.shareOffering,
        seo: property.attributes.seo,
        viewCount: property.attributes.viewCount || 0,
        publishedAt: property.attributes.publishedAt,
        updatedAt: property.attributes.updatedAt
      }));

      // Cache individual properties
      const cachePromises = transformedProperties.map(async (property) => {
        const cacheKey = `property:${property.id}`;
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(property)); // 1 hour cache
        
        // Also cache by slug
        const slugCacheKey = `property:slug:${property.slug}`;
        await redisClient.setEx(slugCacheKey, 3600, JSON.stringify(property));
      });

      await Promise.all(cachePromises);

      // Cache the full property list
      await redisClient.setEx('properties:all', 1800, JSON.stringify(transformedProperties)); // 30 minutes

      // Cache filtered lists
      const featuredProperties = transformedProperties.filter(p => p.featured);
      await redisClient.setEx('properties:featured', 1800, JSON.stringify(featuredProperties));

      const availableProperties = transformedProperties.filter(p => p.status === 'available');
      await redisClient.setEx('properties:available', 1800, JSON.stringify(availableProperties));

      // Update sync stats
      this.syncStats.totalSyncs++;
      this.syncStats.successfulSyncs++;
      this.syncStats.lastSyncTime = new Date().toISOString();
      this.lastSyncTimestamp = Date.now();

      logger.info(`Content sync completed successfully. Synced ${properties.length} properties.`);

      // Trigger cache invalidation on Next.js app
      await this.triggerCacheInvalidation();

    } catch (error) {
      this.syncStats.totalSyncs++;
      this.syncStats.failedSyncs++;
      this.syncStats.lastErrorTime = new Date().toISOString();
      
      logger.error('Content sync failed:', error.message);
      
      // Store error in Redis for monitoring
      await redisClient.setEx('sync:last_error', 3600, JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        service: 'content-sync'
      }));
    }
  }

  async triggerCacheInvalidation() {
    try {
      // Call Next.js revalidation endpoint if available
      if (config.nextAppUrl) {
        await axios.post(`${config.nextAppUrl}/api/revalidate`, {
          secret: process.env.REVALIDATION_TOKEN || 'default-token',
          paths: ['/properties', '/marketplace', '/investment']
        }, { timeout: 10000 });
        
        logger.info('Cache invalidation triggered on Next.js app');
      }
    } catch (error) {
      logger.warn('Failed to trigger cache invalidation:', error.message);
    }
  }

  async syncSiteContent() {
    try {
      logger.info('Syncing site content...');

      // Sync pages, blog posts, etc.
      const contentTypes = ['page', 'blog-post', 'testimonial', 'team-member'];
      
      for (const contentType of contentTypes) {
        try {
          const response = await axios.get(`${config.strapiUrl}/api/${contentType}s`, {
            params: {
              populate: '*',
              filters: {
                publishedAt: {
                  $notNull: true
                }
              }
            },
            timeout: 15000
          });

          const content = response.data.data;
          await redisClient.setEx(`content:${contentType}s`, 1800, JSON.stringify(content));
          
          logger.info(`Synced ${content.length} ${contentType}s`);
        } catch (error) {
          logger.warn(`Failed to sync ${contentType}s:`, error.message);
        }
      }

    } catch (error) {
      logger.error('Site content sync failed:', error);
    }
  }

  async getHealthStatus() {
    const timeSinceLastSync = this.lastSyncTimestamp ? Date.now() - this.lastSyncTimestamp : null;
    const isHealthy = timeSinceLastSync ? timeSinceLastSync < 600000 : false; // 10 minutes

    return {
      healthy: isHealthy,
      lastSync: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp).toISOString() : null,
      timeSinceLastSync,
      stats: this.syncStats,
      redisConnected: redisClient.isOpen
    };
  }

  start() {
    logger.info('Starting content sync service...');

    // Initial sync
    this.syncProperties();
    this.syncSiteContent();

    // Schedule regular syncs
    const job = new cron.CronJob('*/5 * * * *', () => { // Every 5 minutes
      this.syncProperties();
    }, null, true, 'UTC');

    const contentJob = new cron.CronJob('*/15 * * * *', () => { // Every 15 minutes
      this.syncSiteContent();
    }, null, true, 'UTC');

    logger.info('Content sync jobs scheduled');

    // Health check endpoint simulation
    setInterval(async () => {
      const health = await this.getHealthStatus();
      await redisClient.setEx('sync:health', 300, JSON.stringify(health)); // 5 minutes
    }, 60000); // Every minute
  }
}

// Initialize and start the sync service
const syncService = new ContentSyncService();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down content sync service...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down content sync service...');
  await redisClient.quit();
  process.exit(0);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the service
syncService.start();