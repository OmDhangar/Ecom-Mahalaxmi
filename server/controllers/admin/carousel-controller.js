// ===========================================
// SOLUTION 1: Using cloudinary v1.x (Recommended)
// ===========================================

// First, uninstall current cloudinary and install compatible versions:
// npm uninstall cloudinary multer-storage-cloudinary
// npm install cloudinary@1.41.3 multer-storage-cloudinary@4.0.0 multer

// controllers/admin/carousel-controller.js
const Carousel = require('../../models/Carousel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (add your credentials)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for image upload
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
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
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ===========================================
// SOLUTION 2: Manual Cloudinary Upload (Alternative)
// ===========================================

// If you prefer to use cloudinary v2.x, here's an alternative approach:
// npm install cloudinary@2.7.0 multer

const cloudinaryV2 = require('cloudinary').v2;
const multerDisk = require('multer');
const fs = require('fs').promises;
const path = require('path');

// Configure Cloudinary v2
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use disk storage temporarily
const diskStorage = multerDisk.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const uploadToDisk = multerDisk({ 
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinaryV2.uploader.upload(filePath, {
      folder: 'carousel-images',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });
    
    // Delete temporary file
    await fs.unlink(filePath);
    
    return result.secure_url;
  } catch (error) {
    // Clean up temporary file on error
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
    }
    throw error;
  }
};

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `carousel-images/${filename.split('.')[0]}`;
    
    await cloudinaryV2.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

// ===========================================
// CONTROLLERS (Works with both solutions)
// ===========================================

// Get all carousel slides
const getAllCarouselSlides = async (req, res) => {
  try {
    const slides = await Carousel.find().sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch carousel slides',
      error: error.message
    });
  }
};

// Get active carousel slides for frontend
const getActiveCarouselSlides = async (req, res) => {
  try {
    const slides = await Carousel.find({ isActive: true }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('Error fetching active carousel slides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active carousel slides',
      error: error.message
    });
  }
};

// Create new carousel slide
const createCarouselSlide = async (req, res) => {
  try {
    const { title, subtitle, cta, link, bg, isActive } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Get the next order number
    const maxOrderSlide = await Carousel.findOne().sort({ order: -1 });
    const nextOrder = maxOrderSlide ? maxOrderSlide.order + 1 : 1;

    let imageUrl;
    
    // SOLUTION 1: Direct cloudinary path (if using CloudinaryStorage)
    if (req.file.path) {
      imageUrl = req.file.path;
    } 
    // SOLUTION 2: Manual upload (if using disk storage)
    else if (req.file.filename) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

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

    res.status(201).json({
      success: true,
      message: 'Carousel slide created successfully',
      data: savedSlide
    });
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create carousel slide',
      error: error.message
    });
  }
};

// Update carousel slide
const updateCarouselSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, cta, link, bg, isActive } = req.body;

    const slide = await Carousel.findById(id);
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Carousel slide not found'
      });
    }

    // Update fields
    slide.title = title || slide.title;
    slide.subtitle = subtitle || slide.subtitle;
    slide.cta = cta || slide.cta;
    slide.link = link || slide.link;
    slide.bg = bg || slide.bg;
    slide.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : slide.isActive;

    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (slide.image) {
        await deleteFromCloudinary(slide.image);
      }
      
      // Upload new image
      let imageUrl;
      if (req.file.path && !req.file.filename) {
        // SOLUTION 1: CloudinaryStorage
        imageUrl = req.file.path;
      } else {
        // SOLUTION 2: Manual upload
        imageUrl = await uploadToCloudinary(req.file.path);
      }
      
      slide.image = imageUrl;
    }

    const updatedSlide = await slide.save();

    res.status(200).json({
      success: true,
      message: 'Carousel slide updated successfully',
      data: updatedSlide
    });
  } catch (error) {
    console.error('Error updating carousel slide:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update carousel slide',
      error: error.message
    });
  }
};

// Delete carousel slide
const deleteCarouselSlide = async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await Carousel.findById(id);
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Carousel slide not found'
      });
    }

    // Delete image from Cloudinary
    if (slide.image) {
      await deleteFromCloudinary(slide.image);
    }

    await Carousel.findByIdAndDelete(id);

    // Reorder remaining slides
    const remainingSlides = await Carousel.find().sort({ order: 1 });
    for (let i = 0; i < remainingSlides.length; i++) {
      remainingSlides[i].order = i + 1;
      await remainingSlides[i].save();
    }

    res.status(200).json({
      success: true,
      message: 'Carousel slide deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting carousel slide:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete carousel slide',
      error: error.message
    });
  }
};

// Reorder carousel slides
const reorderCarouselSlides = async (req, res) => {
  try {
    const { slideOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(slideOrders)) {
      return res.status(400).json({
        success: false,
        message: 'slideOrders must be an array'
      });
    }

    // Update order for each slide
    const updatePromises = slideOrders.map(({ id, order }) =>
      Carousel.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    const updatedSlides = await Carousel.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Carousel slides reordered successfully',
      data: updatedSlides
    });
  } catch (error) {
    console.error('Error reordering carousel slides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder carousel slides',
      error: error.message
    });
  }
};

// Export the appropriate upload middleware based on your choice
module.exports = {
  getAllCarouselSlides,
  getActiveCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  reorderCarouselSlides,
  upload: upload || uploadToDisk // Use appropriate upload middleware
};

