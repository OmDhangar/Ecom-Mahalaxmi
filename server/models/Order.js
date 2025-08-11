const mongoose = require("mongoose");

const ShippingErrorSchema = new mongoose.Schema({
  message: { type: String }, // brief error message
  details: { type: Object }, // raw response or error stack
  date: { type: Date, default: Date.now } // when the error happened
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
    },
  ],
  addressInfo: {
    name: String,
    addressId: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String,
    notes: String,
  },
  orderStatus: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "shipping_failed" // ✅ New status for Shiprocket error
    ],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "razorpay"],
    default: "cod",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  orderUpdateDate: {
    type: Date,
    default: Date.now
  },
  // Razorpay fields
  paymentId: String,
  razorpayOrderId: String,
  
  // Shiprocket fields
  shiprocketOrderId: Number,
  shipmentId: Number,
  awbCode: String,
  courierCompanyId: Number,
  courierName: String,
  
  // ✅ Inline Shiprocket error info
  shippingError: {
    message: { type: String },
    details: { type: Object }, // store full API error here
    date: { type: Date }
  },

  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  trackingUrl: String,
  cancellationReason: String,
  returnReason: String,
  
  // Pricing breakdown
  subTotal: Number,
  shippingCharges: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  
  // Notes
  orderNotes: String,
  adminNotes: String,
}, {
  timestamps: true
});

// Index
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ shiprocketOrderId: 1 });

module.exports = mongoose.model("Order", OrderSchema);
