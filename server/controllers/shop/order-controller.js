const Razorpay = require("razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const dotenv = require("dotenv");
const crypto = require("crypto");
const axios = require("axios");

dotenv.config();

// Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not set in environment variables');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Shiprocket configuration
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

// Shiprocket authentication
const authenticateShiprocket = async () => {
  try {
    if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
      return shiprocketToken;
    }

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });

    shiprocketToken = response.data.token;
    // Token expires in 10 days, refresh before that
    tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
    
    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket authentication failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

// Create Shiprocket order
const createShiprocketOrder = async (orderData, products) => {
  try {
    const token = await authenticateShiprocket();
    console.log(orderData);
    
    // Calculate total weight and dimensions
    let totalWeight = 0;
    let totalLength = 0, totalBreadth = 0, totalHeight = 0;
    
    const orderItems = products.map(product => {
      totalWeight += product.weight * product.quantity;
      totalLength = Math.max(totalLength, product.length || 10);
      totalBreadth = Math.max(totalBreadth, product.breadth || 10);
      totalHeight += (product.height || 5) * product.quantity;
      
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
      channel_id: "", // Leave empty for manual orders
      comment: orderData.addressInfo.notes || "Order placed via website",
      billing_customer_name: orderData.addressInfo.name || "❌❌❌❌❌ FIX it early Om Dhangar",
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
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: orderData.totalAmount,
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
    console.error('Shiprocket order creation failed:', error.response?.data || error.message);
    throw new Error('Failed to create Shiprocket order');
  }
};

// Track Shiprocket order
const trackShiprocketOrder = async (shipmentId) => {
  try {
    const token = await authenticateShiprocket();
    
    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/shipment/${shipmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Shiprocket tracking failed:', error.response?.data || error.message);
    throw new Error('Failed to track shipment');
  }
};

// Enhanced createOrder function
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus = "pending",
      paymentMethod = "cod", // Default to COD
      paymentStatus,
      totalAmount,
      cartId,
    } = req.body;

    // Set payment status based on payment method
    let finalPaymentStatus = paymentStatus;
    if (paymentMethod === 'cod') {
      finalPaymentStatus = 'pending'; // COD payment is pending until delivery
    } else if (paymentMethod === 'razorpay') {
      finalPaymentStatus = 'pending'; // Will be updated after payment verification
    }

    // Create a new order in your database first
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newlyCreatedOrder.save();

    // Handle COD orders
    if (paymentMethod === 'cod') {
      try {
        // Update product stocks for COD orders immediately
        for (let item of newlyCreatedOrder.cartItems) {
          let product = await Product.findById(item.productId);

          if (!product) {
            return res.status(404).json({
              success: false,
              message: `Product not found: ${item.productId}`,
            });
          }

          if (product.totalStock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Not enough stock for product: ${product.title}`,
            });
          }

          product.totalStock -= item.quantity;
          await product.save();
        }

        // Delete the cart for COD orders
        if (newlyCreatedOrder.cartId) {
          await Cart.findByIdAndDelete(newlyCreatedOrder.cartId);
        }

        // Create Shiprocket order for COD
        try {
          const products = await Promise.all(
            cartItems.map(async (item) => {
              const product = await Product.findById(item.productId);
              return {
                ...product._doc,
                quantity: item.quantity
              };
            })
          );

          const shiprocketResponse = await createShiprocketOrder(newlyCreatedOrder, products);
          
          // Update order with Shiprocket details
          newlyCreatedOrder.shiprocketOrderId = shiprocketResponse.order_id;
          newlyCreatedOrder.shipmentId = shiprocketResponse.shipment_id;
          newlyCreatedOrder.orderStatus = "confirmed";
          await newlyCreatedOrder.save();

        } catch (shiprocketError) {
          console.error('Shiprocket integration failed for COD order:', shiprocketError);
          // Don't fail the order creation, just log the error
        }

        return res.status(201).json({
          success: true,
          message: "COD order created successfully",
          order: newlyCreatedOrder,
          paymentMethod: 'cod'
        });

      } catch (error) {
        console.error('COD order processing failed:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to process COD order",
        });
      }
    }

    // Handle Razorpay orders (existing logic)
    if (paymentMethod === 'razorpay') {
      const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `order_${newlyCreatedOrder._id}`,
        payment_capture: 1,
        notes: {
          orderId: newlyCreatedOrder._id.toString(),
          userId: userId
        }
      };

      razorpay.orders.create(options, (err, razorpayOrder) => {
        if (err) {
          console.error("Razorpay order creation error:", err);
          return res.status(500).json({
            success: false,
            message: "Error while creating Razorpay order",
          });
        }

        res.status(201).json({
          success: true,
          order: newlyCreatedOrder,
          razorpayOrderId: razorpayOrder.id,
          key: process.env.RAZORPAY_KEY_ID,
          amount: options.amount,
          currency: options.currency,
          name: "Your Company Name",
          description: `Order for ${userId}`,
          prefill: {
            name: addressInfo?.name || "",
            email: addressInfo?.email || "",
            contact: addressInfo?.phone || ""
          },
          theme: {
            color: "#F37254"
          }
        });
      });
    }

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Enhanced verifyPayment function
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;

    // Update product stocks
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Delete the cart
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    }

    // Create Shiprocket order after successful payment
    try {
      const products = await Promise.all(
        order.cartItems.map(async (item) => {
          const product = await Product.findById(item.productId);
          return {
            ...product._doc,
            quantity: item.quantity
          };
        })
      );

      const shiprocketResponse = await createShiprocketOrder(order, products);
      
      // Update order with Shiprocket details
      order.shiprocketOrderId = shiprocketResponse.order_id;
      order.shipmentId = shiprocketResponse.shipment_id;
      
    } catch (shiprocketError) {
      console.error('Shiprocket integration failed after payment:', shiprocketError);
      // Don't fail the payment verification, just log the error
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// New function to track order
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    let trackingInfo = {
      order: order,
      tracking: null
    };

    // If order has shipment ID, get tracking info from Shiprocket
    if (order.shipmentId) {
      try {
        const shiprocketTracking = await trackShiprocketOrder(order.shipmentId);
        trackingInfo.tracking = shiprocketTracking;
      } catch (trackingError) {
        console.error('Failed to get tracking info:', trackingError);
        trackingInfo.tracking = { error: 'Tracking information temporarily unavailable' };
      }
    }

    res.status(200).json({
      success: true,
      data: trackingInfo,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Update order status (for admin/seller)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
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
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
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