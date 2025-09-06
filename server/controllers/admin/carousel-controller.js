const Carousel = require('../../models/Carousel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cacheService = require('../../services/cacheService');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer with CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'carousel-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Helper to delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1];
    const publicId = `carousel-images/${fileName.split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

// ===========================================
// CONTROLLERS
// ===========================================

// Get all carousel slides
const getAllCarouselSlides = async (req, res) => {
  try {
    const slides = await Carousel.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: slides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch carousel slides', error: error.message });
  }
};

// Get active slides for frontend
const getActiveCarouselSlides = async (req, res) => {
  try {
    console.log('Fetching active carousel slides from database');
    
    const slides = await Carousel.find({ isActive: true }).sort({ order: 1 });
    
    console.log(`Found ${slides.length} active carousel slides in database`);
    
    const responseData = { success: true, data: slides };
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active carousel slides', error: error.message });
  }
};

// Create new carousel slide
const createCarouselSlide = async (req, res) => {
  try {
    const { title, subtitle, cta, link, bg, isActive } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    const maxOrderSlide = await Carousel.findOne().sort({ order: -1 });
    const nextOrder = maxOrderSlide ? maxOrderSlide.order + 1 : 1;

    const imageUrl = req.file.path; // CloudinaryStorage automatically returns Cloudinary URL

    const newSlide = new Carousel({
      title,
      subtitle,
      cta,
      image: imageUrl,
      link,
      bg,
      order: nextOrder,
      isActive: isActive === 'true' || isActive === true
    });

    const savedSlide = await newSlide.save();
    
    // Invalidate carousel cache after creation
    cacheService.invalidateRelated('carousel', 'create');
    
    res.status(201).json({ success: true, message: 'Carousel slide created successfully', data: savedSlide });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create carousel slide', error: error.message });
  }
};

// Update carousel slide
const updateCarouselSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSlide = await Carousel.findByIdAndUpdate(
      id, 
      updateData,
      { new: true }
    );

    if (!updatedSlide) {
      return res.status(404).json({
        success: false,
        message: 'Carousel slide not found'
      });
    }

    // Invalidate both carousel and feature related caches
    try {
      cacheService.invalidatePattern('carousel');
      cacheService.invalidatePattern('feature');
    } catch (cacheError) {
      console.warn('Cache invalidation warning:', cacheError);
      // Continue execution even if cache invalidation fails
    }

    res.status(200).json({
      success: true,
      message: 'Carousel slide updated successfully',
      data: updatedSlide
    });

  } catch (error) {
    console.error('Error updating carousel slide:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating carousel slide',
      error: error.message
    });
  }
};

// Delete carousel slide
const deleteCarouselSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await Carousel.findById(id);
    if (!slide) return res.status(404).json({ success: false, message: 'Carousel slide not found' });

    if (slide.image) await deleteFromCloudinary(slide.image);
    await Carousel.findByIdAndDelete(id);

    // Reorder remaining slides
    const remainingSlides = await Carousel.find().sort({ order: 1 });
    for (let i = 0; i < remainingSlides.length; i++) {
      remainingSlides[i].order = i + 1;
      await remainingSlides[i].save();
    }
    
    // Invalidate carousel cache after deletion
    cacheService.invalidateRelated('carousel', 'delete');

    res.status(200).json({ success: true, message: 'Carousel slide deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete carousel slide', error: error.message });
  }
};

// Reorder carousel slides
const reorderCarouselSlides = async (req, res) => {
  try {
    const { slideOrders } = req.body; // Array of { id, order }
    if (!Array.isArray(slideOrders)) return res.status(400).json({ success: false, message: 'slideOrders must be an array' });

    await Promise.all(slideOrders.map(({ id, order }) => Carousel.findByIdAndUpdate(id, { order }, { new: true })));

    const updatedSlides = await Carousel.find().sort({ order: 1 });
    res.status(200).json({ success: true, message: 'Carousel slides reordered successfully', data: updatedSlides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reorder carousel slides', error: error.message });
  }
};

// Export
module.exports = {
  getAllCarouselSlides,
  getActiveCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  reorderCarouselSlides,
  upload
};
