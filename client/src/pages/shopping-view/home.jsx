import { Button } from "@/components/ui/button";
import {
  ShirtIcon,
  BabyIcon,
  Smartphone,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Crop,
  Shirt,
  WashingMachine,
  ShoppingBasket,
  Airplay,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  fetchFeaturedProducts,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";

// Imported custom components
import SocialUpdates from "@/components/ui/SocialUpdates";
import CustomerTestimonials from "@/components/ui/CustomerTestimonials";
import OfferCarousel from "@/components/ui/OfferCarousel";

// i18n
import { useTranslation } from "react-i18next";

const categoriesWithIcon = [
  { id: "electronics", label: "Electronics", icon: Smartphone },
  { id: "fashion", label: "Fashion", icon: ShirtIcon },
  { id: "toys", label: "Toys", icon: BabyIcon },
  {id:"farming",label:"Farming", icon:Crop}
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

function ShoppingHome() {
  const { t } = useTranslation();

  const [currentSlide, setCurrentSlide] = useState(0);
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: t("cart.productAdded"),
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);
  

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);
  
  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  const { featuredList, isLoading } = useSelector((state) => state.shopProducts);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* OFFER CAROUSEL */}
      <OfferCarousel />

      {/* HERO SECTION - Mobile Optimized */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto">
          {/* Left Content - Mobile First */}
          <div className="text-center lg:text-left w-full lg:max-w-xl">
            {/* Mobile: Smaller, punchier heading */}
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              {t("home.hero.title")}
            </h1>
            <p className="text-sm sm:text-lg text-blue-600 font-medium mb-1 sm:mb-2">
              {t("home.hero.subtitle")}
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              {t("home.hero.description")}
            </p>
            
            {/* Mobile: Stacked buttons, smaller size */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start">
              <Button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base">
                {t("home.hero.shopDeals")}
              </Button>
              <Button variant="outline" className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base">
                {t("home.hero.followInstagram")}
              </Button>
            </div>
          </div>

          {/* Right Image - Hidden on mobile, visible on lg+ */}
          <div className="hidden lg:flex mt-8 lg:mt-0 justify-center">
            <img
              src="/src/OfferCarousel_Image/Iphone.png"
              alt="Latest Mobiles"
              className="w-64 xl:w-80 rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* CATEGORY SECTION - Mobile Optimized */}
      <section className="py-6 sm:py-8 lg:py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Mobile: Smaller heading with better spacing */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-10">
            {t("home.categories.title")}
          </h2>

          {/* Mobile: 2x2 grid, Tablet: 2x2, Desktop: 4 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 bg-gradient-to-b from-blue-50 to-cyan-50 border border-blue-100"
              >
                <CardContent className="flex flex-col items-center p-3 sm:p-4 lg:p-6">
                  {/* Mobile: Smaller icons */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                    <categoryItem.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500" />
                  </div>
                  
                  {/* Mobile: Smaller text */}
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-1 text-center leading-tight">
                    {categoryItem.label}
                  </h3>
                  
                  {/* Mobile: Hide secondary text, show on sm+ */}
                  <p className="hidden sm:block text-gray-600 text-xs lg:text-sm mb-2 lg:mb-3 text-center">
                    {t("home.categories.latestModels")}
                  </p>
                  
                  {/* Mobile: Smaller badge */}
                  <span className="px-2 py-1 sm:px-3 lg:px-4 rounded-full bg-white text-blue-600 font-semibold text-xs shadow-sm">
                    500+
                  </span>
                  
                  {/* Mobile: Hide explore text, show on lg+ */}
                  <p className="hidden lg:block mt-2 text-sm font-medium text-gray-700 text-center">
                    {t("home.categories.exploreCategory")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS - Horizontal Scrollable Grid with Square Cards */}
      <section className="py-6 sm:py-8 lg:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {t("home.featuredProducts.title")}
            </h2>
            <div className="hidden sm:flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="p-2 rounded-full"
                onClick={() => {
                  const container = document.getElementById('featured-products-scroll');
                  container.scrollBy({ left: -200, behavior: 'smooth' });
                }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2 rounded-full"
                onClick={() => {
                  const container = document.getElementById('featured-products-scroll');
                  container.scrollBy({ left: 200, behavior: 'smooth' });
                }}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Horizontal Scrollable Container with Custom Square Cards */}
          <div 
            id="featured-products-scroll"
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {featuredList.length > 0 &&
              featuredList.map((productItem) => (
                <div key={productItem._id} className="flex-shrink-0">
                  {/* Custom Square Product Card */}
                  <div className="w-36 sm:w-44 lg:w-52 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300">
                    {/* Square Image Container */}
                    <div className="relative w-full aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      <img
                        src={productItem?.image}
                        alt={productItem?.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onClick={() => handleGetProductDetails(productItem?._id)}
                      />
                      {/* Sale Badge */}
                      {productItem?.salePrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Sale
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3">
                      <h3 
                        className="font-medium text-sm sm:text-base text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleGetProductDetails(productItem?._id)}
                      >
                        {productItem?.title}
                      </h3>
                      
                      <p className="text-xs text-gray-500 mb-2">
                        {productItem?.category}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        {productItem?.salePrice ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">
                              ₹{productItem?.salePrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{productItem?.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            ₹{productItem?.price}
                          </span>
                        )}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 rounded-md transition-colors duration-300"
                        onClick={() => handleAddtoCart(productItem?._id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Mobile scroll indicator */}
          <div className="flex justify-center mt-4 sm:hidden">
            <p className="text-xs text-gray-500 flex items-center">
              <span className="mr-2">←</span>
              Swipe to see more products
              <span className="ml-2">→</span>
            </p>
          </div>
        </div>
      </section>

      {/* SOCIAL MEDIA UPDATES - Professional & Elegant Design */}
      <section className="py-6 sm:py-8 lg:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Connect with Us
            </h2>
            <p className="text-sm text-gray-600">
              Stay updated with our latest products and exclusive offers
            </p>
          </div>
          
          {/* Professional Social Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            
            {/* Instagram Card - Professional */}
            <div className="group bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-pink-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Instagram</h3>
                    <p className="text-xs text-gray-500">@shreemobile</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Follow us for daily product updates, unboxing videos, and exclusive mobile deals.
              </p>
              
              <Button 
                variant="outline" 
                className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 transition-colors duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow Us
              </Button>
            </div>

            {/* YouTube Card - Professional */}
            <div className="group bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">YouTube</h3>
                    <p className="text-xs text-gray-500">@shreemobile</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Subscribe for detailed mobile reviews, comparisons, and tech updates.
              </p>
              
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Horizontal Scrollable Carousel */}
      <section className="py-6 sm:py-8 lg:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                What Our Family Says
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Real feedback from valued customers
              </p>
            </div>
            <div className="hidden sm:flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                onClick={() => {
                  const container = document.getElementById('testimonials-scroll');
                  container.scrollBy({ left: -320, behavior: 'smooth' });
                }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                onClick={() => {
                  const container = document.getElementById('testimonials-scroll');
                  container.scrollBy({ left: 320, behavior: 'smooth' });
                }}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Horizontal Scrollable Container */}
          <div 
            id="testimonials-scroll"
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {/* Review 1 */}
            <div className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-sm sm:text-base">R</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Rahul Sharma</h4>
                  <p className="text-xs sm:text-sm text-gray-500">iPhone 15 Pro</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "Amazing service! Got my iPhone at the best price with genuine warranty. The delivery was super fast and the phone came in perfect condition. Highly recommended for anyone looking for authentic products!"
              </p>
            </div>

            {/* Review 2 */}
            <div className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-pink-600 font-semibold text-sm sm:text-base">P</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Priya Patel</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Samsung Galaxy S24</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "Transparent pricing and excellent customer service. The team helped me choose the perfect phone according to my budget and needs. Great experience overall and will definitely shop again!"
              </p>
            </div>

            {/* Review 3 */}
            <div className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold text-sm sm:text-base">A</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Amit Kumar</h4>
                  <p className="text-xs sm:text-sm text-gray-500">OnePlus 12</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "Fast delivery and authentic products. I was initially skeptical about buying online but they exceeded my expectations. The phone works perfectly and customer support is responsive!"
              </p>
            </div>

            {/* Review 4 */}
            <div className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold text-sm sm:text-base">S</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Sneha Modi</h4>
                  <p className="text-xs sm:text-sm text-gray-500">iPhone 14</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "Best place to buy mobiles in Mumbai! They have competitive prices and genuine products. The staff is knowledgeable and helped me get the best deal. Absolutely satisfied with my purchase!"
              </p>
            </div>

            {/* Review 5 */}
            <div className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-semibold text-sm sm:text-base">V</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">Vikram Singh</h4>
                  <p className="text-xs sm:text-sm text-gray-500">Xiaomi 14</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">⭐</span>
                ))}
                <span className="text-gray-300 text-sm">⭐</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                "Good service and reasonable prices. The phone I ordered arrived on time and was exactly as described. Only minor issue was with the packaging but the product itself was perfect. Would recommend!"
              </p>
            </div>
          </div>
          
          {/* Mobile scroll indicator */}
          <div className="flex justify-center mt-4 sm:hidden">
            <p className="text-xs text-gray-500 flex items-center">
              <span className="mr-2">👈</span>
              Swipe to read more reviews
              <span className="ml-2">👉</span>
            </p>
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;