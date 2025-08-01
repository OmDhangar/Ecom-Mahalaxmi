const mongoose = require("mongoose");

const categoryMappings = {
  "electronics": {
    hsn: "8517",
    tax: 18,
    prefix: "MOB"
  },
  "fashion": {
    hsn: "6101",
    tax: 12,
    prefix: "MEN"
  },
  "farming": {
    hsn: "8413",
    tax: 18,
    prefix: "FRM"
  },
  "toys": {
    hsn: "9503",
    tax: 12,
    prefix: "KID"
  },
};

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: {
      type: String,
      required: true,
      lowercase: true,
      enum: Object.keys(categoryMappings),
    },
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,

    featured: {
      type: Boolean,
      default: false,
    },
    featuredDescription: {
      type: String,
      default: "",
    },

    // Required for shipping (Shiprocket)
    weight: {
      type: Number,
      default: 0.5, // kg
      required: true,
    },
    length: {
      type: Number,
      default: 10, // cm
      required: true,
    },
    breadth: {
      type: Number,
      default: 10,
      required: true,
    },
    height: {
      type: Number,
      default: 5,
      required: true,
    },

    sku: {
      type: String,
      unique: true,
    },
    hsn: {
      type: String,
      default: "0000",
    },
    tax: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate SKU, HSN, Tax based on category before saving
ProductSchema.pre("save", async function (next) {
  if (!this.isModified("category")) return next();

  const mapping = categoryMappings[this.category];
  if (mapping) {
    this.hsn = mapping.hsn;
    this.tax = mapping.tax;

    // Generate SKU if not already set
    if (!this.sku) {
      const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.sku = `${mapping.prefix}-${uniqueSuffix}`;
    }
  }

  next();
});

module.exports = mongoose.model("Product", ProductSchema);
