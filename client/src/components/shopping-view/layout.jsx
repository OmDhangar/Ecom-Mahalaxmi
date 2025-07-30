import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import Footer from "../ui/Footer";
function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Common header */}
      <ShoppingHeader />

      {/* Page Content */}
      <main className="flex flex-col w-full flex-grow">
        <Outlet />
      </main>

      {/* Footer (Visible on all shopping pages) */}
      <Footer />
    </div>
  );
}

export default ShoppingLayout;

