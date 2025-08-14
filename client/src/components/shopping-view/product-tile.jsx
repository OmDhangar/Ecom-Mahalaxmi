import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { Star } from "lucide-react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const discount =
    product?.salePrice > 0
      ? Math.round(((product?.price - product?.salePrice) / product?.price) * 100)
      : 0;

  return (
    <Card className="w-full max-w-xs mx-auto overflow-hidden border hover:shadow-lg transition-shadow bg-white rounded-lg">
      {/* Image */}
      <div
        className="relative cursor-pointer"
        onClick={() => handleGetProductDetails(product?._id)}
      >
        <img
          src={product?.image}
          alt={product?.title}
          className="w-full h-[300px] object-cover"
        />

        {/* Top left badge */}
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-2 left-2 bg-red-500">Out Of Stock</Badge>
        ) : product?.totalStock < 10 ? (
          <Badge className="absolute top-2 left-2 bg-orange-500">
            Only {product?.totalStock} left
          </Badge>
        ) : null}

        {/* Bestseller tag example */}
        {product?.isBestseller && (
          <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
            BESTSELLER
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        {/* Rating */}
        {product?.rating && (
          <div className="flex items-center gap-1 text-sm font-medium mb-1">
            <span className="bg-green-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
              {product?.rating} <Star size={14} fill="white" />
            </span>
            <span className="text-gray-500">| {product?.reviews} Reviews</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-gray-800 font-semibold text-sm leading-snug line-clamp-2">
          {brandOptionsMap[product?.brand]} - {product?.title}
        </h3>

        {/* Price */}
        <div className="mt-1 flex items-center gap-2">
          {product?.salePrice > 0 && (
            <span className="text-lg font-bold text-gray-800">
              ₹{product?.salePrice}
            </span>
          )}
          <span
            className={`text-sm ${
              product?.salePrice > 0 ? "line-through text-gray-500" : "text-gray-800 font-bold"
            }`}
          >
            ₹{product?.price}
          </span>
          {discount > 0 && (
            <span className="text-green-600 text-sm font-medium">
              ({discount}% off)
            </span>
          )}
        </div>

        {/* Offer price */}
        {product?.offerPrice && (
          <div className="text-green-600 text-sm font-semibold">
            Offer Price: ₹{product?.offerPrice}
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="mt-3">
          {product?.totalStock === 0 ? (
            <Button className="w-full opacity-60 cursor-not-allowed" disabled>
              Out Of Stock
            </Button>
          ) : (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ShoppingProductTile;
