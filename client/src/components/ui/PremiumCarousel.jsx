import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-full flex-shrink-0">
              <img src={product.image} alt={product.title} className="w-full h-auto" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-gray-600">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
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