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
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import axios from "axios";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }


  useEffect(() => {
    dispatch(getAllOrdersForAdmin({fromDate,toDate}));
  }, [dispatch,fromDate, toDate]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
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
              onClick={() => dispatch(getAllOrdersForAdmin({ fromDate, toDate }))}
              className="ml-4"
            >
              Filter Range
            </Button>
          </div>

      </CardHeader>
      <CardContent>
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
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                  <TableRow key={orderItem._id}>
                    <TableCell>{orderItem._id}</TableCell>
                    <TableCell>{orderItem.orderDate?.split("T")[0]}</TableCell>
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
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
