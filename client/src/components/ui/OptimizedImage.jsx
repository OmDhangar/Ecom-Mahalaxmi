import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import imageOptimizationService from '@/services/imageOptimizationService';

/**
 * OptimizedImage component that provides:
 * - WebP format support with fallback
 * - Proper loading attributes for performance
 * - Error handling and lazy loading
 * - Responsive image sizing
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  priority = false,
  sizes,
  context = 'general', // 'thumbnail', 'card', 'hero', 'carousel', 'detail', 'general'
  quality = 'medium', // 'low', 'medium', 'high', 'original'
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [srcSet, setSrcSet] = useState('');

  useEffect(() => {
    if (!src) return;

    // Use the image optimization service
    const optimized = imageOptimizationService.getOptimizedUrl(src, {
      width,
      height,
      quality,
      priority,
      context
    });
    
    setOptimizedSrc(optimized);

    // Generate srcSet for responsive images
    if (src.includes('cloudinary.com')) {
      const responsiveSrcSet = imageOptimizationService.generateSrcSet(src);
      setSrcSet(responsiveSrcSet);
    }

    // Preload if priority
    if (priority) {
      imageOptimizationService.preloadImage(src, {
        width,
        height,
        quality,
        context
      });
    }
  }, [src, width, height, quality, priority, context]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const loadingAttr = priority ? 'eager' : loading;
  const fetchPriorityAttr = priority ? 'high' : 'low';

  if (imageError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div 
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            className
          )}
          style={{ width, height }}
        />
      )}
      
      {/* Main image with WebP support */}
      <picture>
        {/* WebP source for modern browsers */}
        {srcSet && (
          <source
            srcSet={srcSet}
            sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            type="image/webp"
          />
        )}
        
        <img
          src={optimizedSrc || src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={loadingAttr}
          decoding="async"
          fetchPriority={fetchPriorityAttr}
          onError={handleImageError}
          onLoad={handleImageLoad}
          {...props}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;
