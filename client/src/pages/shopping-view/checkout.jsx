import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder, verifyPayment } from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { loadScript } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck, CheckCircle, Landmark } from "lucide-react";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to COD
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { razorpayOrder } = useSelector((state) => state.shopOrder);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState(null);

  console.log(currentSelectedAddress, "cartItems");


  useEffect(() => {
    const loadRazorpay = async () => {
      try {
        console.log("Razorpay details", razorpayOrder);
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
    if (razorpayOrder && razorpayOrder.success && isRazorpayLoaded && paymentMethod === 'razorpay') {
      openRazorpayWindow(razorpayOrder);
    }
  }, [isPaymentStart, razorpayOrder, isRazorpayLoaded, paymentMethod]);

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
            description: 'Your order has been confirmed and will be shipped soon!',
          });
          
          setOrderSuccess(true);
          setSuccessOrderDetails(orderDetails.order);
          setIsPaymentStart(false);
          
        } catch (error) {
          toast({
            title: 'Payment Verification Failed',
            description: error.message || 'Please contact support',
            variant: 'destructive',
          });
          setIsPaymentStart(false);
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
          setIsPaymentStart(false);
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

  // Calculate delivery charges (you can make this dynamic based on address/weight)
  const deliveryCharges = paymentMethod === 'cod' ? 50 : 0; // COD has delivery charges
  const finalAmount = totalCartAmount + deliveryCharges;

  function handleInitiatePayment() {
    console.log("USer:",user)
    if (!cartItems?.items || cartItems.items.length === 0) {
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
        name:currentSelectedAddress?.name || user?.name,
        email:currentSelectedAddress?.email || user?.email,
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        state: currentSelectedAddress?.state || "Unknown", // Add state field
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        Landmark: currentSelectedAddress?.Landmark,
      },
      orderStatus: "pending",
      paymentMethod: paymentMethod,
      paymentStatus: "pending",
      totalAmount: finalAmount,
      shippingCharges: deliveryCharges,
      subTotal: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      console.log("orderDetails:", data);
      if (data?.payload?.success) {
        console.log("ordered:",data.payload.success);
        if (paymentMethod === 'cod') {
          // For COD, order is created successfully
          toast({
            title: 'Order Placed Successfully!',
            description: 'Your COD order has been confirmed and will be processed soon.',
          });
          setOrderSuccess(true);
          setSuccessOrderDetails(data.payload.order);
          setIsPaymentStart(false);
          
        }
        // For Razorpay, the useEffect will handle opening the payment window
      } else {
        setIsPaymentStart(false);
        toast({
          title: 'Order Creation Failed',
          description: data?.payload?.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    }).catch((error) => {
      setIsPaymentStart(false);
      toast({
        title: 'Order Creation Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    });
  }

  // Success screen component
  if (orderSuccess && successOrderDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-5">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-green-600">Order Confirmed!</h1>
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
            <p className="text-gray-600 mb-2">Order ID: <span className="font-mono text-sm">{successOrderDetails._id}</span></p>
            <p className="text-gray-600 mb-2">Payment Method: <span className="capitalize">{paymentMethod}</span></p>
            <p className="text-gray-600 mb-2">Total Amount: <span className="font-bold">₹{finalAmount}</span></p>
            <p className="text-sm text-gray-500 mt-4">
              {paymentMethod === 'cod' 
                ? 'Please keep the exact amount ready for delivery.' 
                : 'Your payment has been processed successfully.'}
            </p>
          </div>
        </div>
      </div>
    );
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
            ? cartItems.items.map((item, index) => (
                <UserCartItemsContent key={index} cartItem={item} />
              ))
            : null}

          {/* Payment Method Selection */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Truck className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Cash on Delivery (COD)</div>
                      <div className="text-sm text-gray-500">Pay when your order arrives (+ ₹50 COD charges)</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Online Payment</div>
                      <div className="text-sm text-gray-500">Credit/Debit Card, UPI, Net Banking</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="mt-8 space-y-4">
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalCartAmount}</span>
              </div>
              {deliveryCharges > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charges</span>
                  <span>₹{deliveryCharges}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full">
            <Button 
              onClick={handleInitiatePayment} 
              className="w-full"
              disabled={isPaymentStart}
            >
              {isPaymentStart ? (
                "Processing..."
              ) : paymentMethod === 'cod' ? (
                "Place COD Order"
              ) : (
                "Proceed to Payment"
              )}
            </Button>
            
            {paymentMethod === 'cod' && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                ₹50 additional charges apply for Cash on Delivery
              </p>
            )}
          </div>

          {/* Payment Method Benefits */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">
              {paymentMethod === 'cod' ? 'COD Benefits' : 'Online Payment Benefits'}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {paymentMethod === 'cod' ? (
                <>
                  <li>• Pay only when you receive your order</li>
                  <li>• No need for online payment</li>
                  <li>• Cash payment accepted</li>
                  <li>• Extra security for your purchase</li>
                </>
              ) : (
                <>
                  <li>• Instant order confirmation</li>
                  <li>• No additional COD charges</li>
                  <li>• Faster processing and delivery</li>
                  <li>• Multiple payment options available</li>
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