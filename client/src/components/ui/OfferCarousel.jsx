import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { fetchActiveCarouselSlides, forceFreshFetch } from "@/store/shop/carousel-slice";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function OfferCarousel() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeSlides, isLoading, error } = useSelector(
    (state) => state.shopCarousel
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  const textColorMap = {
    "from-blue-500 to-indigo-500": "white",
    "from-pink-500 to-rose-500": "white",
    "from-yellow-400 to-orange-400": "black",
    "from-green-500 to-emerald-500": "white",
    "from-purple-500 to-violet-500": "white",
    "from-red-500 to-pink-500": "white",
    "from-orange-500 to-pink-500": "white",
    "from-fuchsia-500 to-yellow-400": "black",
    "from-rose-500 to-purple-600": "white",
    "from-teal-500 to-lime-400": "black",
    "from-amber-400 to-red-500": "white",
    "from-indigo-500 to-pink-500": "white",
    "from-green-500 to-yellow-400": "black",
    "from-cyan-400 to-violet-500": "white",
    "from-orange-500 via-white to-green-500": "black",
  };

  useEffect(() => {
    console.log('OfferCarousel: Dispatching fetchActiveCarouselSlides');
    dispatch(fetchActiveCarouselSlides());
  }, [dispatch]);

  // Add debugging to see the state changes
  useEffect(() => {
    console.log('OfferCarousel state update:', {
      activeSlides: activeSlides ? activeSlides.length : 'undefined',
      isLoading,
      error
    });
  }, [activeSlides, isLoading, error]);

  useEffect(() => {
    if (activeSlides && activeSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeSlides]);

  useEffect(() => {
    if (activeSlides && currentSlide >= activeSlides.length && activeSlides.length > 0) {
      setCurrentSlide(0);
    }
  }, [activeSlides, currentSlide]);

  const prevSlide = () => {
    if (activeSlides && activeSlides.length > 0) {
      setCurrentSlide(
        (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
      );
    }
  };

  const nextSlide = () => {
    if (activeSlides && activeSlides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading carousel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
        <div className="text-white text-center px-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to Shri Mahalaxmi Mobile</h1>
          <p className="text-lg mb-6">Your trusted mobile store with exclusive deals</p>
          <p className="text-sm opacity-75">Carousel temporarily unavailable</p>
        </div>
      </div>
    );
  }

  if (!isLoading && (!activeSlides || activeSlides.length === 0)) {
    return (
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg flex items-center justify-center">
        <div className="text-white text-center px-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Shri Mahalaxmi Mobile</h1>
          <p className="text-lg mb-2">Premium mobiles and accessories</p>
          <p className="text-sm opacity-75 mb-4">No offers available right now</p>
          <Button
            onClick={() => {
              console.log('Forcing fresh carousel fetch');
              dispatch(forceFreshFetch());
              setTimeout(() => dispatch(fetchActiveCarouselSlides()), 100);
            }}
            className="bg-white text-gray-800 hover:bg-gray-200 font-semibold px-4 py-2"
          >
            Refresh Offers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden rounded-lg">
      {activeSlides && activeSlides.map((slide, index) => {
        const textColor = textColorMap[slide.bg] || "white";
        const textColorClass = textColor === "white" ? "text-white" : "text-black";
        const buttonClass =
          textColor === "white"
            ? "bg-white text-gray-800 hover:bg-gray-200"
            : "bg-white text-gray-800 hover:bg-gray-200";

        return (
          <div
            key={slide._id}
            className={`absolute top-0 left-0 w-full h-full flex flex-row items-center justify-between transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } bg-gradient-to-r ${slide.bg}`}
          >
            {/* Text Section */}
            <div
              className={`flex-1 flex flex-col justify-center ${textColorClass} px-4 sm:px-8 md:px-16 max-w-[50%] min-w-0`}
              style={{ minWidth: 0 }} // fix flex shrinking issues
            >
              <h1 className="text-xl sm:text-3xl md:text-5xl font-bold mb-3 break-words">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-base md:text-xl mb-5 break-words">
                {slide.subtitle}
              </p>
              <a href={slide.link} className="inline-block">
                <Button
                 className={`${buttonClass} font-semibold px-2 sm:px-6 py-1 sm:py-3 text-xs sm:text-base`}
                >
                  {slide.cta}
                </Button>
              </a>
            </div>

            {/* Image Section */}
            <div className="flex-1 flex justify-center items-center px-6 sm:px-12 md:px-16">
              <OptimizedImage
                src={slide.image}
                alt={`${slide.title} - Exclusive mobile offers at Shri Mahalaxmi Mobile`}
                className="w-full max-w-[180px] sm:max-w-[250px] md:max-w-[380px] h-auto max-h-[420px] rounded-lg shadow-lg object-contain"
                width={180}
                height={100}
                priority={index === 0}
                context="carousel"
                quality={index === 0 ? 'high' : 'medium'}
                sizes="(max-width: 640px) 180px, (max-width: 768px) 250px, 380px"
              />
            </div>
          </div>
        );
      })}

      {/* Controls */}
      {activeSlides && activeSlides.length > 1 && (
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

          {/* Dots */}
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
