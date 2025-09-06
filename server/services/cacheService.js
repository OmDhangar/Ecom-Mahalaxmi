const NodeCache = require("node-cache");

/**
 * Centralized Cache Service for API responses
 * Uses in-memory caching with configurable TTL
 */
class CacheService {
  constructor() {
    // Initialize cache instances with different TTL for different data types
    this.productCache = new NodeCache({ 
      stdTTL: 900, // 15 minutes for products
      checkperiod: 120 // Check for expired keys every 2 minutes
    });
    
    this.carouselCache = new NodeCache({ 
      stdTTL: 3600, // 1 hour for carousel (changes less frequently)
      checkperiod: 300 // Check every 5 minutes
    });
    
    this.featuredCache = new NodeCache({ 
      stdTTL: 1800, // 30 minutes for featured products
      checkperiod: 180 // Check every 3 minutes
    });
    
    this.generalCache = new NodeCache({ 
      stdTTL: 1800, // 30 minutes for general data
      checkperiod: 180
    });

    // Track cache hits and misses for analytics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }

  /**
   * Generate cache key based on endpoint and parameters
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    const paramsString = Object.keys(sortedParams).length > 0 
      ? JSON.stringify(sortedParams) 
      : '';
    
    return `${prefix}:${Buffer.from(paramsString).toString('base64')}`;
  }

  /**
   * Get cached data
   */
  get(cacheType, key) {
    const cache = this.getCacheInstance(cacheType);
    const data = cache.get(key);
    
    if (data !== undefined) {
      this.stats.hits++;
      return data;
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * Set cached data
   */
  set(cacheType, key, data, ttl = null) {
    const cache = this.getCacheInstance(cacheType);
    this.stats.sets++;
    
    if (ttl) {
      return cache.set(key, data, ttl);
    }
    return cache.set(key, data);
  }

  /**
   * Delete specific cache entry
   */
  delete(cacheType, key) {
    const cache = this.getCacheInstance(cacheType);
    return cache.del(key);
  }

  /**
   * Clear entire cache type
   */
  clear(cacheType) {
    const cache = this.getCacheInstance(cacheType);
    return cache.flushAll();
  }

  /**
   * Clear all caches
   */
  clearAll() {
    this.productCache.flushAll();
    this.carouselCache.flushAll();
    this.featuredCache.flushAll();
    this.generalCache.flushAll();
  }

  /**
   * Get cache instance by type
   */
  getCacheInstance(cacheType) {
    switch (cacheType) {
      case 'products':
        return this.productCache;
      case 'carousel':
        return this.carouselCache;
      case 'featured':
        return this.featuredCache;
      case 'general':
      default:
        return this.generalCache;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100,
      productCacheKeys: this.productCache.keys().length,
      carouselCacheKeys: this.carouselCache.keys().length,
      featuredCacheKeys: this.featuredCache.keys().length,
      generalCacheKeys: this.generalCache.keys().length
    };
  }

  /**
   * Smart cache invalidation for related data
   */
  invalidateRelated(dataType, operation = 'update') {
    switch (dataType) {
      case 'product':
        // When a product is updated, clear product and featured caches
        this.clear('products');
        this.clear('featured');
        console.log(`Cache invalidated: products and featured (${operation})`);
        break;
        
      case 'carousel':
        // When carousel is updated, clear carousel cache
        this.clear('carousel');
        console.log(`Cache invalidated: carousel (${operation})`);
        break;
        
      case 'featured':
        // When featured status changes, clear featured cache
        this.clear('featured');
        console.log(`Cache invalidated: featured (${operation})`);
        break;
        
      default:
        console.log(`Cache invalidation not configured for: ${dataType}`);
    }
  }

  /**
   * Middleware for automatic caching
   */
  middleware(cacheType, keyGenerator) {
    return (req, res, next) => {
      const key = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : this.generateKey(req.route.path, req.query);
      
      const cachedData = this.get(cacheType, key);
      
      if (cachedData) {
        console.log(`Cache HIT: ${key}`);
        return res.json(cachedData);
      }
      
      console.log(`Cache MISS: ${key}`);
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (data) => {
        if (res.statusCode === 200 && data.success) {
          this.set(cacheType, key, data);
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
