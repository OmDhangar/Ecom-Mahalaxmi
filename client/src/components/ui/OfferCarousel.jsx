import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// Static assets remain outside translations
const slideAssets = [
  {
    image: "/src/OfferCarousel_Image/Iphone.png",
    link: "/shop/listing?category=mobiles",
    bg: "from-blue-500 to-indigo-500"
  },
  {
    image: "/assets/hero-fashion.jpg",
    link: "/shop/listing?category=fashion",
    bg: "from-pink-500 to-rose-500"
  },
  {
    image: "/assets/hero-toys.jpg",
    link: "/shop/listing?category=toys",
    bg: "from-yellow-400 to-orange-400"
  },
  {
    image: "/assets/hero-farming.jpg",
    link: "/shop/listing?category=farming",
    bg: "from-green-500 to-emerald-500"
  }
];

export default function OfferCarousel() {
  const { t } = useTranslation();

  // Fetch translations using proper JSON path
  const translatedSlides = t("home.carousel.slides", { returnObjects: true });

  // Merge static data (image, link, bg) with translated text
  const slides = translatedSlides.map((slide, index) => ({
    ...slide,
    ...slideAssets[index]
  }));

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
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
          <div className="flex-1 flex justify-center items-center">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-[180px] sm:w-[250px] md:w-[400px] h-auto rounded-lg shadow-lg object-contain"
            />
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 w-full flex justify-center gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full cursor-pointer ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
