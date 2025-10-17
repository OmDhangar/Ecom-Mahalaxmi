import { Button } from "@/components/ui/button";
import {
  ShirtIcon,
  BabyIcon,
  Smartphone,
  ChevronLeftIcon,
  ChevronRightIcon,
  Crop,
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
import imageOptimizationService from '@/services/imageOptimizationService';

// Custom components
import SocialUpdates from "@/components/ui/SocialUpdates";
import CustomerTestimonials from "@/components/ui/CustomerTestimonials";
import OfferCarousel from "@/components/ui/OfferCarousel";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { Helmet } from "react-helmet";
import { useBackNavigation, useBrowserBackButton } from "@/hooks/useBackNavigation";

// i18n
import { useTranslation } from "react-i18next";

const categoriesWithIcon = [
  { id: "electronics", label: "Electronics", icon: Smartphone },
  { id: "fashion", label: "Fashion", icon: ShirtIcon },
  { id: "toys", label: "Toys", icon: BabyIcon },
  { id: "farming", label: "Farming", icon: Crop },
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
  
  // Initialize back navigation for home page
  const { clearNavigationHistory } = useBackNavigation('/');
  
  // Handle browser/phone back button for home page
  useBrowserBackButton('/');

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, currentProduct = null) {
    if (
      currentProduct &&
      currentProduct.category === "fashion" &&
      currentProduct.sizes &&
      currentProduct.sizes.length > 0
    ) {
      toast({
        title: "Size Selection Required",
        description:
          "Please select a size for fashion items from the product details page.",
        variant: "destructive",
      });
      return;
    }

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
      setCurrentSlide(
        (prevSlide) => (prevSlide + 1) % featureImageList.length
      );
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

  const { featuredList } = useSelector((state) => state.shopProducts);
  console.log("dfgh",featuredList)

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    // Preload critical images
    imageOptimizationService.preloadCriticalImages([
      // Add your hero/carousel first slide
      featureImageList[0]?.image,
      // Add first 4 product images (using mainImage from backend response)
      ...featuredList.slice(0, 4).map(p => p.mainImage).filter(Boolean)
    ]);
  }, [featureImageList, featuredList]);

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          Shri Mahalaxmi Mobile | Premium Mobiles & Accessories by Bhushan
          Rajput
        </title>
        <meta
          name="description"
          content="Shop the latest mobiles, premium smartphones, and accessories online at Shri Mahalaxmi Mobile. Trusted by 240k+ Instagram followers of Bhushan Rajput. Exclusive deals, fast delivery & genuine products."
        />
        <meta
          name="keywords"
          content="buy mobiles online, smartphones India, iPhone deals Shirpur, Samsung Galaxy sale India, premium mobile shop Shirpur, mobile accessories India, Bhushan Rajput, Instagram exclusive offers, trusted mobile store Shirpur,Maharashtra"
        />
        <meta
          property="og:title"
          content="Shri Mahalaxmi Mobile - Trusted by 240k+ Followers"
        />
        <meta
          property="og:description"
          content="Exclusive mobile deals & genuine products. Shop premium mobiles trusted by Bhushan Rajput’s 240k Instagram followers."
        />
        <meta
          property="og:image"
          content="/src/OfferCarousel_Image/Iphone.png"
        />
        <meta
          property="og:url"
          content="https://www.shrimahalaxmimobile.in"
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* OFFER CAROUSEL */}
      <OfferCarousel />

      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 py-8 lg:py-12 px-4 sm:px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto">
          <div className="text-center lg:text-left w-full lg:max-w-xl">
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight text-gray-900">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg text-gray-700 font-medium mb-2">
              {t("home.hero.subtitle")}
            </p>
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              {t("home.hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                onClick={() => {
                  const productsSection =
                    document.getElementById("featured-products-scroll");
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base rounded-xl shadow-lg hover:from-gray-800 hover:to-gray-600 transition-all duration-300"
              >
                {t("home.hero.shopDeals")}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  window.open(
                    "https://www.instagram.com/bhushan_rajput_307",
                    "_blank"
                  );
                }}
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base rounded-xl transition-all duration-300"
              >
                {t("home.hero.followInstagram")}
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex mt-8 lg:mt-0 justify-center">
            <OptimizedImage
              src="Iphone.png"
              alt="Latest Mobiles - Shri Mahalaxmi Mobile premium smartphones"
              className="w-64 h-88 xl:w-80 rounded-xl shadow-lg"
              width={320}
              height={400}
              priority={true}
              context="hero"
              quality="high"
              sizes="(min-width: 1280px) 320px, 256px"
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
                console.log(productItem),
                <div key={productItem._id} className="flex-shrink-0">
                  {/* Custom Square Product Card */}
                  <div className="w-36 sm:w-44 lg:w-52 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300">
                    
                    {/* Square Image Container */}
                    <div className="relative w-full aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      <OptimizedImage
                        src={productItem?.mainImage || ''}
                        alt={`${productItem?.title} - Buy online at Shri Mahalaxmi Mobile`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        width={208}
                        height={208}
                        loading="lazy"
                        context="featured" 
                        quality="medium"
                        sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 208px"
                        onClick={() => handleGetProductDetails(productItem?._id)}
                      />
                      {productItem?.salePrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Sale
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3 flex flex-col h-full">
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

                      {/* View Similar Products Button */}
                      <Button
                        onClick={() => handleNavigateToListingPage(
                          { id: productItem?.category }, "category"
                        )}
                        className="w-full mt-auto bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 text-xs sm:text-sm"
                      >
                        View Similar Products
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

      {/* SOCIAL UPDATES */}
      <section className="py-8 lg:py-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            Trusted by 240k+ Instagram Followers
          </h2>
          <p className="text-sm text-gray-700 max-w-2xl mx-auto">
            Shri Mahalaxmi Mobile is powered by{" "}
            <strong>Bhushan Rajput’s 240k Instagram community</strong>. Get
            exclusive <strong>mobile offers Better than market </strong>{" "}
            updates directly from one of India’s most trusted influencers.
          </p>
          <SocialUpdates />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <CustomerTestimonials />

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;

