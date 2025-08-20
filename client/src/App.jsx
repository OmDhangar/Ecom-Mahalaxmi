import { Route, Routes, useLocation } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import CarouselAdmin from "./pages/admin-view/carousel";
import { Helmet } from "react-helmet";
import ForgetPassword from "@/pages/auth/forgetPassword";
import OrderSuccess from "./pages/shopping-view/orderSuccess";
import ScrollToTop from "./components/common/scrollToTop";

const seoMap = {
  "/": {
    title: "Shri Mahalaxmi Mobile - Premium Mobiles & Accessories in Shirpur, Maharashtra",
    description: "Shop the latest smartphones, premium mobile accessories, and exclusive deals at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Trusted by influencer Bhushan Rajput and 240k+ Instagram followers (@bhushan_rajput_307).",
  },
  "/auth/login": {
    title: "Login - Shri Mahalaxmi Mobile | Shirpur, Maharashtra",
    description: "Login to your Shri Mahalaxmi Mobile account to track your orders, manage your profile, and access exclusive mobile deals recommended by influencer Bhushan Rajput.",
  },
  "/auth/register": {
    title: "Register - Shri Mahalaxmi Mobile | Shirpur",
    description: "Create a new account at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Get the latest mobiles, accessories, and special offers curated by influencer Bhushan Rajput.",
  },
  "/admin/dashboard": {
    title: "Admin Dashboard - Shri Mahalaxmi Mobile",
    description: "",
    robots: "noindex, nofollow",
  },
  "/admin/products": {
    title: "Manage Products - Shri Mahalaxmi Mobile",
    description: "",
    robots: "noindex, nofollow",
  },
  "/admin/orders": {
    title: "Manage Orders - Shri Mahalaxmi Mobile",
    description: "",
    robots: "noindex, nofollow",
  },
  "/admin/features": {
    title: "Site Features - Shri Mahalaxmi Mobile",
    description: "",
    robots: "noindex, nofollow",
  },
  "/admin/carousel": {
    title: "Admin Carousel - Shri Mahalaxmi Mobile",
    description: "",
    robots: "noindex, nofollow",
  },
  "/shop/home": {
    title: "Shop Mobiles Online in Shirpur | Shri Mahalaxmi Mobile",
    description: "Browse premium smartphones, mobile accessories, and best deals at Shri Mahalaxmi Mobile, Shirpur. Trusted by influencer Bhushan Rajput (@bhushan_rajput_307). Fast delivery and genuine products.",
  },
  "/shop/listing": {
    title: "Mobile & Accessories Listing - Shri Mahalaxmi Mobile Shirpur",
    description: "Find your next smartphone or mobile accessory at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Exclusive deals recommended by influencer Bhushan Rajput.",
  },
  "/shop/checkout": {
    title: "Secure Checkout - Shri Mahalaxmi Mobile",
    description: "Complete your mobile purchase securely at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Enjoy seamless shopping with influencer Bhushan Rajput's trusted recommendations.",
  },
  "/shop/account": {
    title: "My Account - Shri Mahalaxmi Mobile",
    description: "View and manage your orders, addresses, and account details at Shri Mahalaxmi Mobile, Shirpur. Recommended by influencer Bhushan Rajput.",
  },
  "/shop/paypal-return": {
    title: "PayPal Payment Return - Shri Mahalaxmi Mobile",
    description: "Return from PayPal payment and check your order status at Shri Mahalaxmi Mobile, Shirpur. Trusted by influencer Bhushan Rajput.",
  },
  "/shop/payment-success": {
    title: "Payment Successful - Shri Mahalaxmi Mobile",
    description: "Thank you for shopping at Shri Mahalaxmi Mobile, Shirpur. Your payment was successful. Follow influencer Bhushan Rajput for exclusive mobile deals.",
  },
  "/shop/search": {
    title: "Search Mobiles & Accessories - Shri Mahalaxmi Mobile",
    description: "Search for the latest smartphones, accessories, and deals at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Featured by influencer Bhushan Rajput (@bhushan_rajput_307).",
  },
  "/unauth-page": {
    title: "Unauthorized - Shri Mahalaxmi Mobile",
    description: "You are not authorized to view this page at Shri Mahalaxmi Mobile, Shirpur.",
    robots: "noindex, nofollow",
  },
};


function getSeo(pathname) {
  return seoMap[pathname] || {
    title: "404 Not Found - Shri Mahalaxmi Mobile",
    description: "The page you are looking for does not exist.",
    robots: "noindex, nofollow",
  };
}

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  const seo = getSeo(location.pathname);

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.robots && <meta name="robots" content={seo.robots} />}
      </Helmet>
      <ScrollToTop />
      <Routes>
        {/* Public routes - no authentication needed */}
        <Route path="/" element={<ShoppingLayout />}>
          <Route index element={<ShoppingHome />} />
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="order-success" element={<OrderSuccess/>}></Route>
        </Route>


        <Route path="/shop" element={<ShoppingLayout />}>
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>

        {/* Auth routes - for login/register */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgot-password" element={<ForgetPassword />} />

        </Route>

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user} requiredRole="admin">
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="carousel" element={<CarouselAdmin />} />
        </Route>

        {/* Protected shopping routes (account, checkout) */}
        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
        </Route>

        {/* Other routes */}
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;