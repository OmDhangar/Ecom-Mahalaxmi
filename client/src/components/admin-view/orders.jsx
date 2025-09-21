import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  // Removed getShippingFailedOrders as it's no longer needed here
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  // Removed activeTab state as only "all" orders will be displayed
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const { orderList, /* Removed shippingFailedOrders */ orderDetails } = useSelector(
    (state) => state.adminOrder
  );
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin({ fromDate, toDate }));
    // Removed dispatch(getShippingFailedOrders());
  }, [dispatch, fromDate, toDate]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Orders</CardTitle>

        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <label className="text-sm text-gray-700">
            From:
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="ml-2 px-3 py-2 border rounded-md bg-white text-black"
            />
          </label>

          <label className="text-sm text-gray-700">
            To:
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="ml-2 px-3 py-2 border rounded-md bg-white text-black"
            />
          </label>

          <Button
            onClick={() => {
              dispatch(getAllOrdersForAdmin({ fromDate, toDate }));
              // Removed dispatch(getShippingFailedOrders());
            }}
            className="ml-4"
          >
            Filter Range
          </Button>
        </div>

        {/* Removed Tab Buttons */}
        {/*
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
          >
            All Orders
          </Button>
          <Button
            variant={activeTab === "shippingError" ? "default" : "outline"}
            onClick={() => setActiveTab("shippingError")}
          >
            Shipping Errors
          </Button>
        </div>
        */}
      </CardHeader>

      <CardContent>
        {/* Simplified to always show "All Orders" */}
        {/* {activeTab === "all" ? ( */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Shipment Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList && orderList.length > 0 ? (
                orderList.map((orderItem) => (
                  <TableRow key={orderItem._id}>
                    <TableCell>{orderItem._id}</TableCell>
                    <TableCell>
                      {orderItem.orderDate?.split("T")[0] || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 capitalize ${
                          orderItem.orderStatus === "confirmed"
                            ? "bg-green-600"
                            : orderItem.orderStatus === "pending"
                            ? "bg-yellow-500"
                            : orderItem.orderStatus === "shipped"
                            ? "bg-blue-500"
                            : orderItem.orderStatus === "delivered"
                            ? "bg-purple-600"
                            : orderItem.orderStatus === "shipping_failed"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {orderItem.orderStatus || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 capitalize ${
                          orderItem.paymentStatus === "paid"
                            ? "bg-green-500"
                            : orderItem.paymentStatus === "failed"
                            ? "bg-red-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {orderItem.paymentStatus || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{orderItem.totalAmount}</TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem._id)
                          }
                        >
                          View Details
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        {/* ) : ( */}
          {/* Removed Shipping Error Tab */}
        {/* )} */}
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
