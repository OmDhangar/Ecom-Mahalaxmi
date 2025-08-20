import { ChevronLeft, ChevronRight, Image, X, Share, Heart, ShoppingCart, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { WithAuth } from "@/components/common/with-auth";
import SEO from "@/components/common/SEO";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [similarProducts, setSimilarProducts] = useState([]);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { productList } = useSelector((state) => state.shopProducts);
  
  // Combine main image with additional images for the carousel
  const allProductImages = productDetails ? 
    [productDetails.image, ...(productDetails.additionalImages || []).filter((img) => img !== productDetails.image)] : [];

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }


  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems?.items || [];

    // For fashion products with size selection, validate size requirements
    if (productDetails?.category === 'fashion' && productDetails.sizes && productDetails.sizes.length > 0) {
      if (!selectedSize) {
        toast({
          title: "Please select a size first",
          variant: "destructive",
        });
        return;
      }
      
      // Get size-specific stock
      const sizeObj = productDetails.sizes.find(s => s.size === selectedSize);
      const sizeSpecificStock = sizeObj ? sizeObj.stock : 0;
      
      if (sizeSpecificStock === 0) {
        toast({
          title: `Size ${selectedSize} is out of stock`,
          variant: "destructive",
        });
        return;
      }
      
      // Check if this specific product+size combination already exists in cart
      if (getCartItems.length) {
        const indexOfCurrentItem = getCartItems.findIndex(
          (item) => item.productId === getCurrentProductId && item.size === selectedSize
        );
        if (indexOfCurrentItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentItem].quantity;
          if (getQuantity + 1 > sizeSpecificStock) {
            toast({
              title: `Only ${sizeSpecificStock} quantity available for size ${selectedSize}`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    } else {
      // For non-fashion products, check total stock
      if (getCartItems.length) {
        const indexOfCurrentItem = getCartItems.findIndex(
          (item) => item.productId === getCurrentProductId
        );
        if (indexOfCurrentItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getTotalStock} quantity available`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }
    
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        size: selectedSize, // Include selected size for fashion items
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  // Get similar products based on category and brand
  useEffect(() => {
    if (productDetails && productList) {
      const similar = productList
        .filter(product => 
          product._id !== productDetails._id && 
          (product.category === productDetails.category || product.brand === productDetails.brand)
        )
        .slice(0, 6); // Limit to 6 similar products
      setSimilarProducts(similar);
    }
  }, [productDetails, productList]);

  // Navigate to the next image in the carousel
  const nextImage = () => {
    if (allProductImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === allProductImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Navigate to the previous image in the carousel
  const prevImage = () => {
    if (allProductImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? allProductImages.length - 1 : prevIndex - 1
      );
    }
  };

  // Go to a specific image by index
  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setCurrentImageIndex(0);
    setShowReviewForm(false);
    setSelectedSize("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        setShowReviewForm(false);
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  // Handle similar product click
  const handleSimilarProductClick = (product) => {
    dispatch(setProductDetails(product));
    setCurrentImageIndex(0);
    setSelectedSize("");
  };

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);


  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  // Get condition badge color
  const getConditionBadgeVariant = (condition) => {
    switch(condition) {
      case 'new': return 'default';
      case 'refurbished': return 'secondary';
      case 'second-hand': return 'outline';
      default: return 'default';
    }
  };

  // Get battery health color
  const getBatteryHealthColor = (health) => {
    if (!health) return 'text-gray-500';
    const healthLower = health.toLowerCase();
    if (healthLower.includes('excellent') || healthLower.includes('100%') || healthLower.includes('good')) {
      return 'text-green-600';
    }
    if (healthLower.includes('fair') || healthLower.includes('average')) {
      return 'text-yellow-600';
    }
    if (healthLower.includes('poor') || healthLower.includes('bad')) {
      return 'text-red-600';
    }
    return 'text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="p-0 max-w-full h-full sm:max-w-7xl sm:h-auto sm:max-h-[95vh] sm:rounded-xl overflow-scroll bg-white">
        <DialogTitle className="sr-only">
          {productDetails?.title || "Product Details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Detailed view and reviews for {productDetails?.title}
        </DialogDescription>
        
        {/* Mobile Header - Fixed at top */}
        <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between sm:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDialogClose}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Share className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDialogClose}
          className="hidden sm:block absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Main Content Container - Scrollable on mobile */}
        <div className="flex flex-col h-full overflow-y-auto sm:h-auto ">
          <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-6 sm:p-6">
            {/* Product Images Section */}
            <div className="relative flex-shrink-0">
              {/* Main Image */}
              <div className="relative aspect-square w-full bg-gray-50 sm:aspect-square">
                {allProductImages.length > 0 ? (
                  <img
                    src={allProductImages[currentImageIndex]}
                    alt={`${productDetails?.title} - Image ${currentImageIndex + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                    <Image className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Navigation arrows - only show if there are multiple images */}
                {allProductImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {allProductImages.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Navigation - Only on Desktop */}
              {allProductImages.length > 1 && (
                <div className="hidden sm:flex gap-2 mt-4 overflow-x-auto pb-2">
                  {allProductImages.map((imgSrc, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                        currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={imgSrc} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Mobile Thumbnail Dots */}
              {allProductImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-3 pb-3 sm:hidden">
                  {allProductImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentImageIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="flex-1 p-6 sm:p-0 min-h-0 bg-white/70 sm:bg-transparent rounded-xl sm:rounded-none backdrop-blur-sm">
              {/* Premium Brand Badge */}
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200/50 mb-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-xs font-medium text-amber-800 uppercase tracking-wide">
                    {productDetails?.brand} • {productDetails?.category}
                  </span>
                </div>
              </div>
              
              {/* Product Title & Description */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-3 tracking-tight">
                  {productDetails?.title}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
                  {productDetails?.description}
                </p>
              </div>

             {/* Premium Rating Section */}
              <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-yellow-100/50">
                {/* Rating */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <StarRatingComponent rating={averageReview} />
                  <span className="text-base sm:text-lg font-bold text-amber-800">
                    {averageReview.toFixed(1)}
                  </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-4 w-px bg-amber-200"></div>

                {/* Reviews */}
                <div className="flex flex-col items-end">
                  <span className="text-xs sm:text-sm font-medium text-amber-700">
                    {reviews?.length || 0} Reviews
                  </span>
                  <span className="text-[10px] sm:text-xs text-amber-600">
                    Verified Customers
                  </span>
                </div>
              </div>




              {/* Category-specific Fields */}
              {productDetails?.category === 'electronics' && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Device Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {productDetails.batteryHealth && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Battery Health</Label>
                        <p className={`text-sm font-medium ${getBatteryHealthColor(productDetails.batteryHealth)}`}>
                          {productDetails.batteryHealth}
                        </p>
                      </div>
                    )}
                    {productDetails.condition && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Condition</Label>
                        <div className="mt-1">
                          <Badge variant={getConditionBadgeVariant(productDetails.condition)} className="text-xs">
                            {productDetails.condition.charAt(0).toUpperCase() + productDetails.condition.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {productDetails?.category === 'fashion' && productDetails.sizes && productDetails.sizes.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    Available Sizes
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {productDetails.sizes.map(sizeObj => (
                      <button
                        key={sizeObj.size}
                        onClick={() => setSelectedSize(selectedSize === sizeObj.size ? "" : sizeObj.size)}
                        disabled={sizeObj.stock === 0}
                        className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors relative ${
                          selectedSize === sizeObj.size
                            ? 'bg-pink-500 text-white border-pink-500'
                            : sizeObj.stock === 0
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300'
                        }`}
                      >
                        {sizeObj.size}
                        {sizeObj.stock === 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Selected size display */}
                  {selectedSize && (
                    <div className="mt-2">
                      <p className="text-sm text-pink-600">Selected: {selectedSize}</p>
                    </div>
                  )}
                </div>
              )}


              {/* Price Section */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-baseline gap-3">
                  {productDetails?.salePrice > 0 ? (
                    <>
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                        ₹{productDetails?.salePrice}
                      </span>
                      <span className="text-base sm:text-lg text-gray-500 line-through">
                        ₹{productDetails?.price}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {Math.round(((productDetails?.price - productDetails?.salePrice) / productDetails?.price) * 100)}% OFF
                      </Badge>
                    </>
                  ) : (
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      ₹{productDetails?.price}
                    </span>
                  )}
                </div>
                {productDetails?.salePrice > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    You save ₹{productDetails?.price - productDetails?.salePrice}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4 sm:mb-6">
                {productDetails?.totalStock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

                
              {/* Add to Cart Button */}
              <div className="mb-4 sm:mb-6 sticky bottom-4 sm:static bg-white sm:bg-transparent p-0 sm:p-0 z-10">
                {productDetails?.totalStock === 0 ? (
                  <Button className="w-full py-3 text-base bg-gray-400 cursor-not-allowed" disabled>
                    Out of Stock
                  </Button>
                ) : (
                  <WithAuth
                    onAction={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
                  >
                    {(handleAuthAction) => (
                  <Button
                    className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg sm:shadow-none"
                    onClick={handleAuthAction}
                    disabled={productDetails?.category === 'fashion' && productDetails.sizes && productDetails.sizes.length > 0 && !selectedSize}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {productDetails?.category === 'fashion' && productDetails.sizes && productDetails.sizes.length > 0 && !selectedSize
                      ? 'Select Size First'
                      : 'Add to Cart'
                    }
                  </Button>
                  )}
                  </WithAuth>
                )}
              </div>

              <Separator className="my-4 sm:my-6" />

              {/* Reviews Section */}
              <div className="pb-4 sm:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">Customer Reviews</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-sm"
                  >
                    Write Review
                  </Button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <Label className="text-sm font-medium mb-2 block">Rate this product</Label>
                    <div className="flex gap-1 mb-3">
                      <StarRatingComponent
                        rating={rating}
                        handleRatingChange={handleRatingChange}
                      />
                    </div>
                    <Input
                      name="reviewMsg"
                      value={reviewMsg}
                      onChange={(event) => setReviewMsg(event.target.value)}
                      placeholder="Share your experience with this product..."
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddReview}
                        disabled={reviewMsg.trim() === "" || rating === 0}
                        size="sm"
                        className="flex-1"
                      >
                        Submit Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto space-y-4">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((reviewItem, index) => (
                      <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0">
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                            {reviewItem?.userName[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {reviewItem?.userName}
                            </h4>
                          </div>
                          <div className="flex items-center gap-0.5 mb-2">
                            <StarRatingComponent rating={reviewItem?.reviewValue} />
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {reviewItem.reviewMessage}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="border-t bg-gray-50 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Similar Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {similarProducts.map((product) => (
                  <Card 
                    key={product._id} 
                    className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                    onClick={() => handleSimilarProductClick(product)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.averageReview || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.averageReview?.toFixed(1) || '0.0'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.salePrice > 0 ? (
                          <>
                            <span className="text-sm font-bold text-green-600">
                              ₹{product.salePrice}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              ₹{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                      {product.category && (
                        <Badge variant="outline" className="text-xs mt-2">
                          {product.category}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;