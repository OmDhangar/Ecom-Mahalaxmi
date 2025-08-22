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
import AboutUs from "./pages/static/AboutUs";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import ReturnPolicy from "./pages/static/ReturnPolicy";
import Terms from "./pages/static/Terms";
import Contact from "./pages/static/Contact";

// ================= SEO CONFIG =================
// ================= SEO CONFIG =================
const seoMap = {
  "/": {
    title: "Shri Mahalaxmi Mobile - Premium Mobiles & Accessories in Shirpur, Maharashtra",
    description:
      "Shop the latest smartphones, premium mobile accessories, and exclusive deals at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Trusted by influencer Bhushan Rajput and 240k+ Instagram followers (@bhushan_rajput_307).",
  },
  "/auth/login": {
    title: "Login - Shri Mahalaxmi Mobile | Shirpur, Maharashtra",
    description:
      "Login to your Shri Mahalaxmi Mobile account to track your orders, manage your profile, and access exclusive mobile deals recommended by influencer Bhushan Rajput.",
  },
  "/auth/register": {
    title: "Register - Shri Mahalaxmi Mobile | Shirpur",
    description:
      "Create a new account at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Get the latest mobiles, accessories, and special offers curated by influencer Bhushan Rajput.",
  },
  "/auth/forgot-password": {
    title: "Forgot Password - Shri Mahalaxmi Mobile",
    description:
      "Reset your Shri Mahalaxmi Mobile account password securely and regain access to your account in Shirpur, Maharashtra.",
    robots: "noindex, nofollow",
  },

  // Admin (noindex)
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

  // Shopping pages
  "/shop/home": {
    title: "Shop Mobiles Online in Shirpur | Shri Mahalaxmi Mobile",
    description:
      "Browse premium smartphones, mobile accessories, and best deals at Shri Mahalaxmi Mobile, Shirpur. Trusted by influencer Bhushan Rajput (@bhushan_rajput_307). Fast delivery and genuine products.",
  },
  "/shop/listing": {
    title: "Mobile & Accessories Listing - Shri Mahalaxmi Mobile Shirpur",
    description:
      "Find your next smartphone or mobile accessory at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Exclusive deals recommended by influencer Bhushan Rajput.",
  },
  "/shop/search": {
    title: "Search Mobiles & Accessories - Shri Mahalaxmi Mobile",
    description:
      "Search for the latest smartphones, accessories, and deals at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Featured by influencer Bhushan Rajput (@bhushan_rajput_307).",
  },
  "/shop/checkout": {
    title: "Secure Checkout - Shri Mahalaxmi Mobile",
    description:
      "Complete your mobile purchase securely at Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Enjoy seamless shopping with influencer Bhushan Rajput's trusted recommendations.",
  },
  "/shop/account": {
    title: "My Account - Shri Mahalaxmi Mobile",
    description:
      "View and manage your orders, addresses, and account details at Shri Mahalaxmi Mobile, Shirpur. Recommended by influencer Bhushan Rajput.",
  },
  "/shop/paypal-return": {
    title: "Razorpay Payment Return - Shri Mahalaxmi Mobile",
    description:
      "Return from Razorpay payment and check your order status at Shri Mahalaxmi Mobile, Shirpur. Trusted by influencer Bhushan Rajput.",
    robots: "noindex, nofollow",
  },
  "/shop/payment-success": {
    title: "Payment Successful - Shri Mahalaxmi Mobile",
    description:
      "Thank you for shopping at Shri Mahalaxmi Mobile, Shirpur. Your payment was successful. Follow influencer Bhushan Rajput for exclusive mobile deals.",
  },

  // Static Pages
  "/about": {
    title: "About Us - Shri Mahalaxmi Mobile Shirpur",
    description:
      "Learn more about Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Discover our journey, trusted products, and influencer Bhushan Rajput’s 240k+ Instagram-powered community.",
  },
  "/privacy-policy": {
    title: "Privacy Policy - Shri Mahalaxmi Mobile",
    description:
      "Read Shri Mahalaxmi Mobile's privacy policy to understand how we handle your data securely while you shop for mobiles and accessories in Shirpur, Maharashtra.",
  },
  "/return-policy": {
    title: "Return Policy - Shri Mahalaxmi Mobile",
    description:
      "Check Shri Mahalaxmi Mobile’s return and refund policy for smartphones, accessories, and online orders. Hassle-free returns in Shirpur, Maharashtra.",
  },
  "/terms": {
    title: "Terms & Conditions - Shri Mahalaxmi Mobile",
    description:
      "Review the terms and conditions of shopping at Shri Mahalaxmi Mobile. Trusted by 240k+ Instagram followers of influencer Bhushan Rajput.",
  },
  "/contact": {
    title: "Contact Us - Shri Mahalaxmi Mobile",
    description:
      "Get in touch with Shri Mahalaxmi Mobile in Shirpur, Maharashtra. Contact us for mobile sales, accessories, and influencer Bhushan Rajput’s exclusive offers.",
  },

  // Order success
  "/order-success": {
    title: "Order Successful - Shri Mahalaxmi Mobile",
    description:
      "Your order at Shri Mahalaxmi Mobile has been placed successfully. Stay tuned for updates and exclusive deals from influencer Bhushan Rajput.",
  },

  "/unauth-page": {
    title: "Unauthorized - Shri Mahalaxmi Mobile",
    description:
      "You are not authorized to view this page at Shri Mahalaxmi Mobile, Shirpur.",
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

// ================= MAIN APP =================
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
  const logoUrl = `${window.location.origin}/logo.jpg`;

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.robots && <meta name="robots" content={seo.robots} />}

        {/* Favicon & Logo */}
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <meta property="og:image" content={logoUrl} />
        <meta property="og:logo" content={logoUrl} />

        {/* JSON-LD Schema for Google */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Shri Mahalaxmi Mobile",
            "url": window.location.origin,
            "logo": logoUrl,
            "sameAs": [
              "https://www.instagram.com/bhushan_rajput_307"
            ]
          })}
        </script>
      </Helmet>

      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ShoppingLayout />}>
          <Route index element={<ShoppingHome />} />
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/shop" element={<ShoppingLayout />}>
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>

        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgot-password" element={<ForgetPassword />} />
        </Route>

        {/* Admin routes */}
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

        {/* Shopping protected routes */}
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
