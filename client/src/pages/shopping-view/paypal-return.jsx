import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { loadScript } from "@/lib/utils"; // You'll need to create this utility

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = async () => {
    try {
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      setRazorpayLoaded(true);
    } catch (error) {
      console.error("Failed to load Razorpay script", error);
      toast({
        title: "Payment system error",
        description: "Failed to load payment processor",
        variant: "destructive",
      });
    }
  };

  const handleInitiateRazorpayPayment = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!razorpayLoaded) {
      toast({
        title: "Payment system is loading. Please try again shortly.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentStart(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
        name: currentSelectedAddress?.name || user?.name,
        email: user?.email,
      },
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
    };

    try {
      const response = await dispatch(createNewOrder(orderData)).unwrap();
      
      if (response.success) {
        const options = {
          key: response.key,
          amount: response.amount,
          currency: response.currency,
          name: response.name || "Your Store Name",
          description: `Order #${response.order._id}`,
          order_id: response.razorpayOrderId,
          handler: async function (paymentResponse) {
            // Verify payment on your server
            const verificationResponse = await verifyPayment({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              orderId: response.order._id,
            });

            if (verificationResponse.success) {
              toast({
                title: "Payment Successful",
                description: "Your order has been placed successfully!",
              });
              // Redirect to order confirmation page
              window.location.href = `/order-confirmation/${response.order._id}`;
            } else {
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support",
                variant: "destructive",
              });
            }
          },
          prefill: {
            name: orderData.addressInfo.name,
            email: orderData.addressInfo.email,
            contact: orderData.addressInfo.phone,
          },
          theme: {
            color: "#F37254",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast({
          title: "Order creation failed",
          description: response.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsPaymentStart(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button 
              onClick={handleInitiateRazorpayPayment}
              className="w-full"
              disabled={isPaymentStart || !razorpayLoaded}
            >
              {isPaymentStart
                ? "Processing Payment..."
                : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;