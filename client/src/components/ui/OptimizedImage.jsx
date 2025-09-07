import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";
import imageOptimizationService from '@/services/imageOptimizationService';

const OptimizedImage = ({
  src,
  alt,
  className,
  priority = false,
  width,
  height,
  quality = "auto",
  loading = "lazy",
  context = "default",
  sizes,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState("");
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px 0px',
    skip: priority // Skip intersection observer if priority is true
  });

  useEffect(() => {
    if (!src) return;
    
    // For featured products, try to get cached version
    if (context === 'featured') {
      const cached = imageOptimizationService.getOptimizedImageUrl(src, 'featured');
      setOptimizedSrc(cached);
    } else {
      // For other images, use the original source
      setOptimizedSrc(getOptimizedSrc(src));
    }
  }, [src, context]);

  const getOptimizedSrc = (url) => {
    if (!url) return "";
    
    // Handle full URLs (e.g., Cloudinary)
    if (url.startsWith("http")) {
      return url;
    }
    
    // Handle local images from public folder
    return `/${url}`;
  };

  return (
    <div 
      ref={!priority ? ref : undefined}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      {(priority || inView) && (
        <img
          src={optimizedSrc || getOptimizedSrc(src)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : loading}
          onLoad={() => setIsLoaded(true)}
          sizes={sizes}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;