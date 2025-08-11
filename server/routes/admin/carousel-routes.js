const express = require('express');
const {
  getAllCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  reorderCarouselSlides,
  upload
} = require('../../controllers/admin/carousel-controller');

const router = express.Router();

// Admin routes (protected)
router.get('/', getAllCarouselSlides);
router.post('/', upload.single('image'), createCarouselSlide);
router.put('/:id', upload.single('image'), updateCarouselSlide);
router.delete('/:id', deleteCarouselSlide);
router.put('/reorder', reorderCarouselSlides);

module.exports = router;