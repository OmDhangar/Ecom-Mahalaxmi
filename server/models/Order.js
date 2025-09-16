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
      size: String, // Size for fashion products
      color: String, // Color for toy products
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
      "shipping_failed",
      "shipped",
      "delivered",
      "cancelled",
      "returned", 
    ],
    default: "pending"
  },
  shippingStatus: {
    type: String,
    enum: ["not_booked","pending", "pending_manual", "booked", "in_transit", "delivered", "failed", "cancelled"],
    default: "not_booked"
  },
  shippingErrorHistory: [
    {
      message: String,
      details: Object,
      date: { type: Date, default: Date.now },
      attemptNumber: Number
    }
  ],
  needsManualShipment: { type: Boolean, default: false },
  needsRefund: { type: Boolean, default: false },
  pricingSnapshot: {
    currency: { type: String, default: "INR" },
    subTotal: Number,
    shippingCharges: Number,
    tax: Number,
    discount: Number,
    totalAmount: Number
  },
  checkoutStep: {
    type: String,
    enum: [
      "cart_created",
      "address_confirmed",
      "payment_initiated",
      "payment_success_pending_shipment",
      "shipment_booked",
      "completed",
      "failed"
    ],
    default: "cart_created"
  },
  paymentGatewayResponse: { type: Object },
  shippingApiResponse: { type: Object },

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
  shiprocketData: Object, // Store prepared data for manual Shiprocket entry
  
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
OrderSchema.index({ shippingStatus: 1 });
OrderSchema.index({ paymentMethod: 1 });
OrderSchema.index({ checkoutStep: 1 });


module.exports = mongoose.model("Order", OrderSchema);
