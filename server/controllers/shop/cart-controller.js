const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate color for toy products
    if (product.category === 'toys') {
      if (!color) {
        return res.status(400).json({
          success: false,
          message: "Color is required for toy products",
        });
      }
      
      // Validate stock for the selected color
      const colorStock = product.colors.find((c) => c.color === color);
      if (!colorStock || colorStock.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for color ${color}. Available: ${colorStock ? colorStock.stock : 0}`,
        });
      }
    }

    // Validate size for fashion products
    if (product.category === 'fashion') {
      if (!size) {
        return res.status(400).json({
          success: false,
          message: "Size is required for fashion products",
        });
      }
      
      // Check if size is available and has sufficient stock
      if (!product.isSizeAvailable(size, quantity)) {
        const availableStock = product.getStockForSize(size);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for size ${size}. Available: ${availableStock}`,
        });
      }
    }
    
    // For non-fashion products (including toys and others), check total stock if not handled above
    if (product.category !== 'fashion' && product.category !== 'toys') {
      if (product.totalStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.totalStock}`,
        });
      }
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Find cart item based on product category
    const findCurrentProductIndex = cart.items.findIndex((item) => {
      if (product.category === 'fashion') {
        return item.productId.toString() === productId && item.size === size;
      } else if (product.category === 'toys') {
        return item.productId.toString() === productId && item.color === color;
      } else {
        return item.productId.toString() === productId;
      }
    });

    if (findCurrentProductIndex === -1) {
      // Add new item
      const newItem = { productId, quantity };
      if (product.category === 'fashion' && size) {
        newItem.size = size;
      }
      if (product.category === 'toys' && color) {
        newItem.color = color;
      }
      cart.items.push(newItem);
    } else {
      // Update existing item quantity
      const newQuantity = cart.items[findCurrentProductIndex].quantity + quantity;
      
      // Check stock again for the new total quantity
      if (product.category === 'fashion') {
        if (!product.isSizeAvailable(size, newQuantity)) {
          const availableStock = product.getStockForSize(size);
          return res.status(400).json({
            success: false,
            message: `Cannot add ${quantity} more. Maximum available for size ${size}: ${availableStock}`,
          });
        }
      } else if (product.category !== 'toys') {
        // For non-fashion, non-toy products
        if (product.totalStock < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot add ${quantity} more. Maximum available: ${product.totalStock}`,
          });
        }
      }
      // Check color stock for toys
      if (product.category === 'toys' && color) {
        const colorStock = product.colors.find((c) => c.color === color);
        if (!colorStock || colorStock.stock < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot add ${quantity} more. Maximum available for color ${color}: ${colorStock ? colorStock.stock : 0}`,
          });
        }
      }

      cart.items[findCurrentProductIndex].quantity = newQuantity;
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is manadatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          items: [],
        },
        message: "Your cart is empty",
      });
    }


    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
      size: item.size || null, // Include size for fashion products
      color: item.color || null, // Include color for toy products
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Get product to check category
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find cart item by productId and size (for fashion products)
    // Find cart item by productId and size/color
    const findCurrentProductIndex = cart.items.findIndex((item) => {
      if (product.category === 'fashion') {
        return item.productId.toString() === productId && item.size === size;
      } else if (product.category === 'toys') {
        return item.productId.toString() === productId && item.color === color;
      } else {
        return item.productId.toString() === productId;
      }
    });

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    // Validate stock before updating quantity
    if (product.category === 'fashion') {
      if (!size) {
        return res.status(400).json({
          success: false,
          message: "Size is required for fashion products",
        });
      }
      
      if (!product.isSizeAvailable(size, quantity)) {
        const availableStock = product.getStockForSize(size);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for size ${size}. Available: ${availableStock}`,
        });
      }
    } else if (product.category === 'toys') {
      // For toy products, validate color stock
      if (!color) {
        return res.status(400).json({
          success: false,
          message: "Color is required for toy products",
        });
      }
      
      const colorStock = product.colors?.find((c) => c.color === color);
      if (!colorStock || colorStock.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for color ${color}. Available: ${colorStock ? colorStock.stock : 0}`,
        });
      }
    } else {
      // For other products, check total stock
      if (product.totalStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.totalStock}`,
        });
      }
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    // Update the cart item mapping
    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null, // Add color field
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!"
      });
    }

    await Cart.findOneAndDelete({ userId });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart"
    });
  }
};
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { size, color } = req.query; // Get size and color from query parameters
    
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice category",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Filter out the specific item based on productId, size (for fashion), and color (for toys)
    cart.items = cart.items.filter((item) => {
      if (size && item.productId.category === 'fashion') {
        // For fashion products, match both productId and size
        return !(item.productId._id.toString() === productId && item.size === size);
      } else if (color && item.productId.category === 'toys') {
        // For toy products, match both productId and color
        return !(item.productId._id.toString() === productId && item.color === color);
      } else {
        // For other products, match only productId
        return item.productId._id.toString() !== productId;
      }
    });

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      size: item.size || null, // Include size for fashion products
      color: item.color || null, // Include color for toy products
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  clearCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
