const express = require('express');
const router = express.Router();
const { calculateShippingCharge } = require('../../controllers/shop/calculate-shipping-controller');

// POST /api/shipping/calculate
router.post('/shipping/calculate-shipping', calculateShippingCharge);

module.exports = router;
