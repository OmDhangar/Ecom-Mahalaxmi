const Razorpay = require("razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const dotenv = require("dotenv");
const crypto = require("crypto");
const axios = require("axios");

dotenv.config();

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('⚠️ Razorpay credentials not found. Razorpay payments will be disabled.');
}

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

const authenticateShiprocket = async () => {
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error('Shiprocket credentials not configured');
  }
  
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }
  const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
  });
  shiprocketToken = response.data.token;
  tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
  return shiprocketToken;
};

async function createShiprocketOrder(orderData, products) {
  try {
    const token = await authenticateShiprocket();

    // Get available pickup locations and channel info
    let pickupLocation = "Primary";
    let channelId = "";
    
    try {
      const pickupResponse = await axios.get(
        `${SHIPROCKET_BASE_URL}/settings/company/pickup`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('Available pickup locations:', pickupResponse.data);
      
      // Use the first available pickup location if Primary doesn't exist
      if (pickupResponse.data && pickupResponse.data.data && pickupResponse.data.data.length > 0) {
        pickupLocation = pickupResponse.data.data[0].nickname || pickupResponse.data.data[0].pickup_location;
      }
    } catch (pickupError) {
      console.warn('Could not fetch pickup locations, using default:', pickupError.message);
    }
    
    // Try to get channel information
    try {
      const channelResponse = await axios.get(
        `${SHIPROCKET_BASE_URL}/channels`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('Available channels:', channelResponse.data);
      
      // Use the first available channel
      if (channelResponse.data && channelResponse.data.data && channelResponse.data.data.length > 0) {
        channelId = channelResponse.data.data[0].id.toString();
      }
    } catch (channelError) {
      console.warn('Could not fetch channels, using default:', channelError.message);
    }

    // Validate addressInfo
    if (!orderData.addressInfo || 
        !orderData.addressInfo.name || 
        !orderData.addressInfo.address || 
        !orderData.addressInfo.city || 
        !orderData.addressInfo.state || 
        !orderData.addressInfo.pincode || 
        !orderData.addressInfo.phone) {
      throw new Error("Billing address is incomplete. Please provide all required fields: name, address, city, state, pincode, phone.");
    }

    // Ensure email exists (use a default if not provided)
    const customerEmail = orderData.addressInfo.email || 'customer@example.com';

    // Validate pincode format (should be string and exactly 6 digits)
    const pincode = orderData.addressInfo.pincode.toString();
    if (!/^\d{6}$/.test(pincode)) {
      throw new Error("Invalid pincode format. Pincode should be 6 digits.");
    }

    // Validate phone number (should be 10 digits)
    const phone = orderData.addressInfo.phone.toString().replace(/\D/g, ''); // Remove non-digits
    if (phone.length !== 10) {
      throw new Error("Invalid phone number. Phone should be 10 digits.");
    }

    console.log("Order Address Info:", orderData.addressInfo);
    console.log("Validated Customer Email:", customerEmail);
    console.log("Pincode:", pincode, "Phone:", phone);

    // Determine the channel_id to use (try multiple fallback options)
    // Common Shiprocket channel IDs: "0", "1", "2", or check your dashboard
    const fallbackChannelIds = ["2058704", "1", "2", "0"];
    const finalChannelId = process.env.SHIPROCKET_CHANNEL_ID || 
                           channelId || 
                           fallbackChannelIds[0]; // Try the most common one first
    console.log('Using channel_id:', finalChannelId);
    console.log('Available channelId from API:', channelId);

    const shiprocketOrderData = {
      order_id: orderData._id.toString(),
      order_date: orderData.orderDate.toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || pickupLocation,
      channel_id: finalChannelId,
      comment: orderData.addressInfo.notes || "Order placed via website",
      
      // Billing Address (Required)
      billing_customer_name: orderData.addressInfo.name.split(' ')[0] || orderData.addressInfo.name,
      billing_last_name: orderData.addressInfo.name.split(' ').slice(1).join(' ') || "",
      billing_address: orderData.addressInfo.address,
      billing_address_2: "", // Secondary address line
      billing_city: orderData.addressInfo.city,
      billing_pincode: pincode,
      billing_state: orderData.addressInfo.state,
      billing_country: "India",
      billing_email: customerEmail,
      billing_phone: phone,
      
      // Shipping Address (Same as billing)
      shipping_is_billing: true,
      shipping_customer_name: orderData.addressInfo.name.split(' ')[0] || orderData.addressInfo.name,
      shipping_last_name: orderData.addressInfo.name.split(' ').slice(1).join(' ') || "",
      shipping_address: orderData.addressInfo.address,
      shipping_address_2: "",
      shipping_city: orderData.addressInfo.city,
      shipping_pincode: pincode,
      shipping_country: "India",
      shipping_state: orderData.addressInfo.state,
      shipping_email: customerEmail,
      shipping_phone: phone,
      
      // Order Items
      order_items: orderData.cartItems.map(item => ({
        name: item.title,
        sku: item.productId || `SKU${item.productId}`,
        units: item.quantity,
        selling_price: parseFloat(item.price),
        discount: 0,
        tax: 0,
        hsn: 0
      })),
      
      // Payment and Pricing
      payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: products.reduce((total, product) => 
        total + (parseFloat(product.shippingCharges || 0) * product.quantity), 0),
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: orderData.discount || 0,
      sub_total: parseFloat(orderData.subTotal || orderData.totalAmount),
      
      // Package Dimensions and Weight
      length: products.length > 0 ? Math.max(...products.map(product => product.length || 30)) : 30,
      breadth: products.length > 0 ? Math.max(...products.map(product => product.breadth || 20)) : 20,
      height: products.length > 0 ? products.reduce((total, product) => 
        total + (product.height || 10) * product.quantity, 0) : 10,
      weight: products.length > 0 ? products.reduce((total, product) => 
        total + (product.weight || 1) * product.quantity, 0) : 1
    };

    console.log("Shiprocket Order Data:", JSON.stringify(shiprocketOrderData, null, 2));

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create`,
      shiprocketOrderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    

    return response.data;

  } catch (error) {
    const enhancedError = new Error();
    enhancedError.name = 'ShiprocketError';
    
    if (error.response) {
      console.error("Shiprocket API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method,
        requestData: JSON.stringify(error.config?.data, null, 2)
      });
      
      // Log specific validation errors
      if (error.response.data?.errors) {
        console.error("Shiprocket Validation Errors:", JSON.stringify(error.response.data.errors, null, 2));
      }
      
      enhancedError.message = error.response.data?.message || 'Shiprocket API error';
      enhancedError.statusCode = error.response.status;
      enhancedError.details = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      };
    } else if (error.request) {
      console.error("Shiprocket Network Error:", error.request);
      enhancedError.message = 'No response from Shiprocket API';
      enhancedError.details = {
        error: 'Network error',
        timeout: error.code === 'ECONNABORTED',
        code: error.code
      };
    } else {
      console.error("Shiprocket Setup Error:", error.message);
      enhancedError.message = error.message || 'Unknown Shiprocket error';
      enhancedError.details = {
        error: 'Request setup error',
        originalMessage: error.message
      };
    }
    
    throw enhancedError;
  }
}

// Process Shiprocket order with retry count limit (max 2 attempts)
async function processShiprocketForOrder(order, products, cartId) {
  try {
    // If retry count > 2, mark needs manual intervention
    if (order.shippingErrorHistory && order.shippingErrorHistory.length >= 2) {
      order.needsManualShipment = true;
      await order.save();
      return { success: false, order, error: { message: "Max shipping retries reached, manual intervention required" } };
    }

    const shiprocketResponse = await createShiprocketOrder(order, products);

    order.shiprocketOrderId = shiprocketResponse.order_id;
    order.shipmentId = shiprocketResponse.shipment_id;
    order.awbCode = shiprocketResponse.awb_code;
    order.courierCompanyId = shiprocketResponse.courier_company_id;
    order.courierName = shiprocketResponse.courier_name;
    order.trackingUrl = shiprocketResponse.tracking_url;
    order.shippingStatus = "booked";
    order.orderStatus = "confirmed";
    order.shippingError = undefined;
    order.needsManualShipment = false;

    if (cartId) await Cart.findByIdAndDelete(cartId);

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      // Handle size-specific stock deduction for fashion products
      if (product.category === 'fashion' && item.size) {
        if (!product.isSizeAvailable(item.size, item.quantity)) {
          const availableStock = product.getStockForSize(item.size);
          throw new Error(`Insufficient stock for ${product.title} size ${item.size}. Available: ${availableStock}`);
        }
        // Update size-specific stock using the model method
        await product.updateStock(item.quantity, 'subtract', item.size);
      } else if (product.category === 'toys' && item.color) {
        // Handle color-specific stock deduction for toy products
        const colorItem = product.colors.find(c => c.color === item.color);
        if (!colorItem || colorItem.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title} color ${item.color}. Available: ${colorItem ? colorItem.stock : 0}`);
        }
        // Use the model's updateStock method for color-specific stock
        await product.updateStock(item.quantity, 'subtract', null, item.color);
      } else {
        // Handle regular stock deduction for other products
        if (product.totalStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}. Available: ${product.totalStock}`);
        }
        await product.updateStock(item.quantity, 'subtract');
      }
    }

    // Push success to shippingErrorHistory
    order.shippingErrorHistory = order.shippingErrorHistory || [];
    order.shippingErrorHistory.push({
      message: "Shipping booked successfully",
      details: shiprocketResponse,
      date: new Date(),
      attemptNumber: order.shippingErrorHistory.length + 1
    });

    await order.save();

    return { success: true, order };

  } catch (err) {
    console.error("🚨 Shiprocket Order Creation Failed:", err.details || err.message);

    order.shippingStatus = "failed";
    order.orderStatus = "shipping_failed";

    order.shippingError = {
      message: err.message || "Unknown Shiprocket error",
      details: err.details || { name: err.name || "UnknownError" },
      date: new Date()
    };

    order.shippingErrorHistory = order.shippingErrorHistory || [];
    order.shippingErrorHistory.push({
      message: err.message,
      details: err.details || {},
      date: new Date(),
      attemptNumber: order.shippingErrorHistory.length + 1
    });

    // Flag for manual retry by admin
    order.needsManualShipment = true;

    await order.save();

    return { success: false, order, error: order.shippingError };
  }
}

const createOrder = async (req, res) => {
  try {
    const {
      userId, cartItems, addressInfo,
      paymentMethod = "cod", paymentStatus,
      subTotal, discount = 0, tax = 0, cartId
    } = req.body;

    // Calculate total shipping charges from products in cartItems
    const productsWithShipping = await Promise.all(cartItems.map(async item => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return { ...product._doc, quantity: item.quantity };
    }));

    const shippingCharges = productsWithShipping.reduce((acc, p) => acc + ((p.shippingCharges || 0) * p.quantity), 0);

    // Total amount = subTotal + shippingCharges + tax - discount
    const totalAmount = subTotal + shippingCharges + tax - discount;

    let finalPaymentStatus = paymentMethod === "cod" ? "pending" : (paymentStatus || "pending");

    const order = new Order({
      userId, cartId, cartItems, addressInfo,
      orderStatus: "pending",
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      subTotal,
      shippingCharges,
      tax,
      discount,
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      shippingStatus: "pending",
      shippingErrorHistory: [],
      needsManualShipment: false,
    });
    await order.save();

    // COD flow: process shipping immediately, no payment required upfront
    if (paymentMethod === "cod") {
      // Check if Shiprocket is configured
      if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
        console.warn('⚠️ Shiprocket not configured. COD order created without shipping integration.');
        
        // Clear cart and deduct stock manually for COD orders without Shiprocket
        if (cartId) await Cart.findByIdAndDelete(cartId);
        
        // Deduct stock
        for (let item of order.cartItems) {
          let product = await Product.findById(item.productId);
          if (!product) throw new Error(`Product not found: ${item.productId}`);
          
          // Handle size-specific stock deduction for fashion products
          if (product.category === 'fashion' && item.size) {
            if (!product.isSizeAvailable(item.size, item.quantity)) {
              const availableStock = product.getStockForSize(item.size);
              throw new Error(`Insufficient stock for ${product.title} size ${item.size}. Available: ${availableStock}`);
            }
            await product.updateStock(item.quantity, 'subtract', item.size);
          } else if (product.category === 'toys' && item.color) {
            // Handle color-specific stock deduction for toy products
            const colorItem = product.colors.find(c => c.color === item.color);
            if (!colorItem || colorItem.stock < item.quantity) {
              throw new Error(`Insufficient stock for ${product.title} color ${item.color}. Available: ${colorItem ? colorItem.stock : 0}`);
            }
            // Use the model's updateStock method for color-specific stock
            await product.updateStock(item.quantity, 'subtract', null, item.color);
          } else {
            if (product.totalStock < item.quantity) {
              throw new Error(`Insufficient stock for ${product.title}. Available: ${product.totalStock}`);
            }
            await product.updateStock(item.quantity, 'subtract');
          }
        }
        
        order.orderStatus = "confirmed";
        order.shippingStatus = "manual";
        await order.save();
        
        return res.status(201).json({
          success: true,
          message: "COD order created successfully. Shipping will be handled manually.",
          order: order
        });
      }
      
      const result = await processShiprocketForOrder(order, productsWithShipping, cartId);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Order created but shipping failed. Admin notified.",
          order: result.order
        });
      }

      return res.status(201).json({
        success: true,
        message: "Order created & shipping initiated successfully",
        order: result.order
      });
    }

    // Razorpay flow: create order with amount including shipping
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured. Please use COD or contact administrator."
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // in paise
      currency: "INR",
      receipt: `order_${order._id}`,
      payment_capture: 1,
      notes: { orderId: order._id.toString(), userId }
    });

    res.status(201).json({
      success: true,
      order,
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error("❌ Order Creation Error:", err);
    res.status(500).json({ success: false, message: err.message || "Order creation failed" });
  }
};


const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    const generatedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;

    const products = await Promise.all(order.cartItems.map(async item => {
      const p = await Product.findById(item.productId);
      return { ...p._doc, quantity: item.quantity };
    }));

    const result = await processShiprocketForOrder(order, products, order.cartId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Payment verified, but shipping failed. Admin notified.",
        order: result.order,
        shippingError: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified & shipping initiated",
      order: result.order
    });

  } catch (err) {
    console.error("❌ Payment Verification Error:", err);
    res.status(500).json({ success: false, message: err.message || "Verification failed" });
  }
};

const trackShiprocketOrder = async (shipmentId) => {
  try {
    const token = await authenticateShiprocket();
    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/shipment/${shipmentId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Shiprocket tracking failed:', error.response?.data || error.message);
    throw new Error('Failed to track shipment');
  }
};

const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    let trackingInfo = { order, tracking: null };

    if (order.shipmentId) {
      try {
        const shiprocketTracking = await trackShiprocketOrder(order.shipmentId);
        trackingInfo.tracking = shiprocketTracking;
      } catch (trackingError) {
        console.error('Failed to get tracking info:', trackingError);
        trackingInfo.tracking = { error: 'Tracking information temporarily unavailable' };
      }
    }

    res.status(200).json({ success: true, data: trackingInfo });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Get Shiprocket data for manual order entry
const getOrderShiprocketData = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    if (!order.shiprocketData) {
      return res.status(404).json({ 
        success: false, 
        message: "No Shiprocket data found for this order" 
      });
    }
    
    res.status(200).json({
      success: true,
      orderId: order._id,
      orderStatus: order.orderStatus,
      shippingStatus: order.shippingStatus,
      needsManualShipment: order.needsManualShipment,
      shiprocketData: order.shiprocketData
    });
  } catch (error) {
    console.error('Error getting Shiprocket data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to get Shiprocket channels (for setup purposes)
const getShiprocketChannels = async (req, res) => {
  try {
    const token = await authenticateShiprocket();
    
    const channelResponse = await axios.get(
      `${SHIPROCKET_BASE_URL}/channels`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    res.status(200).json({
      success: true,
      channels: channelResponse.data
    });
  } catch (error) {
    console.error('Error fetching Shiprocket channels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channels',
      error: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.orderUpdateDate = new Date();

    // If COD order is delivered, mark payment as completed
    if (order.paymentMethod === 'cod' && orderStatus === 'delivered') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found!" });
    }
    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getAllOrdersByUser,
  getOrderDetails,
  trackOrder,
  updateOrderStatus,
  getShiprocketChannels,
  getOrderShiprocketData,
};
