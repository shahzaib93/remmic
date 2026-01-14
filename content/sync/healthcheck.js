const Redis = require('redis');

async function healthCheck() {
  try {
    const redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
    
    await redisClient.connect();
    
    // Check if sync service is healthy
    const healthData = await redisClient.get('sync:health');
    
    if (!healthData) {
      throw new Error('No health data available');
    }
    
    const health = JSON.parse(healthData);
    
    if (!health.healthy) {
      throw new Error('Sync service is not healthy');
    }
    
    await redisClient.quit();
    console.log('Health check passed');
    process.exit(0);
    
  } catch (error) {
    console.error('Health check failed:', error.message);
    process.exit(1);
  }
}

healthCheck();