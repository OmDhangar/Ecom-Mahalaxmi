const NodeCache = require("node-cache");

/**
 * Stock-Aware Cache Service
 * Supports pagination-aware caching for product listings
 */
class StockAwareCacheService {
  constructor() {
    this.staticCache = new NodeCache({
      stdTTL: 1800, // 30 minutes
      checkperiod: 300
    });

    this.listingCache = new NodeCache({
      stdTTL: 300, // 5 minutes
      checkperiod: 60
    });

    this.stats = {
      staticHits: 0,
      staticMisses: 0,
      listingHits: 0,
      listingMisses: 0,
      stockRequests: 0
    };
  }

  separateProductData(product) {
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

    const dynamicData = {
      price: product.price,
      salePrice: product.salePrice,
      totalStock: product.totalStock,
      sizes: product.sizes,
      variants: product.variants,
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
      effectivePrice: product.effectivePrice,
      discountPercentage: product.discountPercentage,
      inStock: product.inStock,
      isLowStock: product.isLowStock
    };

    return { staticData, dynamicData };
  }

  getStaticProductData(productId, staticData = null) {
    const cacheKey = `static:${productId}`;
    const cached = this.staticCache.get(cacheKey);
    if (cached) {
      this.stats.staticHits++;
      return cached;
    }
    this.stats.staticMisses++;
    if (staticData) {
      this.staticCache.set(cacheKey, staticData);
      return staticData;
    }
    return null;
  }

  setStaticProductData(productId, staticData) {
    const cacheKey = `static:${productId}`;
    this.staticCache.set(cacheKey, staticData);
  }

  /**
   * Get product listing with pagination-aware cache
   */
  getProductListing(cacheKey, listingData = null, paginationInfo = null) {
    const cached = this.listingCache.get(cacheKey);
    if (cached) {
      this.stats.listingHits++;
      console.log(`Listing cache HIT: ${cacheKey} (5min cache)`);
      return cached;
    }

    this.stats.listingMisses++;
    console.log(`Listing cache MISS: ${cacheKey}`);

    if (listingData && paginationInfo) {
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
        hasStock: product.totalStock > 0,
        isLowStock:
          product.totalStock <= product.lowStockAlert &&
          product.totalStock > 0,
        cachedAt: Date.now()
      }));

      // ✅ Store both products + pagination
      const payload = {
        data: cacheableListingData,
        pagination: paginationInfo
      };

      this.listingCache.set(cacheKey, payload);
      return payload;
    }

    return null;
  }

  trackStockRequest() {
    this.stats.stockRequests++;
    console.log(
      `Stock data requested - fetching fresh from DB (never cached)`
    );
  }

  invalidateProduct(productId, reason = "update") {
    console.log(`Invalidating caches for product ${productId} (${reason})`);
    this.staticCache.del(`static:${productId}`);
    this.listingCache.flushAll();
    console.log(`Product caches invalidated: ${productId}`);
  }

  invalidateOnStockChange(productId, reason = "stock-update") {
    console.log(
      `Stock changed for product ${productId} - clearing listing caches`
    );
    this.listingCache.flushAll();
    console.log(
      `Listing caches cleared due to stock change: ${productId}`
    );
  }

  isListingCacheStale(cacheKey) {
    const cached = this.listingCache.get(cacheKey);
    if (!cached || !cached.data || !cached.data.length) {
      return true;
    }
    const staleThreshold = 3 * 60 * 1000;
    return Date.now() - cached.data[0].cachedAt > staleThreshold;
  }

  getStats() {
    return {
      ...this.stats,
      staticCacheSize: this.staticCache.keys().length,
      listingCacheSize: this.listingCache.keys().length,
      staticHitRate:
        (this.stats.staticHits /
          (this.stats.staticHits + this.stats.staticMisses)) *
        100,
      listingHitRate:
        (this.stats.listingHits /
          (this.stats.listingHits + this.stats.listingMisses)) *
        100,
      totalStockRequests: this.stats.stockRequests
    };
  }

  clearAll() {
    this.staticCache.flushAll();
    this.listingCache.flushAll();
    console.log("All stock-aware caches cleared");
  }

  /**
   * Middleware for product listing routes
   */
  listingMiddleware() {
    return (req, res, next) => {
      const originalJson = res.json;

      res.json = (data) => {
        if (res.statusCode === 200 && data.success && data.data) {
          const cacheKey = this.generateListingCacheKey(req);

          // ✅ Pass pagination to caching
          this.getProductListing(
            cacheKey,
            data.data,
            data.pagination || null
          );
        }

        return originalJson.call(res, data);
      };

      next();
    };
  }

  generateListingCacheKey(req) {
    const { category, brand, sortBy, page = 1, limit = 12 } = req.query;
    return `listing:${category || "all"}:${brand || "all"}:${
      sortBy || "default"
    }:page${page}:limit${limit}`;
  }

  getCachingStrategy(dataType) {
    const strategies = {
      "product-static": {
        cache: true,
        ttl: 1800,
        description: "Static product info"
      },
      "product-listing": {
        cache: true,
        ttl: 300,
        description: "Product listings with pagination"
      },
      "product-details": {
        cache: true,
        ttl: 60,
        description: "Full product details"
      },
      "stock-data": {
        cache: false,
        ttl: 0,
        description: "Live stock quantities"
      },
      "pricing-data": {
        cache: true,
        ttl: 300,
        description: "Current prices and discounts"
      },
      "featured-products": {
        cache: true,
        ttl: 900,
        description: "Featured products"
      },
      carousel: {
        cache: true,
        ttl: 3600,
        description: "Carousel images and content"
      }
    };
    return strategies[dataType] || strategies["product-details"];
  }

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

const stockAwareCacheService = new StockAwareCacheService();
module.exports = stockAwareCacheService;
