const Product = require("../../models/Product");
const stockAwareCacheService = require("../../services/stockAwareCacheService");


const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;
    
    // Generate cache key for stock-aware listing cache
    const cacheKey = stockAwareCacheService.generateListingCacheKey(req);
    
    // Check short-term listing cache (5 minutes, stock indicators only)
    const cachedListing = stockAwareCacheService.getProductListing(cacheKey);
    if (cachedListing && !stockAwareCacheService.isListingCacheStale(cacheKey)) {
      console.log(`Stock-aware cache HIT: Product listing - ${cacheKey}`);
      return res.status(200).json({
        success: true,
        data: cachedListing,
        cached: true,
        cacheType: 'listing-with-stock-indicators'
      });
    }

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    const products = await Product.find(filters).sort(sort);
    
    console.log(`Fetched ${products.length} products from DB with current stock data`);
    
    const responseData = {
      success: true,
      data: products,
      cached: false,
      cacheType: 'fresh-from-database-with-live-stock'
    };
    
    // Cache the listing data (with stock indicators only, short TTL)
    stockAwareCacheService.getProductListing(cacheKey, products);
    console.log(`Stock-aware cache SET: Product listing - ${cacheKey} (5min TTL)`);

    res.status(200).json(responseData);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const cacheKey = 'featured-products-listing';
    
    // Check short-term cache for featured products (15 minutes)
    const strategy = stockAwareCacheService.getCachingStrategy('featured-products');
    console.log(`Featured products cache strategy: ${strategy.description} (${strategy.ttl/60}min)`);
    
    // For featured products, we can use slightly longer cache (15 min) but still with stock indicators
    const cachedListing = stockAwareCacheService.getProductListing(cacheKey);
    if (cachedListing && !stockAwareCacheService.isListingCacheStale(cacheKey)) {
      console.log(`Stock-aware cache HIT: Featured products`);
      return res.status(200).json({
        success: true,
        data: cachedListing,
        cached: true,
        cacheType: 'featured-with-stock-indicators'
      });
    }
    
    // Fetch fresh data with current stock information
    const featuredProducts = await Product.find({ isFeatured: true, isActive: true });
    console.log(`Fetched ${featuredProducts.length} featured products with live stock data`);
    
    const responseData = {
      success: true,
      data: featuredProducts,
      cached: false,
      cacheType: 'fresh-featured-with-live-stock'
    };
    
    // Cache the listing with stock indicators
    stockAwareCacheService.getProductListing(cacheKey, featuredProducts);
    console.log(`Stock-aware cache SET: Featured products (15min TTL)`);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Unable to fetch featured products",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For individual product details, we NEVER cache the full product with stock
    // We can only cache static data separately
    stockAwareCacheService.trackStockRequest();
    
    console.log(`Fetching product details for ${id} with LIVE STOCK DATA (never cached)`);
    
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    // Separate static and dynamic data
    const { staticData, dynamicData } = stockAwareCacheService.separateProductData(product);
    
    // Cache only static data (safe to cache)
    stockAwareCacheService.setStaticProductData(id, staticData);
    
    // Always return fresh dynamic data (stock, prices, etc.)
    const responseData = {
      success: true,
      data: {
        ...staticData,
        ...dynamicData // Fresh stock and pricing data
      },
      cached: false,
      cacheType: 'static-cached-dynamic-fresh',
      stockFreshness: 'live-from-database'
    };
    
    console.log(`Product details: Static data cached, dynamic data fresh from DB`);

    res.status(200).json(responseData);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const updateAsFeatured = async (req, res) => {
  //this controller is not getting hit fix it 
  if (!req.body || !req.params.id) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }
  const { isFeatured, featuredDescription } = req.body;
  const productId = req.params.id;
  console.log("controller hit",isFeatured,featuredDescription);

  try {
    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        isFeatured,
        featuredDescription,
      },
      { new: true }
    );
    
    // Smart cache invalidation for stock-aware system
    stockAwareCacheService.invalidateProduct(productId, 'featured-status-update');
    
    // If stock might have changed, invalidate stock-related caches
    if (updated.totalStock !== undefined) {
      stockAwareCacheService.invalidateOnStockChange(productId, 'stock-update-with-featured');
    }
    
    console.log('Stock-aware caches invalidated after featured status update');
    
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getFilteredProducts,updateAsFeatured,getFeaturedProducts,getProductDetails };
