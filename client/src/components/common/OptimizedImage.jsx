import React, { useState, useEffect } from 'react';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  sizes = '100vw',
  objectFit = 'cover',
  cacheTime = '604800', // Default cache time: 1 week in seconds
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Reset loading state when src changes
    if (src) {
      setIsLoading(true);
      
      // Add cache control parameters to the URL
      // This tells browsers to cache the image for the specified time
      const cacheSrc = src.includes('?') 
        ? `${src}&cache=${cacheTime}` 
        : `${src}?cache=${cacheTime}`;
      
      setImageSrc(cacheSrc);
    }
  }, [src, cacheTime]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : 'auto',
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      
      <img
        src={imageSrc}
        alt={alt || 'Image'}
        loading={loading}
        sizes={sizes}
        className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ objectFit }}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        width={width}
        height={height}
        fetchpriority={loading === 'eager' ? 'high' : 'auto'}
      />
    </div>
  );
};

export default OptimizedImage;