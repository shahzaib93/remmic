const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Redis = require('redis');
const { Pool } = require('pg');
const winston = require('winston');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'content-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Redis connection
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Redis connection failed:', error);
  }
})();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original res.json
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response
        redisClient.setEx(key, duration, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Content API routes
app.get('/api/content/properties', cacheMiddleware(600), async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, featured } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM properties WHERE published = true';
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      query += ` AND property_type = $${paramIndex++}`;
      params.push(type);
    }
    
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (featured === 'true') {
      query += ` AND featured = true`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount
      }
    });
  } catch (error) {
    logger.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/content/properties/:id', cacheMiddleware(300), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM properties WHERE id = $1 AND published = true', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Increment view count
    await pool.query('UPDATE properties SET view_count = view_count + 1 WHERE id = $1', [id]);
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    logger.error('Error fetching property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search endpoint
app.get('/api/content/search', cacheMiddleware(180), async (req, res) => {
  try {
    const { q, type, location, minPrice, maxPrice } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let query = `
      SELECT * FROM properties 
      WHERE published = true 
      AND (
        title ILIKE $1 
        OR description ILIKE $1 
        OR location ILIKE $1
      )
    `;
    const params = [`%${q}%`];
    let paramIndex = 2;
    
    if (type) {
      query += ` AND property_type = $${paramIndex++}`;
      params.push(type);
    }
    
    if (location) {
      query += ` AND location ILIKE $${paramIndex++}`;
      params.push(`%${location}%`);
    }
    
    if (minPrice) {
      query += ` AND price >= $${paramIndex++}`;
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ` AND price <= $${paramIndex++}`;
      params.push(maxPrice);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 20';
    
    const result = await pool.query(query, params);
    
    res.json({ data: result.rows });
  } catch (error) {
    logger.error('Error searching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Content stats endpoint
app.get('/api/content/stats', cacheMiddleware(900), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(*) FILTER (WHERE status = 'available') as available_properties,
        COUNT(*) FILTER (WHERE featured = true) as featured_properties,
        AVG(price) as average_price,
        SUM(view_count) as total_views
      FROM properties 
      WHERE published = true
    `);
    
    res.json({ data: stats.rows[0] });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cache management endpoints
app.post('/api/cache/clear', async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (pattern) {
      const keys = await redisClient.keys(`cache:*${pattern}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      await redisClient.flushDb();
    }
    
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await redisClient.quit();
  await pool.end();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Content API server running on port ${PORT}`);
});