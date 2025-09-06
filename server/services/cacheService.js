const NodeCache = require("node-cache");

/**
 * Simplified Cache Service for API responses
 * Uses single in-memory cache with different TTL by data type
 */
class CacheService {
  constructor() {
    // Single cache instance with 10 minute default TTL
    this.cache = new NodeCache({ 
      stdTTL: 600, // 10 minutes default
      checkperiod: 120 // Check for expired keys every 2 minutes
    });

    // Simple TTL configuration
    this.ttlConfig = {
      products: 300,    // 5 minutes - frequently changing
      featured: 600,    // 10 minutes 
      carousel: 1800,   // 30 minutes - rarely changes
      general: 600      // 10 minutes default
    };

    // Basic stats tracking
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }

  /**
   * Generate simple cache key
   */
  generateKey(prefix, params = {}) {
    if (Object.keys(params).length === 0) return prefix;
    const paramsString = JSON.stringify(params);
    return `${prefix}:${Buffer.from(paramsString).toString('base64')}`;
  }

  /**
   * Get cached data
   */
  get(key) {
    const data = this.cache.get(key);
    if (data !== undefined) {
      this.stats.hits++;
      return data;
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Set cached data with appropriate TTL
   */
  set(key, data, cacheType = 'general') {
    const ttl = this.ttlConfig[cacheType] || this.ttlConfig.general;
    this.stats.sets++;
    return this.cache.set(key, data, ttl);
  }

  /**
   * Delete specific cache entry
   */
  delete(key) {
    return this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    return this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) + '%' : '0%',
      totalKeys: this.cache.keys().length
    };
  }

  /**
   * Simple cache invalidation - just clear patterns
   */
  invalidatePattern(pattern) {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => this.cache.del(key));
    if (matchingKeys.length > 0) {
      console.log(`Cache invalidated: ${matchingKeys.length} keys matching '${pattern}'`);
    }
  }

  /**
   * Simple middleware for automatic caching
   */
  middleware(cacheType = 'general', keyGenerator = null) {
    return (req, res, next) => {
      const key = keyGenerator 
        ? keyGenerator(req) 
        : this.generateKey(req.originalUrl, req.query);
      
      const cachedData = this.get(key);
      
      if (cachedData) {
        console.log(`Cache HIT: ${key}`);
        return res.json(cachedData);
      }
      
      console.log(`Cache MISS: ${key}`);
      
      // Cache successful responses
      const originalJson = res.json;
      res.json = (data) => {
        if (res.statusCode === 200 && data.success) {
          this.set(key, data, cacheType);
          console.log(`Cache SET: ${key}`);
        }
        return originalJson.call(res, data);
      };
      
      next();
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
