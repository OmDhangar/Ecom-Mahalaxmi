import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems?.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => {
            if (getCartItem?.size) {
              // For fashion products, match both productId and size
              return item.productId === getCartItem?.productId && item.size === getCartItem?.size;
            } else {
              // For non-fashion products, match only productId
              return item.productId === getCartItem?.productId;
            }
          }
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        
        if (getCurrentProductIndex > -1) {
          const currentProduct = productList[getCurrentProductIndex];
          let availableStock;
          
          if (currentProduct.category === 'fashion' && getCartItem?.size) {
            // For fashion products, check size-specific stock
            const sizeObj = currentProduct.sizes?.find(s => s.size === getCartItem.size);
            availableStock = sizeObj ? sizeObj.stock : 0;
          } else {
            // For non-fashion products, use total stock
            availableStock = currentProduct.totalStock;
          }


          if (indexOfCurrentCartItem > -1) {
            const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
            if (getQuantity + 1 > availableStock) {
              const sizeText = getCartItem?.size ? ` for size ${getCartItem.size}` : '';
              toast({
                title: `Only ${availableStock} quantity available${sizeText}`,
                variant: "destructive",
              });
              return;
            }
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
        size: getCartItem?.size, // Include size for fashion products
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ 
        userId: user?.id, 
        productId: getCartItem?.productId, 
        size: getCartItem?.size // Include size for fashion products
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-16 h-16 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-bold text-sm">{cartItem?.title}</h3>
        {cartItem?.size && (
          <p className="text-sm text-gray-600 mt-1">
            Size: <span className="font-medium">{cartItem.size}</span>
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          ₹
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mt-1 mr-4 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleCartItemDelete(cartItem)}
        >
          <Trash className="w-4 h-4" />
          <span className="sr-only">Delete item</span>
        </Button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
