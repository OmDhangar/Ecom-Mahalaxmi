import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

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
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px 0px',
    skip: priority // Skip intersection observer if priority is true
  });

  const getOptimizedSrc = () => {
    if (!src) return "";
    
    // Handle full URLs (e.g., Cloudinary)
    if (src.startsWith("http")) {
      return src;
    }
    
    // Handle local images from public folder
    return `/${src}`;
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
          src={getOptimizedSrc()}
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