import { Star } from "lucide-react";
import { Badge } from "../ui/badge";
import OptimizedImage from "../ui/OptimizedImage";
import { cn } from "@/lib/utils";

/**
 * Unified ProductCard Component for SHOP.CO
 * Used in "New Arrivals", "Top Selling", and search results
 * 
 * Features:
 * - Star ratings with numeric value (e.g., 4.5/5)
 * - Strikethrough pricing
 * - Red rounded-pill discount badge (e.g., -30%)
 * - SHOP.CO styling: bg-[#F0F0F0], rounded-2xl
 */
function ProductCard({
  product,
  onProductClick,
  onAddToCart,
  className,
  showAddToCart = false,
}) {
  const discount =
    product?.salePrice > 0
      ? Math.round(((product?.price - product?.salePrice) / product?.price) * 100)
      : 0;

  const rating = product?.rating || product?.averageReview || 0;
  const reviewCount = product?.reviews || 0;

  const handleImageClick = () => {
    if (onProductClick) {
      onProductClick(product?._id || product?._id);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product?._id || product?._id, product?.totalStock);
    }
  };

  return (
    <div
      className={cn(
        "bg-[#F0F0F0] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={handleImageClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-white">
        <OptimizedImage
          src={product?.image || product?.mainImage}
          alt={product?.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          width={400}
          height={400}
          loading="lazy"
          context="card"
          quality="medium"
        />

        {/* Discount Badge - Top Left */}
        {discount > 0 && (
          <Badge
            className="absolute top-2 left-2 bg-[#FF3333] text-white text-xs font-bold px-2 py-1 rounded-full"
          >
            -{discount}%
          </Badge>
        )}

        {/* Out of Stock Badge */}
        {product?.totalStock === 0 && (
          <Badge className="absolute top-2 right-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full">
            Out of Stock
          </Badge>
        )}

        {/* Bestseller Badge */}
        {product?.isBestseller && (
          <Badge className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
            Bestseller
          </Badge>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < rating
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-[#00000099] ml-1">
              {rating.toFixed(1)}/5
            </span>
            {reviewCount > 0 && (
              <span className="text-sm text-[#00000099]">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-base text-black mb-2 line-clamp-2 leading-tight uppercase">
          {product?.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {product?.salePrice > 0 ? (
            <>
              <span className="text-xl font-bold text-black">
                ${product?.salePrice}
              </span>
              <span className="text-base text-[#00000099] line-through">
                ${product?.price}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-black">
              ${product?.price}
            </span>
          )}
        </div>

        {/* Add to Cart Button (optional) */}
        {showAddToCart && product?.totalStock > 0 && (
          <button
            onClick={handleAddToCartClick}
            className="mt-3 w-full bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
