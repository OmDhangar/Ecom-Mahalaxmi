const Razorpay = require("razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const dotenv = require("dotenv");
const crypto = require("crypto");


dotenv.config();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not set in environment variables');
}
// Initialize Razorpay instance (configure this in your helpers/razorpay.js)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus = "pending",
      paymentMethod = "razorpay",
      paymentStatus = "pending",
      totalAmount,
      cartId,
    } = req.body;

    // Create a new order in your database first
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newlyCreatedOrder.save();

    // Create Razorpay order options
    const options = {
      amount: totalAmount * 100, // Razorpay expects amount in paise (multiply by 100 for INR)
      currency: "INR",
      receipt: `order_${newlyCreatedOrder._id}`,
      payment_capture: 1, // Auto-capture payment
      notes: {
        orderId: newlyCreatedOrder._id.toString(),
        userId: userId
      }
    };

    // Create Razorpay order
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
        key: process.env.RAZORPAY_KEY_ID, // Send Razorpay key to frontend
        amount: options.amount,
        currency: options.currency,
        name: "Your Company Name", // Customize as needed
        description: `Order for ${userId}`,
        prefill: {
          name: addressInfo?.name || "",
          email: addressInfo?.email || "",
          contact: addressInfo?.phone || ""
        },
        theme: {
          color: "#F37254" // Customize as needed
        }
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

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

    // Update the order in your database
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

// Keep these functions the same as they don't involve payment processing
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
  verifyPayment, // Changed from capturePayment to verifyPayment
  getAllOrdersByUser,
  getOrderDetails,
};