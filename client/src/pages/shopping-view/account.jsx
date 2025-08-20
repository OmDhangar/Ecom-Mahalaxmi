import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { Helmet } from "react-helmet";

function ShoppingAccount() {
  return (
    <div className="flex flex-col">
      <Helmet>
        <title>My Account - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="View and manage your orders, addresses, and account details at Shri Mahalaxmi Mobile." />
      </Helmet>
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src="/account.jpg"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
          <ShoppingOrders />
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
