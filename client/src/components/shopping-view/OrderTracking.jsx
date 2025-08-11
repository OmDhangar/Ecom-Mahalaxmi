// components/shopping-view/OrderTracking.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { trackOrder, getOrderDetails, cancelOrder } from '@/store/shop/order-slice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  CreditCard,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

const OrderTracking = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { orderDetails, trackingInfo, isLoading } = useSelector(state => state.shopOrder);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetails(orderId));
      dispatch(trackOrder(orderId));
    }
  }, [dispatch, orderId]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      case 'returned':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelOrder = (order) => {
    return order && ['pending', 'confirmed'].includes(order.orderStatus?.toLowerCase());
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Cancellation reason required',
        description: 'Please provide a reason for cancellation',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dispatch(cancelOrder({ 
        orderId: orderDetails._id, 
        reason: cancelReason 
      })).unwrap();
      
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully',
      });
      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      toast({
        title: 'Cancellation Failed',
        description: error || 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrackingSteps = (order) => {
    const steps = [
      { 
        title: 'Order Placed', 
        status: 'completed', 
        date: order?.orderDate,
        description: `Order placed via ${order?.paymentMethod?.toUpperCase()}`
      },
      { 
        title: 'Order Confirmed', 
        status: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order?.orderStatus) ? 'completed' : 'pending',
        date: order?.orderStatus === 'confirmed' ? order?.orderUpdateDate : null,
        description: 'Order confirmed and being prepared'
      },
      { 
        title: 'Processing', 
        status: ['processing', 'shipped', 'delivered'].includes(order?.orderStatus) ? 'completed' : 'pending',
        date: order?.orderStatus === 'processing' ? order?.orderUpdateDate : null,
        description: 'Order is being packed'
      },
      { 
        title: 'Shipped', 
        status: ['shipped', 'delivered'].includes(order?.orderStatus) ? 'completed' : 'pending',
        date: order?.orderStatus === 'shipped' ? order?.orderUpdateDate : null,
        description: order?.awbCode ? `AWB: ${order.awbCode}` : 'Out for delivery'
      },
      { 
        title: 'Delivered', 
        status: order?.orderStatus === 'delivered' ? 'completed' : 'pending',
        date: order?.actualDeliveryDate || (order?.orderStatus === 'delivered' ? order?.orderUpdateDate : null),
        description: 'Order delivered successfully'
      }
    ];

    return steps;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
        <p className="text-gray-600">The order you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps(orderDetails);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(orderDetails.orderStatus)}
                Order #{orderDetails._id}
              </CardTitle>
              <CardDescription>
                Placed on {formatDate(orderDetails.orderDate)}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(orderDetails.orderStatus)}>
                {orderDetails.orderStatus?.toUpperCase()}
              </Badge>
              {canCancelOrder(orderDetails) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 text-red-600 hover:text-red-700"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">{orderDetails.paymentMethod?.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium">₹{orderDetails.totalAmount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <Badge variant={orderDetails.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                  {orderDetails.paymentStatus?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <CardDescription>Track your order progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trackingSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${
                      step.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h3>
                    {step.date && (
                      <span className="text-sm text-gray-500">
                        {formatDate(step.date)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shiprocket Tracking Info */}
      {trackingInfo?.tracking && (
        <Card>
          <CardHeader>
            <CardTitle>Live Tracking</CardTitle>
            <CardDescription>Real-time updates from courier partner</CardDescription>
          </CardHeader>
          <CardContent>
            {trackingInfo.tracking.error ? (
              <p className="text-yellow-600">Tracking information temporarily unavailable</p>
            ) : (
              <div className="space-y-2">
                {trackingInfo.tracking.tracking_data?.shipment_track?.map((track, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{track.current_status}</p>
                      <p className="text-sm text-gray-600">{track.location}</p>
                    </div>
                    <span className="text-sm text-gray-500">{track.date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{orderDetails.addressInfo?.name}</p>
            <p className="text-gray-600">{orderDetails.addressInfo?.address}</p>
            <p className="text-gray-600">
              {orderDetails.addressInfo?.city}, {orderDetails.addressInfo?.state} - {orderDetails.addressInfo?.pincode}
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              {orderDetails.addressInfo?.phone}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderDetails.cartItems?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="font-medium">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Cancel Order</CardTitle>
              <CardDescription>
                Please provide a reason for cancelling this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full p-3 border rounded-md"
                rows={4}
              />
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleCancelOrder}
                  variant="destructive"
                  className="flex-1"
                >
                  Cancel Order
                </Button>
                <Button 
                  onClick={() => setShowCancelDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Keep Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;