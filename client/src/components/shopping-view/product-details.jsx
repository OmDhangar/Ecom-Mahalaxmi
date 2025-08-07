import { StarIcon, ChevronLeft, ChevronRight, ImageIcon, X, Share, Heart } from "lucide-react";
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

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  
  // Combine main image with additional images for the carousel
  const allProductImages = productDetails ? 
    [productDetails.image, ...(productDetails.additionalImages || []).filter((img) => img !== productDetails.image)] : [];

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    console.log(getRating, "getRating");
    setRating(getRating);
  }

  console.log("product details", productDetails);

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
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
          title: "Product is added to cart",
        });
      }
    });
  }

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

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  console.log(productDetails, "reviews");

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="p-0 max-w-full h-full sm:max-w-4xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg overflow-hidden">
        <DialogTitle className="sr-only">
          {productDetails?.title || "Product Details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Detailed view and reviews for {productDetails?.title}
        </DialogDescription>
        
        {/* Mobile Header */}
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

        <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-6 sm:p-6">
          {/* Product Images Section */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-gray-50">
              {allProductImages.length > 0 ? (
                <img
                  src={allProductImages[currentImageIndex]}
                  alt={`${productDetails?.title} - Image ${currentImageIndex + 1}`}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
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
              <div className="flex justify-center gap-2 mt-4 sm:hidden">
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
          <div className="flex-1 p-4 sm:p-0">
            {/* Product Title & Description */}
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
                {productDetails?.title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {productDetails?.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <StarRatingComponent rating={averageReview} />
                <span className="text-sm font-medium">
                  {averageReview.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                {productDetails?.salePrice > 0 ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-bold text-green-600">
                      ₹{productDetails?.salePrice}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{productDetails?.price}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {Math.round(((productDetails?.price - productDetails?.salePrice) / productDetails?.price) * 100)}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
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
            <div className="mb-6">
              {productDetails?.totalStock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">
                    In Stock ({productDetails?.totalStock} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="mb-6">
              {productDetails?.totalStock === 0 ? (
                <Button className="w-full py-3 text-base bg-gray-400 cursor-not-allowed" disabled>
                  Out of Stock
                </Button>
              ) : (
                <Button
                  className="w-full py-3 text-base bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  onClick={() =>
                    handleAddToCart(
                      productDetails?._id,
                      productDetails?.totalStock
                    )
                  }
                >
                  Add to Cart
                </Button>
              )}
            </div>

            <Separator className="my-6" />

            {/* Reviews Section */}
            <div>
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
              <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-4">
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
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;