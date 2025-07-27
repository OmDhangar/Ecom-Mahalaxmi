import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder,verifyPayment } from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { loadScript } from "@/lib/utils";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { razorpayOrder } = useSelector((state) => state.shopOrder);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  console.log(currentSelectedAddress, "cartItems");
  useEffect(() => {
    const loadRazorpay = async () => {
      try {
        console.log("Razorpay details",razorpayOrder)
        await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        setIsRazorpayLoaded(true);
      } catch (error) {
        console.error('Failed to load Razorpay script', error);
        toast({
          title: 'Payment system error',
          description: 'Failed to load payment processor',
          variant: 'destructive',
        });
      }
    };

    loadRazorpay();
    return () => {
      // Cleanup if needed
    };
  }, []);
  // Open Razorpay payment window when order is created
  useEffect(() => {
    if (razorpayOrder && razorpayOrder.success && isRazorpayLoaded) {
      openRazorpayWindow(razorpayOrder);
    }
  }, [isPaymentStart,razorpayOrder, isRazorpayLoaded]);

  const openRazorpayWindow = (orderDetails) => {
    const options = {
      key: orderDetails.key,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      name: orderDetails.name,
      description: orderDetails.description,
      order_id: orderDetails.razorpayOrderId,
      handler: async function (response) {
        // Handle payment verification
        try {
          const verificationData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderDetails.order._id,
          };

          await dispatch(verifyPayment(verificationData)).unwrap();
          
          toast({
            title: 'Payment Successful',
            description: 'Your order has been confirmed!',
          });
          // Redirect to success page
          window.location.href = `/payment-success`;
        } catch (error) {
          toast({
            title: 'Payment Verification Failed',
            description: error.message || 'Please contact support',
            variant: 'destructive',
          });
        }
      },
      prefill: orderDetails.prefill,
      theme: orderDetails.theme,
      modal: {
        ondismiss: () => {
          toast({
            title: 'Payment Cancelled',
            description: 'You closed the payment window',
            variant: 'destructive',
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

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

  function handleInitiatePayment() {
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
        name:currentSelectedAddress?.name || user?.name,
        email:user?.email
      },
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      console.log("orderDetails:",data );
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }
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
                <UserCartItemsContent cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button onClick={handleInitiatePayment} className="w-full">
              {isPaymentStart
                ? "Processing Payment..."
                : "Checkout with Paypal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
