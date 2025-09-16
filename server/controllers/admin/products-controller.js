const { imageUploadUtil,cloudinary } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    // Direct upload to Cloudinary without base64 conversion for efficiency
    const result = await imageUploadUtil(`data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString("base64")}`);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.json({
      success: false,
      message: "Image upload failed",
    });
  }
};

// Generate SKU automatically if not provided
const generateSKU = (title, category, brand) => {
 const cleanup = (str, len) =>
 str.replace(/[^A-Z0-9]/gi, '').substring(0, len).toUpperCase();
 const titleCode = cleanup(title, 3);  // 3 chars from title
 const categoryCode = cleanup(category, 2); // 2 chars from category
 const brandCode = cleanup(brand, 2); // 2 chars from brand
 const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
 return `${titleCode}${categoryCode}${brandCode}${randomNum}`;
};


//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      weight,
      length,
      breadth,
      height,
      sku,
      hsn,
      tax,
      manufacturer,
      countryOfOrigin,
      materialComposition,
      careInstructions,
      warranty,
      returnPolicy,
      batteryHealth,
      condition,
      sizes,
      colors // Updated field for toys
    } = req.body;

    // Generate SKU if not provided
    const productSKU = sku || generateSKU(title, category, brand);

    // Check if SKU already exists
    const existingSKU = await Product.findOne({ sku: productSKU });
    if (existingSKU) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists. Please provide a unique SKU.",
      });
    }

    // Validate shipping fields
    if (!weight || weight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product weight is required and must be greater than 0",
      });
    }
    if (!length || !breadth || !height || length <= 0 || breadth <= 0 || height <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product dimensions (length, breadth, height) are required and must be greater than 0",
      });
    }

    // Category-specific validations
    if (category === 'electronics') {
      const validConditions = ['new', 'refurbished', 'second-hand'];
      if (!batteryHealth || !condition || !validConditions.includes(condition)) {
        return res.status(400).json({
          success: false,
          message: 'Battery health and valid condition ("new", "refurbished", "second-hand") are required for electronics',
        });
      }
    }

    if (category === 'fashion') {
      if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Sizes are required for fashion items and must be a non-empty array',
        });
      }
      const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
      const invalidSizes = [];
      for (const sizeItem of sizes) {
        if (typeof sizeItem === 'object' && sizeItem.size && typeof sizeItem.stock === 'number') {
          if (!validSizes.includes(sizeItem.size)) {
            invalidSizes.push(sizeItem.size);
          }
          if (sizeItem.stock < 0) {
            return res.status(400).json({
              success: false,
              message: `Stock for size ${sizeItem.size} cannot be negative`,
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: 'Each size item must have both size and stock properties',
          });
        }
      }
      if (invalidSizes.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid sizes provided: ${invalidSizes.join(', ')}`,
        });
      }
    }

    if (category === 'toys') {
      if (!colors || !Array.isArray(colors) || colors.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Colors are required for toy products and must be a non-empty array',
        });
      }
      for (const colorItem of colors) {
        if (typeof colorItem !== 'object' || !colorItem.color || typeof colorItem.stock !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each color item must have both color and stock properties',
          });
        }
        if (colorItem.stock < 0) {
          return res.status(400).json({
            success: false,
            message: `Stock for color ${colorItem.color} cannot be negative`,
          });
        }
      }
    }

    // Construct the product data object
    const newProductData = {
      image,
      additionalImages: req.body.additionalImages || [],
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview: 0,
      weight: parseFloat(weight),
      length: parseFloat(length),
      breadth: parseFloat(breadth),
      height: parseFloat(height),
      sku: productSKU,
      hsn: hsn || "0000",
      tax: parseFloat(tax) || 0,
      manufacturer: manufacturer || brand,
      countryOfOrigin: countryOfOrigin || "India",
      materialComposition,
      careInstructions,
      warranty,
      returnPolicy,
      batteryHealth: category === 'electronics' ? batteryHealth : undefined,
      condition: category === 'electronics' ? condition : undefined,
      sizes: category === 'fashion' ? sizes : undefined,
      colors: category === 'toys' ? colors : undefined,
    };

    const newlyCreatedProduct = new Product(newProductData);

    await newlyCreatedProduct.save();

    return res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
      message: "Product created successfully with shipping information",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred while creating product",
      error: e.message,
    });
  }
};


//fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      brand,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      inStock,
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') filter.totalStock = { $gt: 0 };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listOfProducts, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: listOfProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      // Shipping fields
      weight,
      length,
      breadth,
      height,
      sku,
      hsn,
      tax,
      // Additional fields
      manufacturer,
      countryOfOrigin,
      materialComposition,
      careInstructions,
      warranty,
      returnPolicy,
      specifications,
      color, // Add color field
      batteryHealth,
      condition,
      sizes
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check SKU uniqueness if it's being changed
    if (sku && sku !== findProduct.sku) {
      const existingSKU = await Product.findOne({ sku, _id: { $ne: id } });
      if (existingSKU) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists. Please provide a unique SKU.",
        });
      }
    }

    // Update basic fields
    if (image !== undefined) findProduct.image = image;
    if (req.body.additionalImages !== undefined) findProduct.additionalImages = req.body.additionalImages;
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : (price !== undefined ? parseFloat(price) : findProduct.price);
    findProduct.salePrice = salePrice === "" ? 0 : (salePrice !== undefined ? parseFloat(salePrice) : findProduct.salePrice);
    findProduct.totalStock = totalStock !== undefined ? parseInt(totalStock) : findProduct.totalStock;
    findProduct.averageReview = averageReview !== undefined ? parseFloat(averageReview) : findProduct.averageReview;

    // Update shipping fields
    if (weight !== undefined) {
      const weightValue = parseFloat(weight);
      if (weightValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "Weight must be greater than 0",
        });
      }
      findProduct.weight = weightValue;
    }

    if (length !== undefined) {
      const lengthValue = parseFloat(length);
      if (lengthValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "Length must be greater than 0",
        });
      }
      findProduct.length = lengthValue;
    }

    if (breadth !== undefined) {
      const breadthValue = parseFloat(breadth);
      if (breadthValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "Breadth must be greater than 0",
        });
      }
      findProduct.breadth = breadthValue;
    }

    if (height !== undefined) {
      const heightValue = parseFloat(height);
      if (heightValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "Height must be greater than 0",
        });
      }
      findProduct.height = heightValue;
    }

    findProduct.sku = sku || findProduct.sku;
    findProduct.hsn = hsn || findProduct.hsn;
    findProduct.tax = tax !== undefined ? parseFloat(tax) : findProduct.tax;

    // Update additional fields
    findProduct.manufacturer = manufacturer || findProduct.manufacturer;
    findProduct.countryOfOrigin = countryOfOrigin || findProduct.countryOfOrigin;
    findProduct.materialComposition = materialComposition || findProduct.materialComposition;
    findProduct.careInstructions = careInstructions || findProduct.careInstructions;
    findProduct.warranty = warranty || findProduct.warranty;
    findProduct.returnPolicy = returnPolicy || findProduct.returnPolicy;
    findProduct.specifications = specifications || findProduct.specifications;

    // Update timestamp
    findProduct.updatedAt = new Date();

    // Category-specific validations for toys
    if (category === 'toys' && !findProduct.color && !color) {
      return res.status(400).json({
        success: false,
        message: 'Color is required for toy products',
      });
    }

    // Update basic fields
    if (image !== undefined) findProduct.image = image;
    if (req.body.additionalImages !== undefined) findProduct.additionalImages = req.body.additionalImages;
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : (price !== undefined ? parseFloat(price) : findProduct.price);
    findProduct.salePrice = salePrice === "" ? 0 : (salePrice !== undefined ? parseFloat(salePrice) : findProduct.salePrice);
    findProduct.totalStock = totalStock !== undefined ? parseInt(totalStock) : findProduct.totalStock;
    findProduct.averageReview = averageReview !== undefined ? parseFloat(averageReview) : findProduct.averageReview;

    // Update category-specific fields
    if (category === 'toys' || findProduct.category === 'toys') {
      findProduct.color = color || findProduct.color;
    }

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
      message: "Product updated successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating product",
      error: e.message,
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    // Delete images from Cloudinary
    if (product.image) {
      await deleteImageFromCloudinary(product.image);
    }
    if (product.additionalImages) {
      for (const image of product.additionalImages) {
        await deleteImageFromCloudinary(image);
      }
    }

    // Check if product is part of any pending orders (optional check)
    // You can implement this check if needed
    
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: {
        id: product._id,
        title: product.title,
        sku: product.sku,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting product",
    });
  }
};

// New function to get product by SKU
const getProductBySKU = async (req, res) => {
  try {
    const { sku } = req.params;
    
    const product = await Product.findOne({ sku });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found with this SKU",
      });
    }
    console.log(product);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching product",
    });
  }
};

// New function to update stock (supports size-specific updates)
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set', size } = req.body; // operation can be 'set', 'add', 'subtract'

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Use the model's updateStock method which handles size-specific updates
    await product.updateStock(parseInt(quantity), operation, size);

    res.status(200).json({
      success: true,
      data: product,
      message: size 
        ? `Stock ${operation}ed successfully for size ${size}` 
        : `Stock ${operation}ed successfully`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating stock",
      error: e.message,
    });
  }
};

// New function to get size-specific stock
const getSizeStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { size } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (size) {
      const stock = product.getStockForSize(size);
      return res.status(200).json({
        success: true,
        data: { size, stock, available: stock > 0 },
      });
    }

    // Return all size stocks for fashion products
    if (product.category === 'fashion' && product.sizes) {
      const sizeStocks = product.sizes.map(s => ({
        size: s.size,
        stock: s.stock,
        available: s.stock > 0
      }));
      return res.status(200).json({
        success: true,
        data: { totalStock: product.totalStock, sizes: sizeStocks },
      });
    }

    // For non-fashion products, return total stock
    res.status(200).json({
      success: true,
      data: { totalStock: product.totalStock, available: product.totalStock > 0 },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching stock",
    });
  }
};

// Bulk operations
const bulkUpdateProducts = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, updates} objects

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, ...updateData } = update;
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        if (updatedProduct) {
          results.push(updatedProduct);
        } else {
          errors.push({ id, error: "Product not found" });
        }
      } catch (updateError) {
        errors.push({ id: update.id, error: updateError.message });
      }
    }

    res.status(200).json({
      success: true,
      data: results,
      errors: errors,
      message: `Bulk update completed. ${results.length} products updated, ${errors.length} errors.`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred during bulk update",
    });
  }
};
const deleteImageFromCloudinary = async (reqOrUrl, res) => {
  try {
    let publicId;
    
    if (typeof reqOrUrl === 'string') {
      publicId = extractPublicIdFromUrl(reqOrUrl);
    } else if (reqOrUrl && reqOrUrl.body) {
      // Only access body if reqOrUrl is not null
      const { public_id } = reqOrUrl.body;
      publicId = public_id;
    } else {
      console.error('Invalid request or URL passed to deleteImageFromCloudinary');
      if (res) {
        return res.status(400).json({
          success: false,
          message: "Invalid request or URL"
        });
      }
      return false;
    }
    
    if (!publicId) {
      console.error('Public ID is required or could not be extracted from URL');
      if (res) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required"
        });
      }
      return false;
    }
    
    // Use Cloudinary's destroy method to delete the image
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      if (res) {
        return res.status(200).json({
          success: true,
          message: "Image deleted successfully"
        });
      }
      return true;
    } else {
      console.error('Failed to delete image:', result);
      if (res) {
        return res.status(400).json({
          success: false,
          message: "Failed to delete image",
          error: result
        });
      }
      return false;
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    if (res) {
      return res.status(500).json({
        success: false,
        message: "Error occurred while deleting image",
        error: error.message
      });
    }
    return false;
  }
};

function extractPublicIdFromUrl(url) {
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and before file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}


module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  getProductBySKU,
  updateStock,
  getSizeStock,
  deleteImageFromCloudinary,
  bulkUpdateProducts,
};
