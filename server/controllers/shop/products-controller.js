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
    
    
    const responseData = {
      success: true,
      data: products,
      cached: false,
      cacheType: 'fresh-from-database-with-live-stock'
    };
    
    // Cache the listing data (with stock indicators only, short TTL)
    stockAwareCacheService.getProductListing(cacheKey, products);

    res.status(200).json(responseData);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true })
      .select('title price image description brand category isFeatured totalStock featuredDescription reviews')
      .populate('reviews')
      .lean();

    // Calculate average rating for each product
    const productsWithRatings = featuredProducts.map(product => {
      const avgRating = product.reviews?.length > 0
        ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
        : 0;

      return {
        ...product,
        avgRating: Number(avgRating),
        reviewCount: product.reviews?.length || 0,
        // Ensure main image is always available
        mainImage: product.image || '',
        // Format price if needed
        formattedPrice: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(product.price)
      };
    });

    res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: productsWithRatings
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message
    });
  }
};
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For individual product details, we NEVER cache the full product with stock
    // We can only cache static data separately
    stockAwareCacheService.trackStockRequest();
    
    
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
    


    res.status(200).json(responseData);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const updateAsFeatured = async (req, res) => {
  if (!req.body || !req.params.id) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }
  const { isFeatured, featuredDescription } = req.body;
  const productId = req.params.id;

  try {
    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        isFeatured,
        featuredDescription: featuredDescription || undefined,
        updatedAt: new Date() // Update timestamp
      },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    // Clear ALL caches related to featured products
    try {
      stockAwareCacheService.invalidateProduct(productId, 'admin-featured-status-update');
      stockAwareCacheService.invalidateOnStockChange(productId, 'admin-featured-update');
      
      // Clear any featured product listing caches
      const featuredCacheKey = 'featured-products-listing';
      stockAwareCacheService.invalidateProductListing(featuredCacheKey);
      
    } catch (cacheError) {
      console.warn('⚠️ Cache invalidation error (non-critical):', cacheError.message);
    }
    
    
    res.status(200).json({ 
      success: true, 
      data: updated,
      message: `Product ${isFeatured ? 'marked as featured' : 'removed from featured'} successfully`
    });
  } catch (err) {
    console.error('❌ Error updating featured status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getFilteredProducts,updateAsFeatured,getFeaturedProducts,getProductDetails };
