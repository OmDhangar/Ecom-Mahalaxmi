const Product = require("../../models/Product");
const cacheService = require("../../services/cacheService");


const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;
    
    // Generate cache key based on filters and sort
    const cacheKey = cacheService.generateKey('products', {
      category: category.toString(),
      brand: brand.toString(),
      sortBy
    });
    
    // Check cache first
    const cachedData = cacheService.get('products', cacheKey);
    if (cachedData) {
      console.log(`Cache HIT: Filtered products - ${cacheKey}`);
      return res.status(200).json(cachedData);
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
    };
    
    // Cache the response
    cacheService.set('products', cacheKey, responseData);
    console.log(`Cache SET: Filtered products - ${cacheKey}`);

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
    const cacheKey = 'featured-products';
    
    // Check cache first
    const cachedData = cacheService.get('featured', cacheKey);
    if (cachedData) {
      console.log(`Cache HIT: Featured products`);
      return res.status(200).json(cachedData);
    }
    
    const featuredProducts = await Product.find({ isFeatured: true });
    
    const responseData = {
      success: true,
      data: featuredProducts,
    };
    
    // Cache the response
    cacheService.set('featured', cacheKey, responseData);
    console.log(`Cache SET: Featured products`);

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
    const cacheKey = `product-details:${id}`;
    
    // Check cache first
    const cachedData = cacheService.get('products', cacheKey);
    if (cachedData) {
      console.log(`Cache HIT: Product details - ${id}`);
      return res.status(200).json(cachedData);
    }
    
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    const responseData = {
      success: true,
      data: product,
    };
    
    // Cache the response
    cacheService.set('products', cacheKey, responseData);
    console.log(`Cache SET: Product details - ${id}`);

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
    
    // Invalidate caches when product featured status changes
    cacheService.invalidateRelated('featured');
    cacheService.invalidateRelated('product');
    console.log('Cache invalidated after featured status update');
    
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getFilteredProducts,updateAsFeatured,getFeaturedProducts,getProductDetails };
