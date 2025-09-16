const NodeCache = require("node-cache");

/**
 * Stock-Aware Cache Service
 * Separates cacheable static data from real-time dynamic data
 * Prevents stock-related issues in ecommerce operations
 */
class StockAwareCacheService {
  constructor() {
    // Cache for static product data (safe to cache)
    this.staticCache = new NodeCache({
      stdTTL: 1800, // 30 minutes for static data
      checkperiod: 300
    });
    
    // Very short cache for product listings (includes stock indicators)
    this.listingCache = new NodeCache({
      stdTTL: 300, // 5 minutes for product listings
      checkperiod: 60
    });
    
    // No cache for real-time stock data - always fresh from DB
    
    this.stats = {
      staticHits: 0,
      staticMisses: 0,
      listingHits: 0,
      listingMisses: 0,
      stockRequests: 0
    };
  }

  /**
   * Separate product data into cacheable and non-cacheable parts
   */
  separateProductData(product) {
    // Static data that rarely changes (safe to cache)
    const staticData = {
      _id: product._id,
      title: product.title,
      description: product.description,
      category: product.category,
      brand: product.brand,
      image: product.image,
      additionalImages: product.additionalImages,
      batteryHealth: product.batteryHealth,
      condition: product.condition,
      weight: product.weight,
      length: product.length,
      breadth: product.breadth,
      height: product.height,
      sku: product.sku,
      hsn: product.hsn,
      tax: product.tax,
      manufacturer: product.manufacturer,
      countryOfOrigin: product.countryOfOrigin,
      materialComposition: product.materialComposition,
      careInstructions: product.careInstructions,
      warranty: product.warranty,
      returnPolicy: product.returnPolicy,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    // Dynamic data that must be fetched in real-time (NEVER cache)
    const dynamicData = {
      price: product.price,
      salePrice: product.salePrice,
      totalStock: product.totalStock,
      sizes: product.sizes, // Contains size-specific stock
      variants: product.variants, // Contains variant stock
      averageReview: product.averageReview,
      reviews: product.reviews,
      totalSold: product.totalSold,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      lowStockAlert: product.lowStockAlert,
      discountType: product.discountType,
      discountValue: product.discountValue,
      discountStartDate: product.discountStartDate,
      discountEndDate: product.discountEndDate,
      // Virtual fields
      effectivePrice: product.effectivePrice,
      discountPercentage: product.discountPercentage,
      inStock: product.inStock,
      isLowStock: product.isLowStock,
      colors: product.colors,
    };

    return { staticData, dynamicData };
  }

  /**
   * Get static product data with caching
   */
  getStaticProductData(productId, staticData = null) {
    const cacheKey = `static:${productId}`;
    
    // Check cache first
    const cached = this.staticCache.get(cacheKey);
    if (cached) {
      this.stats.staticHits++;
      return cached;
    }
    
    // Cache miss
    this.stats.staticMisses++;
    
    if (staticData) {
      this.staticCache.set(cacheKey, staticData);
      return staticData;
    }
    
    return null;
  }

  /**
   * Cache static product data
   */
  setStaticProductData(productId, staticData) {
    const cacheKey = `static:${productId}`;
    this.staticCache.set(cacheKey, staticData);
  }

  /**
   * Get product listing with short cache (includes basic stock indicators)
   */
  getProductListing(cacheKey, listingData = null) {
    const cached = this.listingCache.get(cacheKey);
    if (cached) {
      this.stats.listingHits++;
      console.log(`Listing cache HIT: ${cacheKey} (5min cache)`);
      return cached;
    }
    
    this.stats.listingMisses++;
    console.log(`Listing cache MISS: ${cacheKey}`);
    
    if (listingData) {
      // Only cache essential listing data with stock indicators
      const cacheableListingData = listingData.map(product => ({
        _id: product._id,
        title: product.title,
        image: product.image,
        category: product.category,
        brand: product.brand,
        price: product.price,
        salePrice: product.salePrice,
        averageReview: product.averageReview,
        isFeatured: product.isFeatured,
        // Stock indicators only (not exact quantities)
        hasStock: product.totalStock > 0,
        isLowStock: product.totalStock <= product.lowStockAlert && product.totalStock > 0,
        cachedAt: Date.now()
      }));
      
      this.listingCache.set(cacheKey, cacheableListingData);
      return cacheableListingData;
    }
    
    return null;
  }

  /**
   * NEVER cache detailed stock information - always fetch fresh
   */
  trackStockRequest() {
    this.stats.stockRequests++;
    console.log(`Stock data requested - fetching fresh from DB (never cached)`);
  }

  /**
   * Invalidate caches when product data changes
   */
  invalidateProduct(productId, reason = 'update') {
    console.log(`Invalidating caches for product ${productId} (${reason})`);
    
    // Clear static cache for this product
    this.staticCache.del(`static:${productId}`);
    
    // Clear all listing caches (since they might contain this product)
    this.listingCache.flushAll();
    
    console.log(`Product caches invalidated: ${productId}`);
  }

  /**
   * Invalidate caches when stock changes
   */
  invalidateOnStockChange(productId, reason = 'stock-update') {
    console.log(`Stock changed for product ${productId} - clearing listing caches`);
    
    // Don't clear static cache (it doesn't contain stock)
    // Only clear listing cache which contains stock indicators
    this.listingCache.flushAll();
    
    console.log(`Listing caches cleared due to stock change: ${productId}`);
  }

  /**
   * Check if product listing cache is stale
   */
  isListingCacheStale(cacheKey) {
    const cached = this.listingCache.get(cacheKey);
    if (!cached || !cached.length || !cached[0].cachedAt) {
      return true;
    }
    
    // Consider cache stale after 3 minutes for stock-sensitive data
    const staleThreshold = 3 * 60 * 1000; // 3 minutes
    return (Date.now() - cached[0].cachedAt) > staleThreshold;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      staticCacheSize: this.staticCache.keys().length,
      listingCacheSize: this.listingCache.keys().length,
      staticHitRate: this.stats.staticHits / (this.stats.staticHits + this.stats.staticMisses) * 100,
      listingHitRate: this.stats.listingHits / (this.stats.listingHits + this.stats.listingMisses) * 100,
      totalStockRequests: this.stats.stockRequests
    };
  }

