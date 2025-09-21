const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  // Basic product information
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  
batteryHealth: {
    type: String,
    trim: true,
    required: function () {
      return this.category === 'electronics';
    },
    validate: {
      validator: function(v) {
        if (this.category === 'electronics') {
          return v && v.length > 0;
        }
        return true;
      },
      message: 'Battery health is required for electronics products'
    }
  },


condition: {
    type: String,
    enum: ['new', 'refurbished', 'second-hand'],
    default: 'new',
    required: function () {
      return this.category === 'electronics';
    }
  },

sizes: {
  type: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  }],
  validate: {
    validator: function(v) {
      if (this.category === 'fashion') {
        return Array.isArray(v) && v.length > 0;
      }
      return true;
    },
    message: 'At least one size is required for fashion products'
  }
},




  // Pricing information
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  shippingCharges: Number, // in INR, calculated once during product creation

  
  // Inventory
  totalStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  
  // Product rating
  averageReview: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  
  // Shipping information (Required for Shiprocket)
  weight: {
    type: Number,
    required: true,
    min: 0.1,
    default: 0.5, // in kg
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Weight must be greater than 0'
    }
  },
  length: {
    type: Number,
    required: true,
     min: 0.2, 
    default: 10, // in cm
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Length must be greater than 0'
    }
  },
  breadth: {
    type: Number,
    required: true,
    min: 0.2,
    default: 10, // in cm
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Breadth must be greater than 0'
    }
  },
  height: {
    type: Number,
    required: true,
    min: 0.2,
    default: 5, // in cm
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Height must be greater than 0'
    }
  },
  
  // Product identification
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{6,20}$/.test(v);
      },
      message: 'SKU must be 6-20 characters long and contain only uppercase letters and numbers'
    }
  },
  
  // Tax information
  hsn: {
    type: String,
    default: "0000",
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{4,8}$/.test(v);
      },
      message: 'HSN must be 4-8 digits'
    }
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
    max: 100, // percentage
  },
  
  // Additional product details
  manufacturer: {
    type: String,
    trim: true,
  },
  countryOfOrigin: {
    type: String,
    default: "India",
    trim: true,
  },
  materialComposition: {
    type: String,
    trim: true,
  },
  careInstructions: {
    type: String,
    trim: true,
  },
  warranty: {
    type: String,
    trim: true,
  },
  returnPolicy: {
    type: String,
    trim: true,
  },
  shippingCost:{
    type: Number,
  },
  
  // Product variants (optional)
  variants: [{
    size: String,
    color: String,
    material: String,
    additionalPrice: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    }
  }],
  
  // SEO fields
  metaTitle: {
    type: String,
    trim: true,
    maxlength: 60,
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  
  // Product status
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  featuredDescription:{
    type:String,
    default:""
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
  // Additional images
  additionalImages: [{
    type: String,
  }],
  
  // Discount information
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none',
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountStartDate: Date,
  discountEndDate: Date,
  
  // Sales tracking
  totalSold: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Reviews and ratings
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    }
  }],
  
  // Inventory alerts
  lowStockAlert: {
    type: Number,
    default: 10,
    min: 0,
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating effective price
ProductSchema.virtual('effectivePrice').get(function() {
  return this.salePrice > 0 ? this.salePrice : this.price;
});

// Virtual for calculating discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.salePrice > 0 && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.totalStock > 0;
});

// Virtual for checking if stock is low
ProductSchema.virtual('isLowStock').get(function() {
  return this.totalStock <= this.lowStockAlert && this.totalStock > 0;
});

// Virtual for volumetric weight calculation (for shipping)
ProductSchema.virtual('volumetricWeight').get(function() {
  // Formula: (L × W × H) / 5000 (for cm to kg conversion)
  const volumetric = (this.length * this.breadth * this.height) / 5000;
  return Math.max(this.weight, volumetric); // Use higher of actual or volumetric weight
});

// Indexes for better query performance
ProductSchema.index({ category: 1, brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ totalStock: 1 });
ProductSchema.index({ averageReview: -1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ title: 'text', description: 'text' }); // Text search index

