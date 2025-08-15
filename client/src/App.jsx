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

const seoMap = {
  "/": {
    title: "Shri Mahalaxmi Mobile - Home",
    description: "Welcome to Shri Mahalaxmi Mobile. Discover the latest smartphones, accessories, and exclusive offers.",
  },
  "/auth/login": {
    title: "Login - Shri Mahalaxmi Mobile",
    description: "Login to your account to track orders and manage your profile.",
  },
  "/auth/register": {
    title: "Register - Shri Mahalaxmi Mobile",
    description: "Create a new account and start shopping for the latest mobiles and accessories.",
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
    title: "Shop Home - Shri Mahalaxmi Mobile",
    description: "Browse featured mobiles and best deals at Shri Mahalaxmi Mobile.",
  },
  "/shop/listing": {
    title: "Mobile Listing - Shri Mahalaxmi Mobile",
    description: "Find your next smartphone from our wide selection of mobiles.",
  },
  "/shop/checkout": {
    title: "Checkout - Shri Mahalaxmi Mobile",
    description: "Complete your purchase securely at Shri Mahalaxmi Mobile.",
  },
  "/shop/account": {
    title: "My Account - Shri Mahalaxmi Mobile",
    description: "View and manage your orders, addresses, and account details.",
  },
  "/shop/paypal-return": {
    title: "PayPal Return - Shri Mahalaxmi Mobile",
    description: "Return from PayPal payment. Check your order status.",
  },
  "/shop/payment-success": {
    title: "Payment Success - Shri Mahalaxmi Mobile",
    description: "Your payment was successful. Thank you for shopping with us!",
  },
  "/shop/search": {
    title: "Search Products - Shri Mahalaxmi Mobile",
    description: "Search for mobiles, accessories, and more at Shri Mahalaxmi Mobile.",
  },
  "/unauth-page": {
    title: "Unauthorized - Shri Mahalaxmi Mobile",
    description: "You are not authorized to view this page.",
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
      <Routes>
        {/* Public routes - no authentication needed */}
        <Route path="/" element={<ShoppingLayout />}>
          <Route index element={<ShoppingHome />} />
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>


        <Route path="/shop" element={<ShoppingLayout />}>
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>

        {/* Auth routes - for login/register */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
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