  /**
   * Clear all caches
   */
  clearAll() {
    this.staticCache.flushAll();
    this.listingCache.flushAll();
    console.log('All stock-aware caches cleared');
  }

  /**
   * Middleware for product listing routes
   */
  listingMiddleware() {
    return (req, res, next) => {
      const originalJson = res.json;
      
      res.json = (data) => {
        if (res.statusCode === 200 && data.success && data.data) {
          // Generate cache key
          const cacheKey = this.generateListingCacheKey(req);
          
          // Cache the listing with stock indicators
          this.getProductListing(cacheKey, data.data);
        }
        
        return originalJson.call(res, data);
      };
      
      next();
    };
  }

  /**
   * Generate cache key for product listings
   */
  generateListingCacheKey(req) {
    const { category, brand, sortBy } = req.query;
    const params = {
      category: category || '',
      brand: brand || '', 
      sortBy: sortBy || 'price-lowtohigh'
    };
    
    return `listing:${Buffer.from(JSON.stringify(params)).toString('base64')}`;
  }

  /**
   * Smart cache strategy for different data types
   */
  getCachingStrategy(dataType) {
    const strategies = {
      // Static product information - safe to cache long-term
      'product-static': {
        cache: true,
        ttl: 1800, // 30 minutes
        description: 'Static product info (title, description, images, etc.)'
      },
      
      // Product listings - short cache with stock indicators
      'product-listing': {
        cache: true,
        ttl: 300, // 5 minutes
        description: 'Product listings with basic stock indicators'
      },
      
      // Individual product details with stock - very short cache
      'product-details': {
        cache: true,
        ttl: 60, // 1 minute
        description: 'Full product details including current stock'
      },
      
      // Real-time stock data - NEVER cache
      'stock-data': {
        cache: false,
        ttl: 0,
        description: 'Live stock quantities - always fetch from DB'
      },
      
      // Price and discount data - very short cache
      'pricing-data': {
        cache: true,
        ttl: 300, // 5 minutes
        description: 'Current prices and discounts'
      },
      
      // Featured products - can cache with stock indicators
      'featured-products': {
        cache: true,
        ttl: 900, // 15 minutes
        description: 'Featured products with stock indicators'
      },
      
      // Carousel and static content - safe to cache
      'carousel': {
        cache: true,
        ttl: 3600, // 1 hour
        description: 'Carousel images and content'
      }
    };
    
    return strategies[dataType] || strategies['product-details'];
  }

  /**
   * Log cache decision for transparency
   */
  logCacheDecision(dataType, productId, decision) {
    const strategy = this.getCachingStrategy(dataType);
    console.log(`Cache Decision: ${dataType} for product ${productId}`, {
      decision,
      strategy: strategy.description,
      ttl: strategy.ttl,
      cached: strategy.cache
    });
  }
}

// Create singleton instance
const stockAwareCacheService = new StockAwareCacheService();

module.exports = stockAwareCacheService;
