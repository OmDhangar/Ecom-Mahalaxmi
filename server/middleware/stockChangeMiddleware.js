const stockAwareCacheService = require('../services/stockAwareCacheService');

/**
 * Stock Change Monitoring Middleware
 * Automatically invalidates caches when stock levels change
 * Prevents stale stock data from being cached
 */

/**
 * Monitor product stock changes and invalidate caches
 */
const monitorStockChanges = () => {
  return async (req, res, next) => {
    // Only monitor POST, PUT, PATCH requests that might change stock
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }
    
    // Extract product ID from various possible sources
    const productId = req.params.id || req.params.productId || req.body.productId;
    
    if (!productId) {
      return next();
    }
    
    // Store original data for comparison if available
    let originalStock = null;
    
    // Try to get current stock before the operation
    try {
      if (req.method !== 'POST') { // Not for new product creation
        const Product = require('../models/Product');
        const currentProduct = await Product.findById(productId);
        if (currentProduct) {
          originalStock = currentProduct.totalStock;
        }
      }
    } catch (error) {
      console.warn('Could not fetch original stock for comparison:', error.message);
    }
    
    // Override res.json to detect changes after operation
    const originalJson = res.json;
    res.json = function(data) {
      // Check if this was a successful operation
      if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
        
        // Handle different types of operations
        if (req.method === 'POST' && req.path.includes('product')) {
          // New product created
          console.log(`New product created: ${productId} - invalidating product listings`);
          stockAwareCacheService.invalidateOnStockChange(productId, 'new-product-created');
        }
        
        else if (req.method === 'DELETE') {
          // Product deleted
          console.log(`Product deleted: ${productId} - invalidating all related caches`);
          stockAwareCacheService.invalidateProduct(productId, 'product-deleted');
        }
        
        else if (['PUT', 'PATCH'].includes(req.method)) {
          // Product updated - check what changed
          let stockChanged = false;
          let priceChanged = false;
          
          // Check if stock-related fields were in the request
          if (req.body) {
            const stockFields = ['totalStock', 'sizes', 'variants', 'quantity'];
            const priceFields = ['price', 'salePrice', 'discountValue'];
            
            stockChanged = stockFields.some(field => req.body.hasOwnProperty(field));
            priceChanged = priceFields.some(field => req.body.hasOwnProperty(field));
          }
          
          // Also check if the response indicates stock changed
          if (data.data && originalStock !== null) {
            const newStock = data.data.totalStock;
            if (newStock !== originalStock) {
              stockChanged = true;
              console.log(`Stock changed detected: ${originalStock} → ${newStock} for product ${productId}`);
            }
          }
          
          if (stockChanged) {
            console.log(`Stock update detected for product ${productId} - invalidating stock caches`);
            stockAwareCacheService.invalidateOnStockChange(productId, 'stock-level-changed');
          } else if (priceChanged) {
            console.log(`Price update detected for product ${productId} - invalidating product caches`);
            stockAwareCacheService.invalidateProduct(productId, 'price-changed');
          } else {
            console.log(`Static product data updated for ${productId} - invalidating static cache only`);
            stockAwareCacheService.invalidateProduct(productId, 'static-data-updated');
          }
        }
        
        // Special handling for cart operations (reduce stock)
        if (req.path.includes('cart') || req.path.includes('order')) {
          if (req.body.items && Array.isArray(req.body.items)) {
            req.body.items.forEach(item => {
              if (item.productId) {
                console.log(`Cart/Order operation affecting product ${item.productId} - invalidating stock`);
                stockAwareCacheService.invalidateOnStockChange(item.productId, 'cart-operation');
              }
            });
          }
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware specifically for cart operations
 */
const monitorCartStockChanges = () => {
  return async (req, res, next) => {
    if (req.method !== 'POST') {
      return next();
    }
    
    // Monitor add to cart operations
    if (req.path.includes('cart') && req.body.productId) {
      const { productId, quantity = 1 } = req.body;
      
      console.log(`Cart operation: Adding ${quantity} of product ${productId}`);
      
      // After successful cart addition, we should invalidate stock cache
      // since stock levels might need to reflect reserved quantities
      const originalJson = res.json;
      res.json = function(data) {
        if (data.success) {
          console.log(`Cart addition successful - invalidating stock cache for product ${productId}`);
          stockAwareCacheService.invalidateOnStockChange(productId, 'added-to-cart');
        }
        return originalJson.call(this, data);
      };
    }
    
    next();
  };
};

/**
 * Middleware for order completion (reduces actual stock)
 */
const monitorOrderStockChanges = () => {
  return async (req, res, next) => {
    if (req.method !== 'POST' || !req.path.includes('order')) {
      return next();
    }
    
    // Monitor order creation/completion
    const originalJson = res.json;
    res.json = function(data) {
      if (data.success && data.data) {
        const order = data.data;
        
        // If order contains items, invalidate stock for all products
        if (order.cartItems && Array.isArray(order.cartItems)) {
          console.log(`Order completed - invalidating stock for ${order.cartItems.length} products`);
          
          order.cartItems.forEach(item => {
            if (item.productId) {
              stockAwareCacheService.invalidateOnStockChange(item.productId, 'order-completed');
            }
          });
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Emergency cache clear for critical stock issues
 */
const emergencyStockCacheClear = () => {
  return (req, res, next) => {
    // Check for emergency clear header
    if (req.headers['x-emergency-cache-clear'] === 'true') {
      console.log('EMERGENCY: Clearing all stock-related caches');
      stockAwareCacheService.clearAll();
      
      res.setHeader('X-Cache-Cleared', 'true');
    }
    
    next();
  };
};

/**
 * Stock validation middleware - prevents operations on out-of-stock products
 */
const validateStockBeforeOperation = () => {
  return async (req, res, next) => {
    // Only validate stock for cart additions and direct purchases
    if (!req.path.includes('cart') && !req.path.includes('order')) {
      return next();
    }
    
    const { productId, quantity = 1, size } = req.body;
    
    if (!productId || req.method !== 'POST') {
      return next();
    }
    
    try {
      const Product = require('../models/Product');
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Check stock availability
      const isAvailable = product.isSizeAvailable ? 
        product.isSizeAvailable(size, quantity) : 
        product.totalStock >= quantity;
      
      if (!isAvailable) {
        console.log(`Stock validation failed: Product ${productId} - Requested: ${quantity}, Available: ${product.totalStock}`);
        
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
          available: product.totalStock,
          requested: quantity,
          productId
        });
      }
      
      console.log(`Stock validation passed: Product ${productId} - Requested: ${quantity}, Available: ${product.totalStock}`);
      
    } catch (error) {
      console.error('Stock validation error:', error);
      // Continue with operation but log the error
    }
    
    next();
  };
};

module.exports = {
  monitorStockChanges,
  monitorCartStockChanges,
  monitorOrderStockChanges,
  emergencyStockCacheClear,
  validateStockBeforeOperation
};
