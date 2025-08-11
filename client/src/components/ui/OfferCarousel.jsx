import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { fetchActiveCarouselSlides } from "@/store/shop/carousel-slice";

export default function OfferCarousel() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeSlides, isLoading, error } = useSelector(state => state.shopCarousel);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch active slides on component mount
  useEffect(() => {
    dispatch(fetchActiveCarouselSlides());
  }, [dispatch]);

  // Auto-slide functionality
  useEffect(() => {
    if (activeSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeSlides.length]);

  // Reset current slide if it's out of bounds
  useEffect(() => {
    if (currentSlide >= activeSlides.length && activeSlides.length > 0) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading carousel...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] bg-red-100 rounded-lg flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold mb-2">Failed to load carousel</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state if no slides
  if (!activeSlides || activeSlides.length === 0) {
    return (
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p className="text-lg font-semibold mb-2">No offers available</p>
          <p className="text-sm">Check back later for exciting deals!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden rounded-lg">
      {activeSlides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute top-0 left-0 w-full h-full flex flex-row items-center justify-between transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          } bg-gradient-to-r ${slide.bg}`}
        >
          {/* Text Section */}
          <div className="px-4 sm:px-8 md:px-16 flex-1 flex flex-col justify-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base md:text-xl mb-5">
              {slide.subtitle}
            </p>
            <a href={slide.link}>
              <Button className="bg-white text-gray-800 font-semibold px-4 sm:px-6 py-2 sm:py-3 hover:bg-gray-200 text-sm sm:text-base">
                {slide.cta}
              </Button>
            </a>
          </div>

          {/* Image Section */}
          <div className="flex-1 flex justify-center pt-8 pb-8 items-center">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-[180px]  sm:w-[250px] md:w-[380px] h-[400px] rounded-lg shadow-lg object-contain"
              loading="lazy"
            />
          </div>
        </div>
      ))}

      {/* Controls - Only show if there are multiple slides */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dots - Only show if there are multiple slides */}
          <div className="absolute bottom-3 w-full flex justify-center gap-2">
            {activeSlides.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full cursor-pointer transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}