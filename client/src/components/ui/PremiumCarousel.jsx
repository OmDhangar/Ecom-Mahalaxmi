import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import OptimizedImage from './OptimizedImage';

const PremiumCarousel = ({ products }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + products.length) % products.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [products.length]);

  return (
    <div className="relative">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <OptimizedImage
            src={product.image}
            alt={product.title}
            priority={index === 0} // Only prioritize first slide
            width={120}
            height={600}
            quality={index === currentSlide ? 'high' : 'low'}
            className="w-full h-[60vh] object-cover"
          />
        </div>
      ))}
      <Button onClick={prevSlide} className="absolute left-0 top-1/2 transform -translate-y-1/2">
        <ChevronLeftIcon className="w-6 h-6" />
      </Button>
      <Button onClick={nextSlide} className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <ChevronRightIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default PremiumCarousel;