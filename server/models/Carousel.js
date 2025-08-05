const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  cta: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  bg: {
    type: String,
    required: true,
    default: 'from-blue-500 to-indigo-500'
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for ordering
carouselSchema.index({ order: 1 });
carouselSchema.index({ isActive: 1 });

module.exports = mongoose.model('Carousel', carouselSchema);
