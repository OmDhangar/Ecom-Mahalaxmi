import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  const handleFetchOrderDetails = (orderId) => {
    dispatch(getOrderDetails(orderId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {orderList && orderList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {orderList.map((orderItem) => (
              <div
                key={orderItem._id}
                className="flex flex-col border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow duration-300"
              >
                {/* Top area: Order ID and Status */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold truncate max-w-[70%]">
                    Order ID: {orderItem._id}
                  </h3>
                  <Badge
                    className={`py-1 px-3 text-xs font-semibold ${
                      orderItem.orderStatus === "confirmed"
                        ? "bg-green-500 text-white"
                        : orderItem.orderStatus === "rejected"
                        ? "bg-red-600 text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {orderItem.orderStatus}
                  </Badge>
                </div>

                {/* Order Date */}
                <p className="text-gray-600 text-sm mb-1">
                  Order Date: {orderItem.orderDate.split("T")[0]}
                </p>

                {/* Total Price */}
                <p className="font-medium mb-4">₹{orderItem.totalAmount}</p>

                {/* View Details Button + Dialog */}
                <Dialog
                  open={openDetailsDialog}
                  onOpenChange={() => {
                    setOpenDetailsDialog(false);
                    dispatch(resetOrderDetails());
                  }}
                >
                  <Button
                    onClick={() => handleFetchOrderDetails(orderItem._id)}
                    className="mt-auto"
                  >
                    View Details
                  </Button>
                  <ShoppingOrderDetailsView orderDetails={orderDetails} />
                </Dialog>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No orders found.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
