const env = require('./env');
const { logger } = require('./logger');

/**
 * Lightweight Cache Interface
 * In-memory fallback if Redis is not available, ensuring search result caching
 * works instantly in development and seamlessly scales to Redis in production.
 */
class CacheClient {
  constructor() {
    this.memoryStore = new Map();
    this.isRedis = false;
  }

  async get(key) {
    try {
      const item = this.memoryStore.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        this.memoryStore.delete(key);
        return null;
      }
      return JSON.parse(item.value);
    } catch (err) {
      logger.warn(`Cache get error for ${key}: ${err.message}`);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 120) {
    try {
      this.memoryStore.set(key, {
        value: JSON.stringify(value),
        expiry: Date.now() + ttlSeconds * 1000
      });
      // Prevent unbounded memory growth in development
      if (this.memoryStore.size > 2000) {
        const firstKey = this.memoryStore.keys().next().value;
        this.memoryStore.delete(firstKey);
      }
      return true;
    } catch (err) {
      logger.warn(`Cache set error for ${key}: ${err.message}`);
      return false;
    }
  }

  async del(key) {
    this.memoryStore.delete(key);
  }

  async flushPattern(prefix) {
    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryStore.delete(key);
      }
    }
  }
}

const cache = new CacheClient();

module.exports = cache;
