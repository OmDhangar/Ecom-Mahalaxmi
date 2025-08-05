const express = require('express');
const { getActiveCarouselSlides } = require('../../controllers/admin/carousel-controller');

const router = express.Router();

// Public route for frontend
router.get('/active', getActiveCarouselSlides);

module.exports = router;