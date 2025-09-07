/**
 * Super Simple Image Service - No processing, just direct loading
 * Focus on speed - images load directly from Cloudinary without any modifications
 */

// No complex processing - just direct image loading
// This service is now just a placeholder since we removed all complex logic
const imageService = {
  // Simple function that just returns the URL as-is
  getDirectUrl(url) {
    return url;
  },
  
  // Simple preload function
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
  }
};

/**
 * Enhanced Image Service with Caching - Focused on Featured Products
 * Implements client-side caching for featured product images
 */

// Image cache for featured products
const imageCache = {
  featured: new Map(),
  getCached(url, type = 'featured') {
    if (this[type] && this[type].has(url)) {
      const cached = this[type].get(url);
      // Check if cache is still valid (10 minutes for featured products)
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
        return cached.dataUrl;
      }
      // Cache expired, remove it
      this[type].delete(url);
    }
    return null;
  },
  setCached(url, dataUrl, type = 'featured') {
    if (this[type]) {
      this[type].set(url, {
        dataUrl,
        timestamp: Date.now()
      });
    }
  },
  preloadAndCache(url, type = 'featured') {
    // Skip if already cached
    if (this.getCached(url, type)) return Promise.resolve(this.getCached(url, type));
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS for canvas operations
      img.onload = () => {
        try {
          // Create canvas to get data URL
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          // Get data URL and cache it
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          this.setCached(url, dataUrl, type);
          resolve(dataUrl);
        } catch (e) {
          // Fallback to original URL if canvas operations fail
          console.warn('Image caching failed, using original URL', e);
          resolve(url);
        }
      };
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        reject(url);
      };
      img.src = url;
    });
  }
};

class ImageOptimizationService {
  constructor() {
    this.cache = imageCache;
    this.userRole = null;
  }
  
  // Set user role to determine if caching should be enabled
  setUserRole(role) {
    this.userRole = role;
  }
  
  // Check if caching should be enabled (only for non-admin users)
  shouldCache() {
    return this.userRole !== 'admin';
  }

  preloadCriticalImages(images) {
    if (!images || !Array.isArray(images)) return;
    
    images.filter(Boolean).forEach(imageUrl => {
      if (typeof window !== 'undefined') {
        // Only cache for non-admin users
        if (this.shouldCache()) {
          this.cache.preloadAndCache(imageUrl, 'featured')
            .then(() => {
            })
            .catch(() => {});
        } else {
          
        }
          
        // Still add preload link for browsers that support it
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = this.optimizeImageUrl(imageUrl, {
          quality: 'high',
          width: 1200
        });
        document.head.appendChild(link);
      }
    });
  }

  optimizeImageUrl(url, { quality = 'auto', width, height, context = 'default' } = {}) {
    if (!url) return '';
    
    // Only use cache for featured product images and non-admin users
    if (context === 'featured' && this.shouldCache()) {
      const cached = this.cache.getCached(url, 'featured');
      if (cached) return cached;
      
      // If not cached yet, trigger caching in background
      this.cache.preloadAndCache(url, 'featured')
        .catch(() => {});
    }
    
    // Return original URL if no caching or while caching in progress
    return url;
  }
  
  // Get cached version or original
  getOptimizedImageUrl(url, context = 'default') {
    if (context === 'featured' && this.shouldCache()) {
      return this.cache.getCached(url, 'featured') || url;
    }
    return url;
  }
}

export default new ImageOptimizationService();
