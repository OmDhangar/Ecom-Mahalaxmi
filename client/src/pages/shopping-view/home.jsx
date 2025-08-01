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

  // useEffect(() => {
  //   if (featureImageList.length) {
  //     const fetchFeaturedProducts = async () => {
  //       const productIds = featureImageList.map((item) => item.productId);
  //       const uniqueIds = [...new Set(productIds.filter(Boolean))];

  //       const products = await Promise.all(
  //         uniqueIds.map((id) => dispatch(fetchProductDetails(id)))
  //       );

  //       const validProducts = products
  //         .map((res) => res?.payload?.data)
  //         .filter(Boolean);

  //       setFeaturedProducts(validProducts);
  //     };

  //     fetchFeaturedProducts();
  //   }
  // }, [featureImageList, dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* OFFER CAROUSEL */}
      <OfferCarousel />

      {/* HERO SECTION */}
      <div className="bg-gray-50 py-10 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("home.hero.title")}
          </h1>
          <p className="text-lg text-blue-500 font-medium mb-2">
            {t("home.hero.subtitle")}
          </p>
          <p className="text-gray-500 mb-6">
            {t("home.hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-6 py-3">
              {t("home.hero.shopDeals")}
            </Button>
            <Button variant="outline" className="px-6 py-3">
              {t("home.hero.followInstagram")}
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="mt-8 md:mt-0 flex justify-center">
          <img
            src="/src/OfferCarousel_Image/Iphone.png"
            alt="Latest Mobiles"
            className="w-1/2 max-w-sm rounded-xl shadow-md"
          />
        </div>
      </div>

      {/* CATEGORY SECTION */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            {t("home.categories.title")}
          </h2>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="w-[90%] sm:w-[45%] lg:w-72 cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-b from-blue-100 to-cyan-100 text-center"
              >
                <CardContent className="flex flex-col items-center p-6 sm:p-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-4">
                    <categoryItem.icon className="w-10 h-10 sm:w-14 sm:h-14 text-blue-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">
                    {categoryItem.label}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {t("home.categories.latestModels")}
                  </p>
                  <span className="px-4 py-1 rounded-full bg-white text-blue-600 font-semibold text-xs sm:text-sm shadow">
                    500+ Products
                  </span>
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    {t("home.categories.exploreCategory")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* FEATURED PRODUCTS */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("home.featuredProducts.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredList.length > 0 &&
              featuredList.map((productItem) => (
                console.log("productItem",productItem),
                <ShoppingProductTile
                  key={productItem._id}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
          </div>
        </div>
      </section>

      {/* SOCIAL MEDIA UPDATES */}
      <SocialUpdates />

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