// Pre-save middleware to update timestamps and calculate fields
ProductSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // Auto-generate manufacturer if not provided
  if (!this.manufacturer && this.brand) {
    this.manufacturer = this.brand;
  }
  
  // Calculate average review if reviews exist
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageReview = totalRating / this.reviews.length;
  }
   // Category-specific validations
  if (this.category === 'electronics') {
    if (!this.batteryHealth || !this.condition) {
      next(new Error('Battery health and condition are required for electronics products'));
      return;
    }
  }

  if (this.category === 'fashion') {
    if (!Array.isArray(this.sizes) || this.sizes.length === 0) {
      next(new Error('Sizes are required for fashion products'));
      return;
    }
    
    // Auto-calculate totalStock from size stocks for fashion products
    if (this.sizes && this.sizes.length > 0) {
      this.totalStock = this.sizes.reduce((total, sizeObj) => total + (sizeObj.stock || 0), 0);
    }
  }
  
  next();
});

// Static method to find products with low stock
ProductSchema.statics.findLowStock = function() {
  return this.find({
    $or: [
      // For non-fashion products, check totalStock
      {
        category: { $ne: 'fashion' },
        $expr: { $lte: ['$totalStock', '$lowStockAlert'] },
        totalStock: { $gt: 0 },
        isActive: true
      },
      // For fashion products, check if any size has low stock
      {
        category: 'fashion',
        $expr: {
          $and: [
            { $gt: ['$totalStock', 0] },
            { $lte: ['$totalStock', '$lowStockAlert'] }
          ]
        },
        isActive: true
      }
    ]
  });
};

// Static method to find out of stock products
ProductSchema.statics.findOutOfStock = function() {
  return this.find({
    $or: [
      // For non-fashion products, check totalStock = 0
      {
        category: { $ne: 'fashion' },
        totalStock: 0,
        isActive: true
      },
      // For fashion products, check if totalStock = 0
      {
        category: 'fashion',
        totalStock: 0,
        isActive: true
      }
    ]
  });
};

// Instance method to update stock
ProductSchema.methods.updateStock = function(quantity, operation = 'set', size = null) {
  if (this.category === 'fashion' && size) {
    // Update size-specific stock for fashion products
    const sizeIndex = this.sizes.findIndex(s => s.size === size);
    if (sizeIndex === -1) {
      throw new Error(`Size ${size} not found for this product`);
    }
    
    switch (operation) {
      case 'add':
        this.sizes[sizeIndex].stock += quantity;
        break;
      case 'subtract':
        this.sizes[sizeIndex].stock = Math.max(0, this.sizes[sizeIndex].stock - quantity);
        break;
      case 'set':
      default:
        this.sizes[sizeIndex].stock = quantity;
        break;
    }
    
    // Recalculate totalStock from all sizes
    this.totalStock = this.sizes.reduce((total, sizeObj) => total + (sizeObj.stock || 0), 0);
  } else {
    // Update totalStock for non-fashion products or when no size specified
    switch (operation) {
      case 'add':
        this.totalStock += quantity;
        break;
      case 'subtract':
        this.totalStock = Math.max(0, this.totalStock - quantity);
        break;
      case 'set':
      default:
        this.totalStock = quantity;
        break;
    }
  }
  
  return this.save();
};

// Instance method to get stock for specific size
ProductSchema.methods.getStockForSize = function(size) {
  if (this.category !== 'fashion') {
    return this.totalStock;
  }
  
  const sizeObj = this.sizes.find(s => s.size === size);
  return sizeObj ? sizeObj.stock : 0;
};

// Instance method to check if size is available
ProductSchema.methods.isSizeAvailable = function(size, quantity = 1) {
  if (this.category !== 'fashion') {
    return this.totalStock >= quantity;
  }
  
  const sizeObj = this.sizes.find(s => s.size === size);
  return sizeObj ? sizeObj.stock >= quantity : false;
};

// Instance method to add review
ProductSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    userId,
    rating,
    comment,
    reviewDate: new Date(),
    verified: false
  });
  return this.save();
};

module.exports = mongoose.model("Product", ProductSchema);