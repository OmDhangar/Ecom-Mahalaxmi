/**
 * Image Optimization Service
 * Reduces Cloudinary bandwidth through intelligent caching and optimization
 */

class ImageOptimizationService {
  constructor() {
    this.cache = new Map();
    this.preloadedImages = new Set();
    this.compressionLevels = {
      low: { quality: 60, format: 'webp' },
      medium: { quality: 75, format: 'webp' }, 
      high: { quality: 85, format: 'webp' },
      original: { quality: 'auto', format: 'auto' }
    };
    
    // Cleanup interval to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000); // 5 minutes
  }

  /**
   * Generate optimized Cloudinary URL based on context and device
   */
  getOptimizedUrl(originalUrl, options = {}) {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return originalUrl; // Return as-is if not a Cloudinary URL
    }

    const {
      width = null,
      height = null,
      quality = 'medium',
      priority = false,
      context = 'general' // 'thumbnail', 'card', 'hero', 'detail', 'general'
    } = options;

    // Get device-specific optimization
    const deviceOptimization = this.getDeviceOptimization();
    const contextOptimization = this.getContextOptimization(context);
    
    // Combine optimizations
    const finalQuality = priority ? 'high' : quality;
    const compressionSettings = this.compressionLevels[finalQuality];
    
    // Build transformation string
    let transformations = [];
    
    // Format and quality
    transformations.push(`f_${compressionSettings.format}`);
    if (compressionSettings.quality !== 'auto') {
      transformations.push(`q_${compressionSettings.quality}`);
    } else {
      transformations.push('q_auto:eco');
    }
    
    // Dimensions
    if (width || contextOptimization.width) {
      transformations.push(`w_${width || contextOptimization.width}`);
    }
    if (height || contextOptimization.height) {
      transformations.push(`h_${height || contextOptimization.height}`);
    }
    
    // Device optimization
    if (deviceOptimization.dpr > 1) {
      transformations.push(`dpr_${deviceOptimization.dpr}`);
    }
    
    // Context-specific optimizations
    if (contextOptimization.crop) {
      transformations.push(`c_${contextOptimization.crop}`);
    }
    if (contextOptimization.gravity) {
      transformations.push(`g_${contextOptimization.gravity}`);
    }
    
    // Apply transformations to URL
    const optimizedUrl = this.applyTransformations(originalUrl, transformations);
    
    // Cache the optimization
    this.cache.set(originalUrl, { 
      optimizedUrl, 
      timestamp: Date.now(),
      options: { ...options, deviceOptimization, contextOptimization }
    });
    
    return optimizedUrl;
  }

  /**
   * Get device-specific optimization settings
   */
  getDeviceOptimization() {
    const dpr = window.devicePixelRatio || 1;
    const connection = navigator.connection;
    
    // Reduce quality for slow connections
    let qualityMultiplier = 1;
    if (connection) {
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        qualityMultiplier = 0.6;
      } else if (connection.effectiveType === '3g') {
        qualityMultiplier = 0.8;
      }
    }
    
    return {
      dpr: Math.min(dpr, 2), // Cap at 2x for bandwidth savings
      qualityMultiplier,
      isSlowConnection: connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')
    };
  }

  /**
   * Get context-specific optimization settings
   */
  getContextOptimization(context) {
    const optimizations = {
      thumbnail: {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'auto'
      },
      card: {
        width: 400,
        height: 300,
        crop: 'fit',
        gravity: 'auto'
      },
      hero: {
        width: 1200,
        height: 600,
        crop: 'fill',
        gravity: 'auto'
      },
      carousel: {
        width: 800,
        height: 500,
        crop: 'fill',
        gravity: 'auto'
      },
      detail: {
        width: 800,
        height: 800,
        crop: 'fit',
        gravity: 'auto'
      },
      general: {}
    };
    
    return optimizations[context] || optimizations.general;
  }

  /**
   * Apply transformations to Cloudinary URL
   */
  applyTransformations(url, transformations) {
    if (transformations.length === 0) return url;
    
    const transformStr = transformations.join(',');
    
    // Insert transformations into Cloudinary URL
    return url.replace(
      /(\/image\/upload\/)/,
      `$1${transformStr}/`
    );
  }

  /**
   * Preload critical images
   */
  preloadImage(url, options = {}) {
    const optimizedUrl = this.getOptimizedUrl(url, { ...options, priority: true });
    
    if (this.preloadedImages.has(optimizedUrl)) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(optimizedUrl);
        console.log(`Preloaded image: ${optimizedUrl}`);
        resolve();
      };
      img.onerror = reject;
      img.src = optimizedUrl;
    });
  }

  /**
   * Batch preload images
   */
  async preloadImages(urls, options = {}) {
    const promises = urls.map(url => this.preloadImage(url, options));
    try {
      await Promise.allSettled(promises);
      console.log(`Batch preloaded ${urls.length} images`);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(originalUrl, breakpoints = [480, 768, 1024, 1280, 1920]) {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return '';
    }

    return breakpoints
      .map(width => {
        const optimizedUrl = this.getOptimizedUrl(originalUrl, { 
          width,
          context: 'general'
        });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Check if image is already cached
   */
  isCached(url) {
    const cached = this.cache.get(url);
    if (!cached) return false;
    
    // Check if cache is still valid (30 minutes)
    const isValid = (Date.now() - cached.timestamp) < 1800000;
    if (!isValid) {
      this.cache.delete(url);
      return false;
    }
    
    return true;
  }

  /**
   * Get cached optimized URL
   */
  getCached(url) {
    const cached = this.cache.get(url);
    return cached ? cached.optimizedUrl : null;
  }

  /**
   * Cleanup old cache entries
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 1800000; // 30 minutes
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    console.log(`Image cache cleanup: ${this.cache.size} entries remaining`);
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    this.preloadedImages.clear();
    console.log('Image cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      preloadedImages: this.preloadedImages.size,
      memoryUsage: this.cache.size * 100 // Rough estimate in bytes
    };
  }

  /**
   * Destroy service and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearCache();
  }
}

// Create singleton instance
const imageOptimizationService = new ImageOptimizationService();

export default imageOptimizationService;
