const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getFeaturedProducts,
  updateAsFeatured
} = require("../../controllers/shop/products-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.post("/:id/feature",updateAsFeatured);
router.get("/featured",getFeaturedProducts);

module.exports = router;
