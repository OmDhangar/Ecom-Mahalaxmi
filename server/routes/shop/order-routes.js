const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  verifyPayment,
  trackOrder,
  updateOrderStatus,
  getShiprocketChannels,
  getOrderShiprocketData
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({ success: true, message: "Order API is working!" });
});
router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

router.get('/track/:orderId',trackOrder);
router.put('/update-status/:orderId',updateOrderStatus);
router.get('/shiprocket/channels', getShiprocketChannels);
router.get('/:orderId/shiprocket-data', getOrderShiprocketData);

module.exports = router;
