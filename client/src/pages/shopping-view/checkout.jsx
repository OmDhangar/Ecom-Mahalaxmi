import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createNewOrder, verifyPayment, calculateShippingCharge } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { loadScript } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet";

function ShoppingCheckout() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { razorpayOrder, shippingCharge, shippingChargeLoading, shippingChargeError } = useSelector(
    (state) => state.shopOrder
  );

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState(null);

  const [backendShippingCharges, setBackendShippingCharges] = useState(0);
  const [backendSubTotal, setBackendSubTotal] = useState(0);
  const [backendTotalAmount, setBackendTotalAmount] = useState(0);

  // Optimized subtotal calculation with useMemo
  const totalCartAmount = useMemo(() => {
    return cartItems?.items?.length
      ? cartItems.items.reduce(
          (sum, item) =>
            sum + (item?.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
          0
        )
      : 0;
  }, [cartItems]);

  const displaySubTotal = backendSubTotal || totalCartAmount;
  const displayShippingCharges = shippingChargeLoading ? 0 : shippingCharge;
  const displayTotalAmount = displaySubTotal + displayShippingCharges;

  // Calculate shipping charges
  useEffect(() => {
    if (cartItems?.items?.length > 0 && currentSelectedAddress?.pincode) {
      const formattedCartItems = cartItems.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      }));

      dispatch(calculateShippingCharge({ cartItems: formattedCartItems, deliveryPincode: currentSelectedAddress.pincode }));
    }
  }, [dispatch, cartItems?.items, currentSelectedAddress?.pincode]);

  // Load Razorpay once
  useEffect(() => {
    async function loadRzp() {
      try {
        await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        setIsRazorpayLoaded(true);
      } catch {
        toast({
          title: "Payment system error",
          description: "Failed to load payment processor",
          variant: "destructive",
        });
      }
    }
    loadRzp();
  }, [toast]);

  // Open Razorpay when order is ready
  useEffect(() => {
    if (razorpayOrder?.success && isRazorpayLoaded && paymentMethod === "razorpay") {
      openRazorpayWindow(razorpayOrder);
    }
  }, [razorpayOrder, isRazorpayLoaded, paymentMethod]);

  const openRazorpayWindow = useCallback(
    (orderDetails) => {
      const options = {
        key: orderDetails.key,
        amount: orderDetails.amount,
        currency: orderDetails.currency,
        name: orderDetails.name,
        description: orderDetails.description,
        order_id: orderDetails.razorpayOrderId,
        handler: async (response) => {
          try {
            await dispatch(
              verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderDetails.order._id,
              })
            ).unwrap();

            toast({
              title: "Payment Successful",
              description: "Your order has been confirmed and will be shipped soon!",
            });

            setOrderSuccess(true);
            setSuccessOrderDetails(orderDetails.order);

            setBackendShippingCharges(orderDetails.order.shippingCharges || 0);
            setBackendSubTotal(orderDetails.order.subTotal || 0);
            setBackendTotalAmount(orderDetails.order.totalAmount || 0);

            setIsPaymentStart(false);
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support",
              variant: "destructive",
            });
            setIsPaymentStart(false);
          }
        },
        prefill: orderDetails.prefill,
        theme: orderDetails.theme,
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Cancelled",
              description: "You closed the payment window",
              variant: "destructive",
            });
            setIsPaymentStart(false);
          },
        },
      };

      new window.Razorpay(options).open();
    },
    [dispatch, toast]
  );

  const handleInitiatePayment = useCallback(() => {
    if (!cartItems?.items?.length) {
      return toast({ title: "Your cart is empty. Please add items to proceed.", variant: "destructive" });
    }
    if (!currentSelectedAddress) {
      return toast({ title: "Please select an address to proceed.", variant: "destructive" });
    }

    setIsPaymentStart(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
        size: item.size || null,
      })),
      addressInfo: {
        name: currentSelectedAddress?.name || user?.name,
        email: currentSelectedAddress?.email || user?.email,
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        state: currentSelectedAddress?.state || "Unknown",
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        Landmark: currentSelectedAddress?.Landmark,
      },
      orderStatus: "pending",
      paymentMethod,
      paymentStatus: "pending",
      totalAmount: displayTotalAmount,
      shippingCharges: displayShippingCharges,
      subTotal: displaySubTotal,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData))
      .unwrap()
      .then((data) => {
        if (data.success) {
          const backendOrder = data.order;
          setBackendShippingCharges(backendOrder.shippingCharges);
          setBackendSubTotal(backendOrder.subTotal);
          setBackendTotalAmount(backendOrder.totalAmount);

          if (paymentMethod === "cod") {
            toast({ title: "Order Placed Successfully!", description: "Your COD order will be processed soon." });
            setOrderSuccess(true);
            setSuccessOrderDetails(backendOrder);
            setIsPaymentStart(false);
          }
        } else {
          setIsPaymentStart(false);
          toast({ title: "Order Creation Failed", description: data.message || "Something went wrong", variant: "destructive" });
        }
      })
      .catch((error) => {
        setIsPaymentStart(false);
        toast({ title: "Order Creation Failed", description: error.message || "Please try again.", variant: "destructive" });
      });
  }, [cartItems, currentSelectedAddress, dispatch, paymentMethod, displayTotalAmount, displayShippingCharges, displaySubTotal, toast, user]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>Checkout - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Complete your secure checkout for Shri Mahalaxmi Mobile purchases. Choose COD or online payment." />
        <link rel="preload" as="image" href={img} />
      </Helmet>

      <div className="relative h-48 sm:h-64 w-full overflow-hidden">
        <img
          src={img}
          alt="Secure mobile checkout page header"
          className="h-full w-full object-cover object-center"
          width="1920"
          height="400"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address selection */}
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        {/* Right side: Cart items + Payment + Summary */}
        <div className="flex flex-col gap-6">
          {/* Cart items */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto border rounded-md p-4 bg-gray-50">
            {cartItems?.items?.length > 0 ? (
              cartItems.items.map((item, i) => <UserCartItemsContent key={i} cartItem={item} />)
            ) : (
              <p className="text-center text-gray-500">Your cart is empty.</p>
            )}
          </div>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
              <CardDescription>Choose your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer border ${
                    paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-2 flex-1">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-blue-700">Cash on Delivery (COD)</div>
                      <div className="text-sm text-blue-600">Pay when your order arrives (+ ₹50 COD charges)</div>
                    </div>
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer border ${
                    paymentMethod === "razorpay"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label htmlFor="razorpay" className="flex items-center gap-2 flex-1">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-700">Online Payment</div>
                      <div className="text-sm text-green-600">Credit/Debit Card, UPI, Net Banking</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-md p-4 shadow-inner">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="flex justify-between mb-1 text-gray-700">
              <span>Subtotal</span>
              <span>₹{displaySubTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1 text-gray-700">
              <span>Delivery Charges</span>
              <span>
                {shippingChargeLoading ? (
                  <span className="text-blue-600 animate-pulse">Calculating...</span>
                ) : shippingChargeError ? (
                  <span className="text-red-600 text-sm">Error calculating</span>
                ) : (
                  `₹${displayShippingCharges.toFixed(2)}`
                )}
              </span>
            </div>
            {/* Show error message for shipping calculation */}
            {shippingChargeError && (
              <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
                {shippingChargeError}. Using fallback charges.
              </div>
            )}
            {/* Show info when no address is selected */}
            {!currentSelectedAddress && (
              <div className="text-amber-600 text-xs mt-2 p-2 bg-amber-50 rounded">
                Please select an address to calculate accurate delivery charges.
              </div>
            )}
            <div className="flex justify-between mt-2 pt-2 border-t font-bold text-lg">
              <span>Total</span>
              <span>₹{displayTotalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Place order button */}
          <Button onClick={handleInitiatePayment} disabled={isPaymentStart} className="w-full py-3 text-lg">
            {isPaymentStart ? "Processing..." : paymentMethod === "cod" ? "Place COD Order" : "Proceed to Payment"}
          </Button>

          {/* Payment method benefits */}
          <div
            className={`p-4 rounded-md ${
              paymentMethod === "cod" ? "bg-blue-50 text-blue-800" : "bg-green-50 text-green-800"
            }`}
          >
            <h4 className="font-semibold mb-2">
              {paymentMethod === "cod" ? "COD Benefits" : "Online Payment Benefits"}
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {paymentMethod === "cod" ? (
                <>
                  <li>Pay only when you receive your order</li>
                  <li>No need for online payment</li>
                  <li>Cash payment accepted</li>
                  <li>Extra security for your purchase</li>
                </>
              ) : (
                <>
                  <li>Instant order confirmation</li>
                  <li>No additional COD charges</li>
                  <li>Faster processing and delivery</li>
                  <li>Multiple payment options available</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
