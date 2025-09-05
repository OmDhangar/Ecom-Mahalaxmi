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
  const [selectedOrder, setSelectedOrder] = useState(null);
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
    setSelectedOrder(orderId);
    dispatch(getOrderDetails(orderId));
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
      case "shipping":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "rejected":
      case "shipping_failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusText = (status) => {
    // Convert snake_case to Title Case with spaces
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Card className="shadow-sm rounded-lg border-0 md:border">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-xl font-medium text-gray-900">Your Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orderList && orderList.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {orderList.map((orderItem) => (
                  <div key={orderItem._id} className="p-4 bg-white hover:bg-gray-50 transition-colors duration-150">
                    {/* Order header with ID and date */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Order Placed</div>
                        <div className="text-sm font-medium text-gray-900">{formatDate(orderItem.orderDate)}</div>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:text-right">
                        <div className="text-sm text-gray-500">Order # {orderItem._id.substring(orderItem._id.length - 8).toUpperCase()}</div>
                        <div className="text-sm font-medium text-gray-900">Total: ₹{orderItem.totalAmount?.toLocaleString() || '0'}</div>
                      </div>
                    </div>
                    
                    {/* Order status and shipping info */}
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Ship to</div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {orderItem.addressInfo?.name || 'Customer'}
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <Badge className={`${getStatusVariant(orderItem.orderStatus)} capitalize py-1 px-2 text-xs font-medium`}>
                          {getStatusText(orderItem.orderStatus)}
                        </Badge>
                        {orderItem.shippingStatus && (
                          <div className="text-xs text-gray-500 mt-1">
                            Shipping: {getStatusText(orderItem.shippingStatus)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Order content */}
                    <div className="flex flex-col md:flex-row gap-4 border-t pt-3">
                      {/* Order items preview */}
                      <div className="flex-1">
                        {orderItem.cartItems && orderItem.cartItems.length > 0 ? (
                          orderItem.cartItems.slice(0, 3).map((item, index) => (
                            <div key={item._id || index} className="flex items-start gap-3 mb-3">
                              {/* Product image */}
                              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-xs">Image</span>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {item.title || "Product Name"}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  Qty: {item.quantity || 1}
                                  {item.size && `, Size: ${item.size}`}
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  ₹{item.price ? (parseInt(item.price) * (item.quantity || 1)).toLocaleString() : '0'}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No items in this order</div>
                        )}
                        
                        {orderItem.cartItems && orderItem.cartItems.length > 3 && (
                          <div className="text-xs text-gray-500 mt-2">
                            + {orderItem.cartItems.length - 3} more item{orderItem.cartItems.length > 4 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      {/* Order actions */}
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <Dialog
                          open={openDetailsDialog && selectedOrder === orderItem._id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setOpenDetailsDialog(false);
                              setSelectedOrder(null);
                              dispatch(resetOrderDetails());
                            }
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFetchOrderDetails(orderItem._id)}
                            className="mt-2 text-xs h-8 px-3 border-gray-300 shadow-sm"
                          >
                            Order Details
                          </Button>
                          <ShoppingOrderDetailsView orderDetails={orderDetails} />
                        </Dialog>
                        
                        {orderItem.paymentStatus === 'paid' && (
                          <div className="text-xs text-green-600 font-medium">
                            Payment Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                <p className="text-gray-500">Your orders will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ShoppingOrders;