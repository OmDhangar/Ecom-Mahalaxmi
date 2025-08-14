const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
  deleteImageFromCloudinary,
  updateStock,
  getSizeStock
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);
router.post("/delete-image", deleteImageFromCloudinary);
// Stock management routes
router.put("/update-stock/:id", updateStock);
router.get("/stock/:id", getSizeStock);

module.exports = router;
