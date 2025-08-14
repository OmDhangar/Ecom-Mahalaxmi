const Razorpay = require("razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const dotenv = require("dotenv");
const crypto = require("crypto");
const axios = require("axios");

dotenv.config();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not set in environment variables');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

const authenticateShiprocket = async () => {
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

    // Calculate total weight and dimensions
    let totalWeight = 0;
    let totalLength = 0, totalBreadth = 0, totalHeight = 0;

    // Sum shipping charges from products
    let shippingChargesTotal = 0;

    const orderItems = products.map(product => {
      totalWeight += (product.weight || 0.5) * product.quantity;
      totalLength = Math.max(totalLength, product.length || 10);
      totalBreadth = Math.max(totalBreadth, product.breadth || 10);
      totalHeight += (product.height || 5) * product.quantity;

      shippingChargesTotal += (product.shippingCharges || 0) * product.quantity;

      return {
        name: product.title,
        sku: product.sku || product._id,
        units: product.quantity,
        selling_price: product.price,
        discount: product.discount || 0,
        tax: product.tax || 0,
        hsn: product.hsn || 0
      };
    });

    const shiprocketOrderData = {
      order_id: orderData._id.toString(),
      order_date: orderData.orderDate.toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      channel_id: "",
      comment: orderData.addressInfo.notes || "Order placed via website",
      billing_customer_name: orderData.addressInfo.name,
      billing_last_name: "",
      billing_address: orderData.addressInfo.address,
      billing_address_2: "",
      billing_city: orderData.addressInfo.city,
      billing_pincode: orderData.addressInfo.pincode,
      billing_state: orderData.addressInfo.state,
      billing_country: "India",
      billing_email: orderData.addressInfo.email || "customer@example.com",
      billing_phone: orderData.addressInfo.phone,
      shipping_is_billing: true,
      shipping_customer_name: "",
      shipping_last_name: "",
      shipping_address: "",
      shipping_address_2: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_country: "",
      shipping_state: "",
      shipping_email: "",
      shipping_phone: "",
      order_items: orderItems,
      payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: shippingChargesTotal,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: orderData.discount || 0,
      sub_total: orderData.subTotal || orderData.totalAmount,
      length: totalLength,
      breadth: totalBreadth,
      height: totalHeight,
      weight: totalWeight || 0.5
    };

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
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
      enhancedError.message = 'No response from Shiprocket API';
      enhancedError.details = {
        error: 'Network error',
        timeout: error.code === 'ECONNABORTED',
        code: error.code
      };
    } else {
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
      } else {
        // Handle regular stock deduction for non-fashion products
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
};
