const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
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
      averageReview,
      // New shipping fields
      weight,
      length,
      breadth,
      height,
      sku,
      hsn,
      tax,
      // Additional product details
      manufacturer,
      countryOfOrigin,
      materialComposition,
      careInstructions,
      warranty,
      returnPolicy,
    } = req.body;

    console.log(averageReview, "averageReview");

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

    // Validate required shipping fields
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

    const newlyCreatedProduct = new Product({
      image,
      additionalImages: req.body.additionalImages || [],
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      // Shipping information
      weight: parseFloat(weight),
      length: parseFloat(length),
      breadth: parseFloat(breadth),
      height: parseFloat(height),
      sku: productSKU,
      hsn: hsn || "0000",
      tax: parseFloat(tax) || 0,
      // Additional details
      manufacturer: manufacturer || brand,
      countryOfOrigin: countryOfOrigin || "India",
      materialComposition,
      careInstructions,
      warranty,
      returnPolicy,
      // Auto-generated fields
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
      message: "Product created successfully with shipping information",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
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

    // Update timestamp
    findProduct.updatedAt = new Date();

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

// New function to update stock
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body; // operation can be 'set', 'add', 'subtract'

    if (!quantity || quantity < 0) {
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

    let newStock;
    switch (operation) {
      case 'add':
        newStock = product.totalStock + parseInt(quantity);
        break;
      case 'subtract':
        newStock = Math.max(0, product.totalStock - parseInt(quantity));
        break;
      case 'set':
      default:
        newStock = parseInt(quantity);
        break;
    }

    product.totalStock = newStock;
    product.updatedAt = new Date();
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: `Stock ${operation}ed successfully`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating stock",
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

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  getProductBySKU,
  updateStock,
  bulkUpdateProducts,
};